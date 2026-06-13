import fs from 'node:fs';
import path from 'node:path';

const imagesRoot = path.join(process.cwd(), 'public', 'images');
const outputFile = path.join(process.cwd(), 'src', 'data', 'projects.json');

const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

function findProjectFolders(dir) {
  const results = [];

  if (!fs.existsSync(dir)) {
    return results;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  const hasInfoJson = entries.some(
    (entry) => entry.isFile() && entry.name === 'info.json'
  );

  if (hasInfoJson) {
    results.push(dir);
    return results;
  }

  for (const entry of entries) {
    if (entry.isDirectory()) {
      results.push(...findProjectFolders(path.join(dir, entry.name)));
    }
  }

  return results;
}

function toPublicPath(filePath) {
  return filePath
    .replace(path.join(process.cwd(), 'public'), '')
    .replaceAll(path.sep, '/');
}

const projectFolders = findProjectFolders(imagesRoot);

const projects = projectFolders.map((folderPath) => {
  const infoPath = path.join(folderPath, 'info.json');
  const info = JSON.parse(fs.readFileSync(infoPath, 'utf8'));

  const folderName = path.basename(folderPath);

  const images = fs
    .readdirSync(folderPath)
    .filter((file) => imageExtensions.includes(path.extname(file).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  if (images.length === 0) {
    throw new Error(`No images found in ${folderPath}`);
  }

  const coverFile = info.cover || images[0];

  return {
    slug: info.slug || folderName,
    title: info.title || folderName,
    project_id: info.project_id || '',
    year: info.year || '',
    location: info.location || '',
    services: info.services || [],
    cover: toPublicPath(path.join(folderPath, coverFile)),
    details: info.details || '',
    gallery: images.map((image) => ({
      url: toPublicPath(path.join(folderPath, image)),
      alt: info.title || folderName,
    })),
  };
});

fs.writeFileSync(outputFile, JSON.stringify(projects, null, 2));

console.log(`Generated ${projects.length} projects.`);