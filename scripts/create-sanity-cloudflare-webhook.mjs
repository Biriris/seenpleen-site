import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const WEBHOOK_NAME = 'Cloudflare Pages Deploy';

function loadEnvFile(filename) {
  const filePath = path.join(ROOT_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
      continue;
    }

    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=').replace(/^["']|["']$/g, '');

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile('.env');
loadEnvFile('.env.local');

const projectId = process.env.SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_DATASET || process.env.SANITY_STUDIO_DATASET || 'production';
const apiVersionValue = process.env.SANITY_API_VERSION || '2025-01-01';
const apiVersion = apiVersionValue.startsWith('v') ? apiVersionValue : `v${apiVersionValue}`;
const token = process.env.SANITY_WRITE_TOKEN;
const deployHookUrl =
  process.env.CLOUDFLARE_DEPLOY_HOOK_URL ||
  process.env.SANITY_DEPLOY_HOOK_URL;
const shouldReplace = process.argv.includes('--replace');

const missing = [
  ['SANITY_PROJECT_ID', projectId],
  ['SANITY_WRITE_TOKEN', token],
  ['CLOUDFLARE_DEPLOY_HOOK_URL', deployHookUrl],
].filter(([, value]) => !value);

if (missing.length > 0) {
  console.error(`Missing required env value(s): ${missing.map(([key]) => key).join(', ')}`);
  console.error('Add them to .env.local, then run: npm run sanity:create-deploy-webhook');
  process.exit(1);
}

if (!/^https:\/\/api\.cloudflare\.com\/client\/v4\//.test(deployHookUrl)) {
  console.error('CLOUDFLARE_DEPLOY_HOOK_URL does not look like a Cloudflare deploy hook URL.');
  process.exit(1);
}

const endpoint = `https://${projectId}.api.sanity.io/${apiVersion}/hooks/projects/${projectId}`;
const authHeaders = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
};

async function sanityRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...authHeaders,
      ...options.headers,
    },
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = body?.message || body?.error || text || response.statusText;
    throw new Error(`${response.status} ${response.statusText}: ${message}`);
  }

  return body;
}

const existingHooks = await sanityRequest(endpoint);
const matchingHooks = (existingHooks?.items || existingHooks || []).filter(
  (hook) => hook.name === WEBHOOK_NAME && !hook.deletedAt
);

if (matchingHooks.length > 0 && !shouldReplace) {
  console.log(`Webhook "${WEBHOOK_NAME}" already exists.`);
  console.log('Run with -- --replace if you want to recreate it with the current deploy hook URL.');
  process.exit(0);
}

if (matchingHooks.length > 0 && shouldReplace) {
  for (const hook of matchingHooks) {
    await sanityRequest(`${endpoint}/${hook.id}`, {
      method: 'DELETE',
    });
    console.log(`Deleted existing webhook: ${hook.id}`);
  }
}

const webhook = await sanityRequest(endpoint, {
  method: 'POST',
  body: JSON.stringify({
    type: 'document',
    name: WEBHOOK_NAME,
    url: deployHookUrl,
    dataset,
    description: 'Triggers a Cloudflare Pages rebuild when published project content changes.',
    rule: {
      on: ['create', 'update', 'delete'],
      filter: '_type == "project"',
      projection: '{_id, _type, slug, title}',
    },
    apiVersion: apiVersionValue,
    httpMethod: 'POST',
    includeDrafts: false,
    includeAllVersions: false,
    isDisabledByUser: false,
  }),
});

console.log(`Created webhook "${WEBHOOK_NAME}" for dataset "${dataset}".`);
console.log(`Webhook id: ${webhook.id}`);
