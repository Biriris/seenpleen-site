import { c as createComponent, $ as $$BaseLayout, a as $$Header, b as $$Footer } from './Footer_8OSlH1gV.mjs';
import 'piccolore';
import { r as renderComponent, a as renderTemplate, m as maybeRenderHead } from './prerender_u-m2x1ls.mjs';

const $$Contact = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Contact | SeenPleen Studio" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", $$Header, {})} ${maybeRenderHead()}<main class="studio-page"> <section class="studio-page-hero"> <p class="studio-page-kicker">Contact</p> <h1>
For project enquiries, collaborations or architectural visualization work, get in touch.
</h1> </section> <section class="studio-contact-grid"> <div class="studio-contact-block"> <span>Email</span> <a href="mailto:kfkostaras@gmail.com">kfkostaras@gmail.com</a> </div> <div class="studio-contact-block"> <span>Phone</span> <a href="tel:+306948232696">+30 6948 232 696</a> </div> <div class="studio-contact-block"> <span>Address</span> <p>
Πλ. Γεωργίου Α' 50<br>
26221 Πάτρα<br>
Greece
</p> </div> <div class="studio-contact-block"> <span>Social</span> <a href="https://www.instagram.com/seenpleen_studio/" target="_blank" rel="noreferrer">
Instagram
</a> <a href="#" target="_blank" rel="noreferrer">
Facebook
</a> </div> </section> </main> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
}, "C:/Users/kosta/Documents/GitHub/seenpleen-site/src/pages/contact.astro", void 0);

const $$file = "C:/Users/kosta/Documents/GitHub/seenpleen-site/src/pages/contact.astro";
const $$url = "/contact";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Contact,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
