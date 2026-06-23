# seenpleen-site

Astro starter for SeenPleen Studio.

## Sanity to Cloudflare deploy webhook

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
