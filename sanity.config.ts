import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list';
import { schemaTypes } from './sanity/schemaTypes';

const projectId =
  process.env.SANITY_STUDIO_PROJECT_ID ||
  process.env.SANITY_PROJECT_ID ||
  'xfhp705d';
const dataset =
  process.env.SANITY_STUDIO_DATASET ||
  process.env.SANITY_DATASET ||
  'production';

export default defineConfig({
  basePath: '/admin',
  name: 'seenpleen-studio',
  title: 'SeenPleen Studio',
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S, context) =>
        S.list()
          .title('Content')
          .items([
            orderableDocumentListDeskItem({
              type: 'project',
              title: 'Order Projects',
              S,
              context,
            }),
            S.divider(),
            S.documentTypeListItem('project').title('Projects'),
          ]),
    }),
  ],
  schema: {
    types: schemaTypes,
  },
});
