import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT_DIR = process.cwd();
const IMAGES_DIR = path.join(ROOT_DIR, 'public', 'images');
const SOURCE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);
const RESPONSIVE_WIDTHS = [480, 768, 1024, 1440, 1920, 2560];

const AVIF_QUALITY = 58;
const WEBP_QUALITY = 76;

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...await walk(fullPath));
      continue;
    }

    if (!entry.isFile()) continue;

    const ext = path.extname(entry.name).toLowerCase();
    if (SOURCE_EXTENSIONS.has(ext)) {
      files.push(fullPath);
    }
  }

  return files;
}

function outputPathFor(sourcePath, suffix, format) {
  const parsed = path.parse(sourcePath);
  return path.join(parsed.dir, `${parsed.name}${suffix}.${format}`);
}

async function optimizeImage(sourcePath) {
  const image = sharp(sourcePath, { failOn: 'none' }).rotate();
  const metadata = await image.metadata();
  const originalWidth = metadata.width || 0;

  if (!originalWidth) {
    console.warn(`Skipped unreadable image: ${sourcePath}`);
    return;
  }

  const widths = RESPONSIVE_WIDTHS.filter((width) => width < originalWidth);
  widths.push(originalWidth);

  const uniqueWidths = [...new Set(widths)].sort((a, b) => a - b);

  for (const width of uniqueWidths) {
    const suffix = width === originalWidth ? '' : `-${width}`;
    const avifPath = outputPathFor(sourcePath, suffix, 'avif');
    const webpPath = outputPathFor(sourcePath, suffix, 'webp');

    if (!(await pathExists(avifPath))) {
      await sharp(sourcePath, { failOn: 'none' })
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .avif({ quality: AVIF_QUALITY, effort: 6 })
        .toFile(avifPath);
    }

    if (!(await pathExists(webpPath))) {
      await sharp(sourcePath, { failOn: 'none' })
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY, effort: 5 })
        .toFile(webpPath);
    }
  }
}

async function main() {
  if (!(await pathExists(IMAGES_DIR))) {
    console.error('Missing public/images directory.');
    process.exit(1);
  }

  const files = await walk(IMAGES_DIR);
  console.log(`Found ${files.length} source images.`);

  for (const [index, file] of files.entries()) {
    const relativePath = path.relative(ROOT_DIR, file);
    console.log(`[${index + 1}/${files.length}] Optimizing ${relativePath}`);
    await optimizeImage(file);
  }

  console.log('Image optimization complete.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
