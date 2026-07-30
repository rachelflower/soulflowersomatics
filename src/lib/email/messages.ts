import { escapeHtml, normalizeWhitespace } from './helpers';

export type ContactPayload = {
	name: string;
	email: string;
	message: string;
	/** Optional honeypot — if filled, treat as bot */
	website?: string;
};

export type RegisterPayload = {
	name: string;
	email: string;
	eventTitle: string;
	eventSlug?: string;
	guests?: number;
	notes?: string;
	/** Optional honeypot — if filled, treat as bot */
	website?: string;
};

export function parseContactPayload(body: unknown): ContactPayload | { error: string } {
	if (!body || typeof body !== 'object') {
		return { error: 'Invalid request body' };
	}

	const data = body as Record<string, unknown>;
	const name = typeof data.name === 'string' ? normalizeWhitespace(data.name) : '';
	const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
	const message = typeof data.message === 'string' ? data.message.trim() : '';
	const website = typeof data.website === 'string' ? data.website : undefined;

	if (!name || name.length > 120) {
		return { error: 'Please enter a name (max 120 characters).' };
	}
	if (!email || email.length > 254) {
		return { error: 'Please enter a valid email.' };
	}
	if (!message || message.length > 5000) {
		return { error: 'Please enter a message (max 5000 characters).' };
	}

	return { name, email, message, website };
}

export function parseRegisterPayload(body: unknown): RegisterPayload | { error: string } {
	if (!body || typeof body !== 'object') {
		return { error: 'Invalid request body' };
	}

	const data = body as Record<string, unknown>;
	const name = typeof data.name === 'string' ? normalizeWhitespace(data.name) : '';
	const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
	const eventTitle =
		typeof data.eventTitle === 'string' ? normalizeWhitespace(data.eventTitle) : '';
	const eventSlug =
		typeof data.eventSlug === 'string' ? data.eventSlug.trim().slice(0, 120) : undefined;
	const notes = typeof data.notes === 'string' ? data.notes.trim().slice(0, 2000) : undefined;
	const website = typeof data.website === 'string' ? data.website : undefined;

	let guests: number | undefined;
	if (data.guests !== undefined && data.guests !== null && data.guests !== '') {
		const parsed = Number(data.guests);
		if (!Number.isInteger(parsed) || parsed < 1 || parsed > 20) {
			return { error: 'Guest count must be a whole number between 1 and 20.' };
		}
		guests = parsed;
	}

	if (!name || name.length > 120) {
		return { error: 'Please enter a name (max 120 characters).' };
	}
	if (!email || email.length > 254) {
		return { error: 'Please enter a valid email.' };
	}
	if (!eventTitle || eventTitle.length > 200) {
		return { error: 'Please include the event title.' };
	}

	return { name, email, eventTitle, eventSlug, guests, notes, website };
}

export function buildContactNotifyEmail(payload: ContactPayload) {
	const subject = `Contact form — ${payload.name}`;
	const text = [
		'New contact form message',
		'',
		`Name: ${payload.name}`,
		`Email: ${payload.email}`,
		'',
		payload.message,
	].join('\n');

	const html = `
		<p><strong>New contact form message</strong></p>
		<p><strong>Name:</strong> ${escapeHtml(payload.name)}<br />
		<strong>Email:</strong> ${escapeHtml(payload.email)}</p>
		<p>${escapeHtml(payload.message).replaceAll('\n', '<br />')}</p>
	`.trim();

	return { subject, text, html };
}

export function buildRegisterNotifyEmail(payload: RegisterPayload) {
	const subject = `Event registration — ${payload.eventTitle}`;
	const lines = [
		'New event registration',
		'',
		`Event: ${payload.eventTitle}`,
		payload.eventSlug ? `Slug: ${payload.eventSlug}` : null,
		`Name: ${payload.name}`,
		`Email: ${payload.email}`,
		payload.guests ? `Guests: ${payload.guests}` : null,
		payload.notes ? `Notes:\n${payload.notes}` : null,
	].filter((line): line is string => line !== null);

	const text = lines.join('\n');
	const html = `
		<p><strong>New event registration</strong></p>
		<p>
			<strong>Event:</strong> ${escapeHtml(payload.eventTitle)}<br />
			${payload.eventSlug ? `<strong>Slug:</strong> ${escapeHtml(payload.eventSlug)}<br />` : ''}
			<strong>Name:</strong> ${escapeHtml(payload.name)}<br />
			<strong>Email:</strong> ${escapeHtml(payload.email)}
			${payload.guests ? `<br /><strong>Guests:</strong> ${payload.guests}` : ''}
		</p>
		${payload.notes ? `<p><strong>Notes:</strong><br />${escapeHtml(payload.notes).replaceAll('\n', '<br />')}</p>` : ''}
	`.trim();

	return { subject, text, html };
}

export function buildRegisterGuestReply(payload: RegisterPayload) {
	const subject = `You're registered — ${payload.eventTitle}`;
	const text = [
		`Hi ${payload.name},`,
		'',
		`Thanks for registering for ${payload.eventTitle}.`,
		'',
		"We've received your request and will follow up with details soon.",
		'',
		'With care,',
		'Soul Flower Somatics',
	].join('\n');

	const html = `
		<p>Hi ${escapeHtml(payload.name)},</p>
		<p>Thanks for registering for <strong>${escapeHtml(payload.eventTitle)}</strong>.</p>
		<p>We've received your request and will follow up with details soon.</p>
		<p>With care,<br />Soul Flower Somatics</p>
	`.trim();

	return { subject, text, html };
}
