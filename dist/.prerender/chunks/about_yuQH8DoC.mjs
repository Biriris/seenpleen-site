import { c as createComponent, $ as $$BaseLayout, a as $$Header, b as $$Footer } from './Footer_CO9e2xKz.mjs';
import 'piccolore';
import { r as renderComponent, a as renderTemplate, m as maybeRenderHead } from './prerender_zTfVk3HF.mjs';

const $$About = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "About | SeenPleen Studio" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", $$Header, {})} ${maybeRenderHead()}<main class="studio-page"> <section class="studio-page-hero"> <p class="studio-page-kicker">About</p> <h1>
SeenPleen Studio is an architecture, interior design and visualization studio based in Patras, Greece.
</h1> </section> <section class="studio-page-content"> <div class="studio-page-label"> <span>Studio</span> </div> <div class="studio-page-text"> <p>
SeenPleen Studio | Konstantinos Kostaras works across architectural design,
          interior design and architectural visualization, developing spaces with clarity,
          proportion and atmosphere.
</p> <p>
The studio approaches each project through a careful balance of concept,
          materiality, function and visual communication.
</p> </div> </section> <section class="studio-services"> <div class="studio-page-label"> <span>Services</span> </div> <div class="studio-services-list"> <p>Architectural Design</p> <p>Interior Design</p> <p>3D Visualization</p> <p>Construction Documentation</p> <p>Building Permit Studies</p> <p>Renovations</p> </div> </section> </main> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
}, "C:/Users/kosta/Documents/GitHub/seenpleen-site/src/pages/about.astro", void 0);

const $$file = "C:/Users/kosta/Documents/GitHub/seenpleen-site/src/pages/about.astro";
const $$url = "/about";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$About,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
