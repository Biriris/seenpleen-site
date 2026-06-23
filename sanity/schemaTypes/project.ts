import { defineArrayMember, defineField, defineType } from 'sanity';

const statusOptions = [
  'Completed',
  'Under Construction',
  'In Progress',
  'Concept',
  'Proposal',
];

const categoryOptions = [
  'Residential',
  'Commercial',
  'Hospitality',
  'Interior Design',
  'Renovation',
  'Mixed Use',
  'Concept',
];

const subcategoryOptions = [
  'House',
  'Apartment',
  'Villa',
  'Cafe',
  'Restaurant',
  'Bar',
  'Hotel',
  'Office',
  'Retail',
  'Workspace',
  'Vacation House',
];

const collaboratorFields = [
  ['architect_engineer', 'Architect Engineer'],
  ['civil_engineer', 'Civil Engineer'],
  ['mechanical_engineer', 'Mechanical Engineer'],
  ['construction', 'Construction'],
  ['photographer', 'Photographer'],
  ['artist_3d', '3D Artist'],
  ['decoration', 'Decoration'],
  ['lighting_design', 'Lighting Design'],
] as const;

export const projectType = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
    }),
    defineField({
      name: 'hidden',
      title: 'Hide Project',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'featured',
      title: 'Featured Project',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'seo_title',
      title: 'SEO Title',
      type: 'string',
    }),
    defineField({
      name: 'seo_description',
      title: 'SEO Description',
      type: 'text',
    }),
    defineField({
      name: 'project_id',
      title: 'Subtitle / Legacy Project Info',
      type: 'string',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: categoryOptions,
      },
    }),
    defineField({
      name: 'subcategory',
      title: 'Subcategory',
      type: 'string',
      options: {
        list: subcategoryOptions,
      },
    }),
    defineField({
      name: 'client',
      title: 'Client',
      type: 'string',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'string',
    }),
    defineField({
      name: 'area',
      title: 'Area',
      type: 'string',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: statusOptions,
      },
    }),
    defineField({
      name: 'collaborators',
      title: 'Collaborators',
      type: 'object',
      fields: collaboratorFields.map(([name, title]) =>
        defineField({
          name,
          title,
          type: 'string',
        })
      ),
    }),
    defineField({
      name: 'details',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'quotes',
      title: 'Gallery Quotes',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'quote',
              title: 'Quote',
              type: 'text',
            }),
          ],
          preview: {
            select: {
              title: 'quote',
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'cover',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'hero',
      title: 'Hero Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'gallery_uploads',
      title: 'Bulk Gallery Upload',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'gallery',
      title: 'Detailed Gallery',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: {
                hotspot: true,
              },
            }),
            defineField({
              name: 'layout',
              title: 'Image Layout',
              type: 'string',
              initialValue: 'auto',
              options: {
                list: [
                  { title: 'Auto', value: 'auto' },
                  { title: 'Portrait', value: 'portrait' },
                  { title: 'Landscape', value: 'landscape' },
                  { title: 'Wide', value: 'wide' },
                  { title: 'Full Width', value: 'full' },
                ],
              },
            }),
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
            }),
            defineField({
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
            }),
          ],
          preview: {
            select: {
              title: 'title',
              media: 'image',
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
      media: 'cover',
    },
  },
});
