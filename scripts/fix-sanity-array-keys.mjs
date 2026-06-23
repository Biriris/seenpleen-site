import { getCliClient } from 'sanity/cli';

const client = getCliClient({ apiVersion: '2025-01-01' });

const slugifyKey = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

const uniqueKey = (usedKeys, ...parts) => {
  const baseKey = slugifyKey(parts.filter(Boolean).join('-')) || 'item';
  let key = baseKey;
  let index = 2;

  while (usedKeys.has(key)) {
    key = `${baseKey}-${index}`;
    index += 1;
  }

  usedKeys.add(key);
  return key;
};

const withArrayKeys = (items, keyParts) => {
  const usedKeys = new Set();

  return (items || []).map((item, index) => {
    const currentKey = item?._key;

    if (currentKey && !usedKeys.has(currentKey)) {
      usedKeys.add(currentKey);
      return item;
    }

    return {
      ...item,
      _key: uniqueKey(usedKeys, ...keyParts(item, index)),
    };
  });
};

const projects = await client.fetch(`*[_type == "project"]{
  _id,
  title,
  slug,
  quotes,
  gallery_uploads,
  gallery
}`);

let changedCount = 0;

for (const project of projects) {
  const slug = project.slug?.current || project._id;
  const nextQuotes = withArrayKeys(project.quotes, (quote, index) => [
    'quote',
    slug,
    quote?.quote,
    index,
  ]);
  const nextGalleryUploads = withArrayKeys(project.gallery_uploads, (image, index) => [
    'upload',
    slug,
    image?.asset?._ref,
    index,
  ]);
  const nextGallery = withArrayKeys(project.gallery, (image, index) => [
    'gallery',
    slug,
    image?.image?.asset?._ref,
    image?.title,
    index,
  ]);

  const changed =
    JSON.stringify(project.quotes || []) !== JSON.stringify(nextQuotes) ||
    JSON.stringify(project.gallery_uploads || []) !== JSON.stringify(nextGalleryUploads) ||
    JSON.stringify(project.gallery || []) !== JSON.stringify(nextGallery);

  if (!changed) {
    continue;
  }

  await client
    .patch(project._id)
    .set({
      quotes: nextQuotes,
      gallery_uploads: nextGalleryUploads,
      gallery: nextGallery,
    })
    .commit();

  changedCount += 1;
  console.log(`Fixed array keys: ${project.title || project._id}`);
}

console.log(`Sanity array key repair complete. Updated ${changedCount} project(s).`);
