import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@sanity/client';

const ROOT_DIR = process.cwd();
const PROJECTS_PATH = path.join(ROOT_DIR, 'src', 'data', 'projects.json');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

const projectId = process.env.SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_DATASET || process.env.SANITY_STUDIO_DATASET || 'production';
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId || !token) {
  console.error('Missing SANITY_PROJECT_ID/SANITY_STUDIO_PROJECT_ID or SANITY_WRITE_TOKEN.');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2025-01-01',
  useCdn: false,
});

const assetCache = new Map();

const decodePublicImagePath = (url) => {
  if (!url || typeof url !== 'string' || !url.startsWith('/')) {
    return null;
  }

  try {
    return path.join(PUBLIC_DIR, decodeURIComponent(url).replace(/^\/+/, ''));
  } catch {
    return path.join(PUBLIC_DIR, url.replace(/^\/+/, ''));
  }
};

const uploadImageAsset = async (url) => {
  if (!url) {
    return null;
  }

  if (assetCache.has(url)) {
    return assetCache.get(url);
  }

  if (/^https?:\/\//i.test(url)) {
    console.warn(`Skipping remote image during import: ${url}`);
    return null;
  }

  const filePath = decodePublicImagePath(url);

  if (!filePath || !fs.existsSync(filePath)) {
    console.warn(`Skipping missing image during import: ${url}`);
    return null;
  }

  const asset = await client.assets.upload('image', fs.createReadStream(filePath), {
    filename: path.basename(filePath),
  });

  const reference = {
    _type: 'reference',
    _ref: asset._id,
  };

  assetCache.set(url, reference);
  return reference;
};

const imageValue = async (url, alt = '') => {
  const asset = await uploadImageAsset(url);

  if (!asset) {
    return undefined;
  }

  return {
    _type: 'image',
    asset,
    alt,
  };
};

const cleanObject = (value) =>
  Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => {
      if (entryValue === undefined || entryValue === null || entryValue === '') {
        return false;
      }

      if (Array.isArray(entryValue) && entryValue.length === 0) {
        return false;
      }

      return true;
    })
  );

const projects = JSON.parse(await fsp.readFile(PROJECTS_PATH, 'utf8'));

for (const [index, project] of projects.entries()) {
  if (!project.slug) {
    console.warn(`Skipping project without slug: ${project.title || index}`);
    continue;
  }

  console.log(`[${index + 1}/${projects.length}] Importing ${project.title}`);

  const cover = await imageValue(project.cover, project.cover_alt);
  const hero = await imageValue(project.hero, project.hero_alt);

  const galleryUploads = (
    await Promise.all((project.gallery_uploads || []).map((url) => imageValue(url)))
  ).filter(Boolean);

  const detailedGallery = (
    await Promise.all(
      (project.gallery || []).map(async (image) => {
        const imageAsset = await imageValue(image.url, image.alt);

        if (!imageAsset) {
          return null;
        }

        return cleanObject({
          _type: 'galleryImage',
          image: imageAsset,
          layout: image.layout || 'auto',
          title: image.title,
          alt: image.alt,
        });
      })
    )
  ).filter(Boolean);

  const document = cleanObject({
    _id: `project.${project.slug}`,
    _type: 'project',
    title: project.title,
    slug: {
      _type: 'slug',
      current: project.slug,
    },
    order: project.order,
    hidden: project.hidden,
    featured: project.featured,
    seo_title: project.seo_title,
    seo_description: project.seo_description,
    project_id: project.project_id,
    category: project.category,
    subcategory: project.subcategory,
    client: project.client,
    location: project.location,
    year: project.year,
    area: project.area,
    status: project.status,
    collaborators: project.collaborators,
    details: project.details,
    quotes: project.quotes,
    cover,
    hero,
    gallery_uploads: galleryUploads,
    gallery: detailedGallery,
  });

  await client.createOrReplace(document);
}

console.log('Sanity import complete.');
