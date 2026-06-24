import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@sanity/client';

const ROOT_DIR = process.cwd();

function loadEnvFile(filename) {
  const filePath = path.join(ROOT_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
      continue;
    }

    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=').replace(/^["']|["']$/g, '');

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

const slugifyKey = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

const uniqueKey = (usedKeys, ...parts) => {
  const baseKey = slugifyKey(parts.filter(Boolean).join('-')) || 'image';
  let key = baseKey;
  let index = 2;

  while (usedKeys.has(key)) {
    key = `${baseKey}-${index}`;
    index += 1;
  }

  usedKeys.add(key);
  return key;
};

const assetRef = (image) => image?.asset?._ref || image?.asset?._id || '';

loadEnvFile('.env');
loadEnvFile('.env.local');

const projectId = process.env.SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID || 'xfhp705d';
const dataset = process.env.SANITY_DATASET || process.env.SANITY_STUDIO_DATASET || 'production';
const token = process.env.SANITY_WRITE_TOKEN;

if (!token) {
  console.error('Missing SANITY_WRITE_TOKEN in .env.local.');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2025-01-01',
  useCdn: false,
});

const projects = await client.fetch(`*[
  _type == "project" &&
  !(_id in path("drafts.**"))
] {
  _id,
  title,
  slug,
  gallery_uploads,
  gallery
}`);

let updatedCount = 0;

for (const project of projects) {
  const slug = project.slug?.current || project._id;
  const usedKeys = new Set();
  const usedAssetRefs = new Set();
  const mergedUploads = [];

  for (const [index, image] of (project.gallery_uploads || []).entries()) {
    const ref = assetRef(image);

    if (!ref || usedAssetRefs.has(ref)) {
      continue;
    }

    usedAssetRefs.add(ref);
    mergedUploads.push({
      ...image,
      _key: image._key && !usedKeys.has(image._key)
        ? image._key
        : uniqueKey(usedKeys, 'upload', slug, ref, index),
    });

    if (image._key) {
      usedKeys.add(image._key);
    }
  }

  let movedCount = 0;

  for (const [index, galleryItem] of (project.gallery || []).entries()) {
    const image = galleryItem?.image;
    const ref = assetRef(image);

    if (!ref || usedAssetRefs.has(ref)) {
      continue;
    }

    usedAssetRefs.add(ref);
    movedCount += 1;
    mergedUploads.push({
      _key: uniqueKey(usedKeys, 'gallery-upload', slug, ref, index),
      _type: 'image',
      asset: image.asset,
      alt: galleryItem.alt || image.alt || galleryItem.title,
    });
  }

  if (movedCount === 0 && (project.gallery || []).length === 0) {
    continue;
  }

  await client
    .patch(project._id)
    .set({
      gallery_uploads: mergedUploads,
      gallery: [],
    })
    .commit();

  updatedCount += 1;
  console.log(`${project.title || project._id}: moved ${movedCount} detailed image(s) into bulk gallery.`);
}

console.log(`Merged detailed galleries for ${updatedCount} project(s).`);
