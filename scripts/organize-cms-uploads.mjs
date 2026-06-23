import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const PROJECTS_PATH = path.join(ROOT_DIR, 'src', 'data', 'projects.json');
const IMAGES_DIR = path.join(ROOT_DIR, 'public', 'images');
const SOURCE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);

const changedFiles = (process.env.CHANGED_FILES || '')
  .split(/\r?\n/)
  .map((file) => file.trim())
  .filter(Boolean);

const toPosixPath = (value) => value.split(path.sep).join('/');

const isRootSourceImage = (filePath) => {
  const normalized = toPosixPath(filePath);
  const parsed = path.posix.parse(normalized);

  return (
    parsed.dir === 'public/images' &&
    SOURCE_EXTENSIONS.has(parsed.ext.toLowerCase())
  );
};

const encodePublicPath = (relativePath) =>
  `/images/${toPosixPath(relativePath)
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/')}`;

const decodeImagePath = (url) => {
  if (!url || typeof url !== 'string' || !url.startsWith('/images/')) {
    return null;
  }

  try {
    const decoded = decodeURIComponent(url.replace(/^\/images\//, ''));
    return path.normalize(decoded);
  } catch {
    return path.normalize(url.replace(/^\/images\//, ''));
  }
};

const normalizeImageUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return '';
  }

  try {
    return decodeURIComponent(url).toLowerCase();
  } catch {
    return url.toLowerCase();
  }
};

const dedupeProjectGalleryUploads = (project) => {
  if (!Array.isArray(project.gallery_uploads)) {
    return false;
  }

  const seenUrls = new Set();
  const uniqueUploads = project.gallery_uploads.filter((url) => {
    const normalizedUrl = normalizeImageUrl(url);

    if (!normalizedUrl || seenUrls.has(normalizedUrl)) {
      return false;
    }

    seenUrls.add(normalizedUrl);
    return true;
  });

  if (uniqueUploads.length === project.gallery_uploads.length) {
    return false;
  }

  project.gallery_uploads = uniqueUploads;
  return true;
};

const imageFieldsForProject = (project) => {
  const fields = [];

  if (project.cover) {
    fields.push({
      get: () => project.cover,
      set: (value) => {
        project.cover = value;
      },
    });
  }

  if (project.hero) {
    fields.push({
      get: () => project.hero,
      set: (value) => {
        project.hero = value;
      },
    });
  }

  (project.gallery_uploads || []).forEach((url, index) => {
    if (!url) {
      return;
    }

    fields.push({
      get: () => url,
      set: (value) => {
        project.gallery_uploads[index] = value;
      },
    });
  });

  (project.gallery || []).forEach((image) => {
    if (!image?.url) {
      return;
    }

    fields.push({
      get: () => image.url,
      set: (value) => {
        image.url = value;
      },
    });
  });

  return fields;
};

const uniqueTargetPath = async (targetPath) => {
  const parsed = path.parse(targetPath);

  for (let index = 0; ; index += 1) {
    const candidate =
      index === 0
        ? targetPath
        : path.join(parsed.dir, `${parsed.name}-${index + 1}${parsed.ext}`);

    try {
      await fs.access(candidate);
    } catch {
      return candidate;
    }
  }
};

const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const moveReferencedRootUpload = async (projects, changedFile) => {
  const sourcePath = path.join(ROOT_DIR, changedFile);
  const rootFilename = path.basename(changedFile);
  const matchingReferences = [];

  projects.forEach((project) => {
    imageFieldsForProject(project).forEach((field) => {
      const imagePath = decodeImagePath(field.get());

      if (imagePath && path.basename(imagePath) === rootFilename && !imagePath.includes(path.sep)) {
        matchingReferences.push({ project, field });
      }
    });
  });

  if (matchingReferences.length === 0) {
    return false;
  }

  const projectSlugs = [...new Set(matchingReferences.map(({ project }) => project.slug))];

  if (projectSlugs.length !== 1) {
    console.warn(`Skipped shared root upload: ${changedFile}`);
    return false;
  }

  const projectSlug = projectSlugs[0];
  const targetDir = path.join(IMAGES_DIR, projectSlug);
  await fs.mkdir(targetDir, { recursive: true });

  const expectedTargetPath = path.join(targetDir, rootFilename);

  if (!(await fileExists(sourcePath))) {
    if (await fileExists(expectedTargetPath)) {
      const relativeTargetPath = path.relative(IMAGES_DIR, expectedTargetPath);
      const publicPath = encodePublicPath(relativeTargetPath);

      matchingReferences.forEach(({ field }) => {
        field.set(publicPath);
      });

      console.log(`Updated reference for existing project upload: public/images/${toPosixPath(relativeTargetPath)}`);
      return true;
    }

    console.warn(`Skipped missing CMS upload: ${changedFile}`);
    return false;
  }

  const targetPath = await uniqueTargetPath(path.join(targetDir, rootFilename));
  await fs.rename(sourcePath, targetPath);

  const relativeTargetPath = path.relative(IMAGES_DIR, targetPath);
  const publicPath = encodePublicPath(relativeTargetPath);

  matchingReferences.forEach(({ field }) => {
    field.set(publicPath);
  });

  console.log(`Moved ${changedFile} -> public/images/${toPosixPath(relativeTargetPath)}`);
  return true;
};

async function main() {
  const rootUploads = changedFiles.filter(isRootSourceImage);
  const projects = JSON.parse(await fs.readFile(PROJECTS_PATH, 'utf8'));
  let movedAny = false;
  let dedupedAny = false;

  projects.forEach((project) => {
    dedupedAny = dedupeProjectGalleryUploads(project) || dedupedAny;
  });

  if (rootUploads.length > 0) {
    for (const changedFile of rootUploads) {
      movedAny = (await moveReferencedRootUpload(projects, changedFile)) || movedAny;
    }
  } else {
    console.log('No new root-level CMS uploads to organize.');
  }

  if (movedAny || dedupedAny) {
    await fs.writeFile(PROJECTS_PATH, `${JSON.stringify(projects, null, 2)}\n`);
  }

  console.log(
    movedAny || dedupedAny
      ? 'CMS upload organization complete.'
      : 'No referenced root uploads were moved.'
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
