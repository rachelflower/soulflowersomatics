import { getCollection, type CollectionEntry } from 'astro:content';

export type Offering = {
	slug: string;
	title: string;
	teaser: string;
	body: string;
	featuredOnHome: boolean;
	order: number;
};

export function toOffering(entry: CollectionEntry<'offerings'>): Offering {
	return {
		slug: entry.id,
		title: entry.data.title,
		teaser: entry.data.teaser,
		body: entry.data.body,
		featuredOnHome: entry.data.featuredOnHome,
		order: entry.data.order,
	};
}

export async function getOfferings(): Promise<Offering[]> {
	const entries = await getCollection('offerings');
	return entries.map(toOffering).sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

export async function getHomeOfferings(): Promise<Offering[]> {
	const all = await getOfferings();
	return all.filter((o) => o.featuredOnHome);
}
