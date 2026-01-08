import { z, defineCollection, type SchemaContext } from 'astro:content';
import { glob } from 'astro/loaders';

export const teamMemberSchema = ({ image }: SchemaContext) =>
  z.object({
    draft: z.boolean(),
    name: z.string(),
    title: z.string(),
    avatar: z.object({
      src: image(),
      alt: z.string()
    }),
    publishDate: z.coerce.date(),
    order: z.number().optional()
  });

export type TeamMemberData = z.infer<ReturnType<typeof teamMemberSchema>>;

const managementCollection = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: new URL('./team/management/', import.meta.url)
  }),
  schema: teamMemberSchema
});

const supervisorsCollection = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: new URL('./team/supervisors/', import.meta.url)
  }),
  schema: teamMemberSchema
});

export const collections = {
  management: managementCollection,
  supervisors: supervisorsCollection
};
