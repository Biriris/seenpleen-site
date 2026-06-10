import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const projectsPath = path.join(root, "src", "data", "projects.json");
const imagesDir = path.join(root, "public", "images");

const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const projects = JSON.parse(fs.readFileSync(projectsPath, "utf8"));

function getImagesForSlug(slug) {
  const folder = path.join(imagesDir, slug);

  if (!fs.existsSync(folder)) {
    console.warn(`Missing folder for slug: ${slug}`);
    return [];
  }

  return fs
    .readdirSync(folder)
    .filter((file) => imageExtensions.has(path.extname(file).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((file) => ({
      url: `/images/${slug}/${encodeURIComponent(file)}`,
      title: file,
      alt: "",
    }));
}

for (const project of projects) {
  const images = getImagesForSlug(project.slug);

  project.gallery = images;
  project.cover = images[0]?.url || "";
}

fs.writeFileSync(projectsPath, JSON.stringify(projects, null, 2) + "\n");

console.log(`Updated ${projects.length} projects.`);