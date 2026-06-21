import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const projectRoot = process.cwd();
const imagesDir = path.join(projectRoot, 'public', 'images');
const supportedExtensions = new Set(['.jpg', '.jpeg', '.png']);

const maxWidth = 2560;
const webpQuality = 82;
const avifQuality = 62;

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function getFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...await getFiles(fullPath));
      continue;
    }

    if (!entry.isFile()) continue;

    const ext = path.extname(entry.name).toLowerCase();

    if (supportedExtensions.has(ext)) {
      files.push(fullPath);
    }
  }

  return files;
}

async function outputIsFresh(sourcePath, outputPath) {
  if (!await pathExists(outputPath)) return false;

  const sourceStat = await fs.stat(sourcePath);
  const outputStat = await fs.stat(outputPath);

  return outputStat.mtimeMs >= sourceStat.mtimeMs;
}

async function optimizeImage(sourcePath) {
  const parsed = path.parse(sourcePath);
  const avifPath = path.join(parsed.dir, `${parsed.name}.avif`);
  const webpPath = path.join(parsed.dir, `${parsed.name}.webp`);

  const image = sharp(sourcePath, {
    failOn: 'none',
    limitInputPixels: false,
  }).rotate();

  const metadata = await image.metadata();
  const shouldResize = metadata.width && metadata.width > maxWidth;

  const pipeline = image.clone().resize({
    width: shouldResize ? maxWidth : undefined,
    withoutEnlargement: true,
  });

  const tasks = [];

  if (!await outputIsFresh(sourcePath, avifPath)) {
    tasks.push(
      pipeline
        .clone()
        .avif({ quality: avifQuality, effort: 6 })
        .toFile(avifPath)
    );
  }

  if (!await outputIsFresh(sourcePath, webpPath)) {
    tasks.push(
      pipeline
        .clone()
        .webp({ quality: webpQuality, effort: 6 })
        .toFile(webpPath)
    );
  }

  await Promise.all(tasks);

  return {
    sourcePath,
    avifPath,
    webpPath,
    skipped: tasks.length === 0,
  };
}

async function main() {
  if (!await pathExists(imagesDir)) {
    console.error(`Images folder not found: ${imagesDir}`);
    process.exit(1);
  }

  const files = await getFiles(imagesDir);

  if (files.length === 0) {
    console.log('No JPG, JPEG, or PNG images found in public/images.');
    return;
  }

  console.log(`Found ${files.length} source images.`);
  console.log('Generating AVIF and WebP versions...');

  let optimizedCount = 0;
  let skippedCount = 0;

  for (const file of files) {
    try {
      const result = await optimizeImage(file);
      const relative = path.relative(projectRoot, result.sourcePath);

      if (result.skipped) {
        skippedCount += 1;
        console.log(`Skipped:   ${relative}`);
      } else {
        optimizedCount += 1;
        console.log(`Optimized: ${relative}`);
      }
    } catch (error) {
      console.error(`Failed: ${path.relative(projectRoot, file)}`);
      console.error(error.message);
    }
  }

  console.log('');
  console.log(`Done. Optimized: ${optimizedCount}. Skipped fresh files: ${skippedCount}.`);
  console.log('Original JPG/PNG files were not modified.');
}

main();
