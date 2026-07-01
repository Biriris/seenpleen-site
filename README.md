# seenpleen-site

Astro starter for SeenPleen Studio.

## Sanity to Cloudflare deploy webhook

Set these environment variables in Cloudflare Pages:

```bash
SANITY_PROJECT_ID=xfhp705d
SANITY_DATASET=production
SANITY_API_VERSION=2025-01-01
SANITY_READ_TOKEN=...
SANITY_STUDIO_PROJECT_ID=xfhp705d
SANITY_STUDIO_DATASET=production
```

Add the Cloudflare Pages deploy hook URL to `.env.local`:

```bash
CLOUDFLARE_DEPLOY_HOOK_URL=https://api.cloudflare.com/client/v4/...
```

Then create the Sanity webhook:

```bash
npm run sanity:create-deploy-webhook
```

To recreate an existing webhook with the same name:

```bash
npm run sanity:create-deploy-webhook -- --replace
```

## Cloudflare build commands

Use this build command in Cloudflare Pages for faster deploys:

```bash
npm run build:cloudflare
```

It reuses the cached `/admin` Studio output when possible, and rebuilds it when the cache is missing or Studio-related files changed.

Use the full build locally when the Sanity Studio or `/admin` changes:

```bash
npm run build
```

Use the site-only build only for local checks that do not need `/admin`:

```bash
npm run build:site
```
