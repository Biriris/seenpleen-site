import 'piccolore';
import { A as AstroError, I as InvalidComponentArgs, b as addAttribute, d as renderHead, e as renderSlot, a as renderTemplate, m as maybeRenderHead } from './prerender_Aor1Zf0U.mjs';
import 'clsx';

function validateArgs(args) {
  if (args.length !== 3) return false;
  if (!args[0] || typeof args[0] !== "object") return false;
  return true;
}
function baseCreateComponent(cb, moduleId, propagation) {
  const name = moduleId?.split("/").pop()?.replace(".astro", "") ?? "";
  const fn = (...args) => {
    if (!validateArgs(args)) {
      throw new AstroError({
        ...InvalidComponentArgs,
        message: InvalidComponentArgs.message(name)
      });
    }
    return cb(...args);
  };
  Object.defineProperty(fn, "name", { value: name, writable: false });
  fn.isAstroComponentFactory = true;
  fn.moduleId = moduleId;
  fn.propagation = propagation;
  return fn;
}
function createComponentWithOptions(opts) {
  const cb = baseCreateComponent(opts.factory, opts.moduleId, opts.propagation);
  return cb;
}
function createComponent(arg1, moduleId, propagation) {
  if (typeof arg1 === "function") {
    return baseCreateComponent(arg1, moduleId, propagation);
  } else {
    return createComponentWithOptions(arg1);
  }
}

const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$BaseLayout;
  const {
    title = "SeenPleen Studio | Konstantinos Kostaras",
    description = "Architecture, Interior Design & Visualization studio based in Patras, Greece."
  } = Astro2.props;
  return renderTemplate`<html lang="el"> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title><meta name="description"${addAttribute(description, "content")}>${renderHead()}</head> <body> ${renderSlot($$result, $$slots["default"])} </body></html>`;
}, "C:/Users/kosta/Documents/GitHub/seenpleen-site/src/layouts/BaseLayout.astro", void 0);

const $$Header = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<header class="site-header"> <a class="site-logo" href="/" aria-label="SeenPleen Studio home"> <span>SeenPleen</span> <span>Studio</span> </a> <nav class="site-nav" aria-label="Main navigation"> <a href="/#projects">Projects</a> <a href="/about/">About</a> <a href="/contact/">Contact</a> </nav> </header>`;
}, "C:/Users/kosta/Documents/GitHub/seenpleen-site/src/components/Header.astro", void 0);

const $$Footer = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<footer class="site-footer"> <strong>SeenPleen Studio | Konstantinos Kostaras</strong> <br>
Πλ. Γεωργίου Α' 50 | 26221 | Πάτρα
<br> <a href="mailto:kfkostaras@gmail.com">
kfkostaras@gmail.com
</a>
|
<a href="tel:+306948232696">
+30 6948 232 696
</a> </footer>`;
}, "C:/Users/kosta/Documents/GitHub/seenpleen-site/src/components/Footer.astro", void 0);

export { $$BaseLayout as $, $$Header as a, $$Footer as b, createComponent as c };
