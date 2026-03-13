import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const devicesCollection = defineCollection({
  // Astro 6 ahora usa este 'loader' para buscar tus archivos .md
  loader: glob({ pattern: "**/*.md", base: "./src/content/devices" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    image: z.string().optional(),
    tags: z.array(z.string()),
    firmwareUrl: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

export const collections = {
  'devices': devicesCollection,
};