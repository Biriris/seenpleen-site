import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@sanity/client';
import { LexoRank } from 'lexorank';

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
const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_READ_TOKEN;

if (!token) {
  console.error('Missing SANITY_WRITE_TOKEN in .env.local.');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2025-06-27',
  useCdn: false,
});

const projects = await client.fetch(`*[
  _type == "project" &&
  !(_id in path("drafts.**"))
] | order(coalesce(order, 999999) asc, title asc) {
  _id,
  title,
  order,
  orderRank
}`);

if (!Array.isArray(projects) || projects.length === 0) {
  console.log('No projects found.');
  process.exit(0);
}

let rank = LexoRank.middle();
let transaction = client.transaction();

for (const project of projects) {
  rank = rank.genNext();
  const orderRank = rank.toString();

  transaction = transaction.patch(project._id, (patch) =>
    patch.set({
      orderRank,
    })
  );

  console.log(`${project.title || project._id}: ${orderRank}`);
}

await transaction.commit();

console.log(`Migrated ${projects.length} project(s) to orderRank.`);
