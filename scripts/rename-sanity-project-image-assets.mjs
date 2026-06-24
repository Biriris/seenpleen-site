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

const projectName = (project) => {
  const source = project.slug?.current || project.title || project._id || 'project';

  return source
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'project';
};

const extensionForAsset = (asset) => {
  if (asset?.extension) {
    return asset.extension.toLowerCase();
  }

  const mimeExtension = asset?.mimeType?.split('/')?.[1];

  if (mimeExtension) {
    return mimeExtension.replace('jpeg', 'jpg').toLowerCase();
  }

  return 'jpg';
};

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
] | order(defined(orderRank) desc, orderRank asc, coalesce(order, 999999) asc, title asc) {
  _id,
  title,
  slug,
  cover {
    asset-> {
      _id,
      extension,
      mimeType,
      originalFilename
    }
  },
  hero {
    asset-> {
      _id,
      extension,
      mimeType,
      originalFilename
    }
  },
  gallery_uploads[] {
    asset-> {
      _id,
      extension,
      mimeType,
      originalFilename
    }
  },
  gallery[] {
    image {
      asset-> {
        _id,
        extension,
        mimeType,
        originalFilename
      }
    }
  }
}`);

let changedCount = 0;

for (const project of projects) {
  const seenAssetIds = new Set();
  const assets = [
    project.cover,
    project.hero,
    ...(project.gallery_uploads || []),
    ...(project.gallery || []).map((item) => item.image),
  ]
    .map((image) => image?.asset)
    .filter((asset) => asset?._id)
    .filter((asset) => {
      if (seenAssetIds.has(asset._id)) {
        return false;
      }

      seenAssetIds.add(asset._id);
      return true;
    });

  const baseName = projectName(project);
  let transaction = client.transaction();
  let projectChangeCount = 0;

  assets.forEach((asset, index) => {
    const filename = `${baseName}_${index + 1}.${extensionForAsset(asset)}`;

    if (asset.originalFilename === filename) {
      return;
    }

    transaction = transaction.patch(asset._id, (patch) =>
      patch.set({
        originalFilename: filename,
      })
    );
    projectChangeCount += 1;
  });

  if (projectChangeCount > 0) {
    await transaction.commit();
    changedCount += projectChangeCount;
    console.log(`${project.title || project._id}: renamed ${projectChangeCount} asset(s).`);
  }
}

console.log(`Renamed ${changedCount} project image asset filename(s).`);
