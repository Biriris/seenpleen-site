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
