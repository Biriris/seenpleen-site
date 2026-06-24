import { createClient } from '@sanity/client';

const buildEnv = typeof process !== 'undefined' ? process.env : {};
const env = (name) => import.meta.env[name] || buildEnv[name];

export const sanityConfig = {
  projectId:
    env('SANITY_PROJECT_ID') ||
    env('SANITY_STUDIO_PROJECT_ID') ||
    env('PUBLIC_SANITY_PROJECT_ID'),
  dataset:
    env('SANITY_DATASET') ||
    env('SANITY_STUDIO_DATASET') ||
    env('PUBLIC_SANITY_DATASET') ||
    'production',
  apiVersion: env('SANITY_API_VERSION') || '2025-01-01',
  token:
    env('SANITY_READ_TOKEN') ||
    env('SANITY_WRITE_TOKEN') ||
    env('SANITY_AUTH_TOKEN'),
  useCdn: false,
};

export const hasSanityConfig = Boolean(sanityConfig.projectId && sanityConfig.dataset);
export const hasSanityToken = Boolean(sanityConfig.token);

export const sanityClient = hasSanityConfig ? createClient(sanityConfig) : null;
