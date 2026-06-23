import fsp from 'node:fs/promises';
import path from 'node:path';

const ADMIN_DIR = path.join(process.cwd(), 'public', 'admin');
const TEXT_EXTENSIONS = new Set(['.html', '.js', '.json', '.webmanifest']);

const patchFile = async (filePath) => {
  const extension = path.extname(filePath);

  if (!TEXT_EXTENSIONS.has(extension)) {
    return;
  }

  const source = await fsp.readFile(filePath, 'utf8');
  const patched = source.replaceAll('/static/', '/admin/static/');

  if (patched !== source) {
    await fsp.writeFile(filePath, patched);
  }
};

const walk = async (directory) => {
  const entries = await fsp.readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      await walk(entryPath);
      continue;
    }

    await patchFile(entryPath);
  }
};

await walk(ADMIN_DIR);
console.log('Patched Sanity admin asset paths.');
