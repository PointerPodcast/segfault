import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { z } from "astro/zod";

const episodes = defineCollection({
  loader: glob({ base: "./src/content/episodes", pattern: "**/*.md" }),
  schema: z.object({
    published: z.boolean().default(false),
    number: z.number().int().nonnegative(),
    title: z.string().trim().min(1),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    guid: z
      .string()
      .trim()
      .min(1)
      .regex(/^[A-Za-z0-9._:-]+$/),
    date: z.coerce.date().nullable(),
    description: z.string().default(""),
    duration: z.string().trim().default(""),
    audio: z.object({
      url: z.string().default(""),
      size: z.number().int().nonnegative().nullable().default(null),
      type: z
        .string()
        .regex(/^audio\/[A-Za-z0-9.+-]+$/)
        .default("audio/mpeg"),
    }),
    pointerEpisode: z.object({
      number: z.number().int().nonnegative().nullable().default(null),
      title: z.string().default(""),
      url: z.string().default(""),
    }),
    explicit: z.boolean().default(false),
  }),
});

export const collections = { episodes };
