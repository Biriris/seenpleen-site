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
  !(_id in path("drafts.**")) &&
  defined(hero.asset) &&
  !defined(hero_media[0])
] {
  _id,
  title,
  hero
}`);

let updatedCount = 0;

for (const project of projects) {
  await client
    .patch(project._id)
    .set({
      hero_media: [
        {
          ...project.hero,
          _key: 'legacy-hero-image',
        },
      ],
    })
    .commit();

  updatedCount += 1;
  console.log(`Migrated hero image: ${project.title || project._id}`);
}

console.log(`Migrated ${updatedCount} project hero image(s) to Hero Image / Video.`);
