import { getCollection, type CollectionEntry } from 'astro:content';

export type EventItem = {
	slug: string;
	title: string;
	date: string;
	time?: string;
	venue: string;
	image?: string;
	summary?: string;
	registrationUrl?: string;
	registrationLabel?: string;
};

export function toEventItem(entry: CollectionEntry<'events'>): EventItem {
	return {
		slug: entry.id,
		title: entry.data.title,
		date: entry.data.date,
		time: entry.data.time,
		venue: entry.data.venue,
		image: entry.data.image,
		summary: entry.data.summary,
		registrationUrl: entry.data.registrationUrl,
		registrationLabel: entry.data.registrationLabel,
	};
}

export async function getEvents(): Promise<EventItem[]> {
	const entries = await getCollection('events');
	return entries.map(toEventItem);
}

export function formatEventDate(iso: string): string {
	const d = new Date(`${iso}T12:00:00`);
	return d.toLocaleDateString('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	});
}

/** Events on or after today (local), sorted ascending. */
export function upcomingFrom(events: EventItem[], from = new Date(), limit?: number): EventItem[] {
	const start = new Date(from);
	start.setHours(0, 0, 0, 0);
	const list = events
		.filter((e) => new Date(`${e.date}T23:59:59`) >= start)
		.sort((a, b) => a.date.localeCompare(b.date));
	return typeof limit === 'number' ? list.slice(0, limit) : list;
}
