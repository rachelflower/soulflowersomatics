import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const dateString = z.union([z.string(), z.date()]).transform((value) => {
	if (value instanceof Date) {
		// Prefer calendar date in local-safe ISO (YAML parsed dates are UTC midnight)
		return value.toISOString().slice(0, 10);
	}
	return value.slice(0, 10);
});

const events = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
	schema: z.object({
		title: z.string(),
		date: dateString, // YYYY-MM-DD
		time: z.string().optional(),
		venue: z.string(),
		image: z.string().optional(),
		summary: z.string().optional(),
		/** External registration (Jotform, Google Form, etc.) */
		registrationUrl: z.string().url().optional(),
		registrationLabel: z.string().optional(),
	}),
});

const offerings = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/offerings' }),
	schema: z.object({
		title: z.string(),
		teaser: z.string(),
		body: z.string(),
		featuredOnHome: z.boolean().default(false),
		order: z.number().default(100),
	}),
});

export const collections = { events, offerings };
