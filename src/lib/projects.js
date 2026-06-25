import localProjects from '../data/projects.json';
import { hasSanityConfig, hasSanityToken, sanityClient } from './sanity';

const projectQuery = `*[_type == "project"] | order(defined(orderRank) desc, orderRank asc, coalesce(order, 999999) asc, title asc) {
  title,
  "slug": slug.current,
  order,
  orderRank,
  hidden,
  featured,
  seo_title,
  seo_description,
  project_id,
  category,
  subcategory,
  client,
  location,
  year,
  area,
  status,
  collaborators,
  details,
  quotes,
  "cover": cover.asset->url,
  "cover_alt": cover.alt,
  "hero": hero.asset->url,
  "hero_alt": hero.alt,
  "hero_media": hero_media[0] {
    _type,
    alt,
    "url": asset->url,
    "mimeType": asset->mimeType
  },
  "gallery_uploads": gallery_uploads[].asset->url,
  "gallery": gallery[] {
    "url": image.asset->url,
    layout,
    title,
    alt
  }
}`;

const cleanProject = (project) => ({
  ...project,
  slug: project.slug || '',
  gallery_uploads: (project.gallery_uploads || []).filter(Boolean),
  gallery: (project.gallery || []).filter((image) => image?.url),
});

export async function getProjects() {
  if (!hasSanityConfig || !sanityClient) {
    console.warn('Using local projects.json because Sanity project configuration is missing.');
    return localProjects;
  }

  if (!hasSanityToken) {
    console.warn('Using local projects.json because SANITY_READ_TOKEN is missing.');
    return localProjects;
  }

  try {
    const sanityProjects = await sanityClient.fetch(projectQuery);

    if (!Array.isArray(sanityProjects) || sanityProjects.length === 0) {
      console.warn('Using local projects.json because Sanity returned no projects.');
      return localProjects;
    }

    console.log(`Loaded ${sanityProjects.length} project(s) from Sanity.`);
    return sanityProjects.map(cleanProject);
  } catch (error) {
    console.warn('Falling back to local projects.json because Sanity fetch failed.', error);
    return localProjects;
  }
}
