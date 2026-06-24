import { createClient } from '@sanity/client';

export const sanityConfig = {
  projectId:
    import.meta.env.SANITY_PROJECT_ID ||
    import.meta.env.PUBLIC_SANITY_PROJECT_ID,
  dataset:
    import.meta.env.SANITY_DATASET ||
    import.meta.env.PUBLIC_SANITY_DATASET ||
    'production',
  apiVersion: import.meta.env.SANITY_API_VERSION || '2025-01-01',
  token:
    import.meta.env.SANITY_READ_TOKEN ||
    import.meta.env.SANITY_WRITE_TOKEN,
  useCdn: false,
};

export const hasSanityConfig = Boolean(sanityConfig.projectId && sanityConfig.dataset);

export const sanityClient = hasSanityConfig ? createClient(sanityConfig) : null;
