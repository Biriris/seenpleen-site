import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT_DIR = process.cwd();
const PROJECTS_PATH = path.join(ROOT_DIR, 'src', 'data', 'projects.json');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

function imagePathFromUrl(url) {
  if (!url || !url.startsWith('/images/')) {
    return null;
  }

  const decodedUrl = decodeURIComponent(url);
  return path.join(PUBLIC_DIR, decodedUrl.replace(/^\//, ''));
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function detectLayout(url) {
  const imagePath = imagePathFromUrl(url);

  if (!imagePath || !(await pathExists(imagePath))) {
    return null;
  }

  const metadata = await sharp(imagePath, { failOn: 'none' }).metadata();

  if (!metadata.width || !metadata.height) {
    return null;
  }

  return metadata.height > metadata.width ? 'portrait' : 'landscape';
}

async function main() {
  const projects = JSON.parse(await fs.readFile(PROJECTS_PATH, 'utf8'));
  let updatedCount = 0;
  let skippedCount = 0;

  for (const project of projects) {
    if (!Array.isArray(project.gallery)) {
      continue;
    }

    for (const image of project.gallery) {
      const layout = await detectLayout(image.url);

      if (!layout) {
        skippedCount += 1;
        continue;
      }

      if (image.layout !== layout) {
        image.layout = layout;
        updatedCount += 1;
      }
    }
  }

  await fs.writeFile(PROJECTS_PATH, `${JSON.stringify(projects, null, 2)}\n`);

  console.log(`Updated ${updatedCount} gallery layout value(s).`);
  console.log(`Skipped ${skippedCount} missing or unreadable image(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
