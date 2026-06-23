import localProjects from '../data/projects.json';
import { hasSanityConfig, sanityClient } from './sanity';

const projectQuery = `*[_type == "project"] | order(coalesce(order, 999999) asc, title asc) {
  title,
  "slug": slug.current,
  order,
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
    return localProjects;
  }

  try {
    const sanityProjects = await sanityClient.fetch(projectQuery);

    if (!Array.isArray(sanityProjects) || sanityProjects.length === 0) {
      return localProjects;
    }

    return sanityProjects.map(cleanProject);
  } catch (error) {
    console.warn('Falling back to local projects.json because Sanity fetch failed.', error);
    return localProjects;
  }
}
