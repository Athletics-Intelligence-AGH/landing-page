import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const managementCollection = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: new URL('./team/management/', import.meta.url)
  }),
  schema: ({ image }) =>
    z.object({
      draft: z.boolean(),
      name: z.string(),
      title: z.string(),
      avatar: z.object({
        src: image(),
        alt: z.string()
      }),
      publishDate: z.string().transform((str) => new Date(str))
    })
});

const supervisorsCollection = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: new URL('./team/supervisors/', import.meta.url)
  }),
  schema: ({ image }) =>
    z.object({
      draft: z.boolean(),
      name: z.string(),
      title: z.string(),
      avatar: z.object({
        src: image(),
        alt: z.string()
      }),
      publishDate: z.string().transform((str) => new Date(str))
    })
});

export const collections = {
  supervisors: supervisorsCollection,
  management: managementCollection
};
