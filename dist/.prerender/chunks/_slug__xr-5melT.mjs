import { c as createComponent, $ as $$BaseLayout, a as $$Header, b as $$Footer } from './Footer_8OSlH1gV.mjs';
import 'piccolore';
import { r as renderComponent, a as renderTemplate, m as maybeRenderHead, b as addAttribute } from './prerender_u-m2x1ls.mjs';
import { p as projects } from './projects_NVcIhtQ2.mjs';

function getStaticPaths() {
  return visibleProjects.map((p, index) => ({
    params: { slug: p.slug },
    props: {
      project: p,
      previousProject: visibleProjects[index - 1] || visibleProjects[visibleProjects.length - 1],
      nextProject: visibleProjects[index + 1] || visibleProjects[0]
    }
  }));
}
const $$slug = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$slug;
  projects.filter((project2) => !project2.hidden).sort((a, b) => {
    const orderA = Number.isInteger(a.order) ? a.order : Number.POSITIVE_INFINITY;
    const orderB = Number.isInteger(b.order) ? b.order : Number.POSITIVE_INFINITY;
    return orderA - orderB;
  });
  const { project, previousProject, nextProject } = Astro2.props;
  const heroImage = project.hero || project.cover || project.gallery?.[0]?.url;
  const heroAlt = project.hero_alt || project.cover_alt || project.title;
  const gallery = project.gallery || [];
  const detailParagraphs = project.details ? project.details.split("\n").filter((paragraph) => paragraph.trim().length > 0) : [];
  const projectMeta = [
    { label: "Category", value: project.category },
    { label: "Subcategory", value: project.subcategory },
    { label: "Client", value: project.client },
    { label: "Location", value: project.location },
    { label: "Year", value: project.year },
    { label: "Area", value: project.area },
    { label: "Status", value: project.status }
  ].filter((item) => item.value);
  const pageTitle = project.seo_title || project.title;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": `${pageTitle} | SeenPleen Studio` }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", $$Header, {})} ${maybeRenderHead()}<main class="project-page"> <section class="project-hero"> ${heroImage ? renderTemplate`<img${addAttribute(heroImage, "src")}${addAttribute(heroAlt, "alt")} loading="eager">` : renderTemplate`<div class="project-hero-placeholder"></div>`} </section> <section class="project-intro"> <div class="project-title-block"> <p class="project-kicker">Project</p> <h1>${project.title}</h1> </div> <div class="project-info"> ${project.project_id && renderTemplate`<p class="project-meta-line">${project.project_id}</p>`} ${projectMeta.length > 0 && renderTemplate`<dl class="project-meta-list"> ${projectMeta.map((item) => renderTemplate`<div class="project-meta-item"> <dt>${item.label}</dt> <dd>${item.value}</dd> </div>`)} </dl>`} ${detailParagraphs.length > 0 ? renderTemplate`<div class="project-description"> ${detailParagraphs.map((paragraph) => renderTemplate`<p>${paragraph}</p>`)} </div>` : renderTemplate`<div class="project-description"> <p>Project information will be added soon.</p> </div>`} </div> </section> ${gallery.length > 0 && renderTemplate`<section class="project-gallery"> ${gallery.map((img, index) => renderTemplate`<figure${addAttribute(`project-gallery-item project-gallery-item-${index % 6 + 1}`, "class")}> <img${addAttribute(img.url, "src")}${addAttribute(img.alt || project.title, "alt")}${addAttribute(index < 2 ? "eager" : "lazy", "loading")}> </figure>`)} </section>`} <nav class="project-navigation" aria-label="Project navigation"> <a${addAttribute(`/projects/${previousProject.slug}/`, "href")}> <span>Previous Project</span> <strong>${previousProject.title}</strong> </a> <a${addAttribute(`/projects/${nextProject.slug}/`, "href")}> <span>Next Project</span> <strong>${nextProject.title}</strong> </a> </nav> </main> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
}, "C:/Users/kosta/Documents/GitHub/seenpleen-site/src/pages/projects/[slug].astro", void 0);

const $$file = "C:/Users/kosta/Documents/GitHub/seenpleen-site/src/pages/projects/[slug].astro";
const $$url = "/projects/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  getStaticPaths,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
