import { c as createComponent, $ as $$BaseLayout, a as $$Header, b as $$Footer } from './Footer_8OSlH1gV.mjs';
import 'piccolore';
import { c as createRenderInstruction, r as renderComponent, a as renderTemplate, m as maybeRenderHead, b as addAttribute } from './prerender_u-m2x1ls.mjs';
import { p as projects } from './projects_NVcIhtQ2.mjs';

async function renderScript(result, id) {
  const inlined = result.inlinedScripts.get(id);
  let content = "";
  if (inlined != null) {
    if (inlined) {
      content = `<script type="module">${inlined}</script>`;
    }
  } else {
    const resolved = await result.resolve(id);
    content = `<script type="module" src="${result.userAssetsBase ? (result.base === "/" ? "" : result.base) + result.userAssetsBase : ""}${resolved}"></script>`;
  }
  return createRenderInstruction({ type: "script", id, content });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  const visibleProjects = projects.filter((project) => !project.hidden).sort((a, b) => {
    const orderA = Number.isInteger(a.order) ? a.order : Number.POSITIVE_INFINITY;
    const orderB = Number.isInteger(b.order) ? b.order : Number.POSITIVE_INFINITY;
    return orderA - orderB;
  });
  const categories = [
    ...new Set(visibleProjects.map((project) => project.category).filter(Boolean))
  ];
  const featuredProject = visibleProjects.find((project) => project.featured) || visibleProjects.find((project) => project.slug === "the-matchbox-house") || visibleProjects[0];
  const featuredImage = featuredProject?.hero || featuredProject?.cover;
  const featuredAlt = featuredProject?.hero_alt || featuredProject?.cover_alt || featuredProject?.title;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "SeenPleen Studio" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", $$Header, {})} ${featuredProject && featuredImage && renderTemplate`${maybeRenderHead()}<section class="home-hero is-revealed"> <img${addAttribute(featuredImage, "src")}${addAttribute(featuredAlt, "alt")} class="home-hero-image" loading="eager"> <div class="home-hero-overlay"> <a${addAttribute(`/projects/${featuredProject.slug}/`, "href")} class="home-hero-link"> ${featuredProject.title} </a> </div> </section>`}<section class="projects-section" id="projects"> <div class="projects-heading reveal-item"> <div> <span>Selected Works</span> <h2>Projects</h2> </div> ${categories.length > 0 && renderTemplate`<div class="projects-filters" aria-label="Project filters"> <button type="button" class="projects-filter is-active" data-filter="all">
All
</button> ${categories.map((category) => renderTemplate`<button type="button" class="projects-filter"${addAttribute(category, "data-filter")}> ${category} </button>`)} </div>`} </div> <div class="projects-grid"> ${visibleProjects.map((p, index) => {
    const hoverMeta = [
      p.category,
      p.subcategory,
      p.year
    ].filter(Boolean);
    return renderTemplate`<a class="project-card reveal-item"${addAttribute(`/projects/${p.slug}/`, "href")}${addAttribute(p.category || "", "data-category")}${addAttribute(`--reveal-delay: ${Math.min(index * 45, 360)}ms`, "style")}> <div class="project-card-image"> ${p.cover ? renderTemplate`<img${addAttribute(p.cover, "src")}${addAttribute(p.cover_alt || p.title, "alt")}${addAttribute(index === 0 ? "eager" : "lazy", "loading")}>` : renderTemplate`<div class="project-card-placeholder"></div>`} <div class="project-card-hover"> <div class="project-card-hover-inner"> <h3>${p.title}</h3> ${hoverMeta.length > 0 && renderTemplate`<p>${hoverMeta.join(" / ")}</p>`} </div> </div> </div> </a>`;
  })} </div> </section> ${renderComponent($$result2, "Footer", $$Footer, {})} ${renderScript($$result2, "C:/Users/kosta/Documents/GitHub/seenpleen-site/src/pages/index.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "C:/Users/kosta/Documents/GitHub/seenpleen-site/src/pages/index.astro", void 0);

const $$file = "C:/Users/kosta/Documents/GitHub/seenpleen-site/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
