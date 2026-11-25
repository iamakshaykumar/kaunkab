import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { readdirSync } from 'node:fs';
import { ERA_IDS } from './lib/eras';
import { articleIssues } from './lib/validate';

const seriesIds = (() => {
  try {
    return readdirSync('./src/content/series/hi').filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3));
  } catch {
    return [];
  }
})();

const kab = z.object({
  start: z.number().int(),
  end: z.number().int().optional(),
  month: z.number().int().min(1).max(12).optional(),
  day: z.number().int().min(1).max(31).optional(),
  circa: z.boolean().optional(),
  label: z.string().optional(),
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z
    .object({
      title: z.string().min(1),
      era: z.enum(ERA_IDS),
      kab,
      published: z.coerce.date(),
      kaun: z.array(z.string()).optional(),
      kahan: z.array(z.string()).optional(),
      saar: z.string().min(10, 'saar (सारांश) कम से कम 10 अक्षर का होना चाहिए'),
      sources: z
        .array(z.object({ title: z.string().min(1), url: z.string().url().optional() }))
        .min(1, 'कम से कम एक स्रोत (source) ज़रूरी है'),
      tags: z.array(z.string()).optional(),
      series: z.object({ id: z.string(), order: z.number().int().min(1) }).optional(),
      quiz: z
        .array(
          z
            .object({
              q: z.string(),
              options: z.array(z.string()).min(2),
              answer: z.number().int().min(0),
            })
            .refine((x) => x.answer < x.options.length, 'quiz: answer विकल्पों की संख्या से कम होना चाहिए'),
        )
        .optional(),
      didYouKnow: z.array(z.string()).optional(),
      image: z.object({ src: z.string(), alt: z.string(), credit: z.string() }).optional(),
    })
    .superRefine((d, ctx) => {
      for (const issue of articleIssues(d, seriesIds)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, ...issue });
      }
    }),
});

const series = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/series' }),
  schema: z.object({ title: z.string(), description: z.string(), order: z.number().int().optional() }),
});

export const collections = { articles, series };
