import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const devicesCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/devices" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    image: z.string().optional(),
    gallery: z.array(z.string()).optional(),
    tags: z.array(z.string()),
    price: z.number().optional(),
    firmwareUrl: z.string().optional(),
    mercadolibreUrl: z.string().optional(),
    featured: z.boolean().default(false),
    stock: z.enum(["En Stock", "A Pedido", "Sold Out"]).default("En Stock"),
    customizable: z.boolean().optional(),
    instructionSteps: z.array(z.object({
      text: z.string(),
      image: z.string().optional(),
    })).optional(),
  }),
});

export const collections = {
  'devices': devicesCollection,
};