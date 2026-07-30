import { sendEmail } from '../../lib/email/client';
import {
	getContactToEmail,
	getFromEmail,
	isValidEmail,
} from '../../lib/email/helpers';
import {
	buildContactNotifyEmail,
	parseContactPayload,
} from '../../lib/email/messages';

export const prerender = false;

function json(data: unknown, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

export async function POST({ request }: { request: Request }) {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ ok: false, error: 'Expected JSON body' }, 400);
	}

	const parsed = parseContactPayload(body);
	if ('error' in parsed) {
		return json({ ok: false, error: parsed.error }, 400);
	}

	// Honeypot: pretend success so bots don't retry
	if (parsed.website && parsed.website.trim() !== '') {
		return json({ ok: true });
	}

	if (!isValidEmail(parsed.email)) {
		return json({ ok: false, error: 'Please enter a valid email.' }, 400);
	}

	const { subject, text, html } = buildContactNotifyEmail(parsed);

	let result;
	try {
		result = await sendEmail({
			from: getFromEmail(),
			to: getContactToEmail(),
			replyTo: parsed.email,
			subject,
			text,
			html,
			tags: [
				{ name: 'form', value: 'contact' },
			],
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Email failed to send';
		console.error('[api/contact]', message);
		return json({ ok: false, error: 'Email is not configured yet.' }, 503);
	}

	if (!result.ok) {
		console.error('[api/contact] Resend error:', result.message);
		return json({ ok: false, error: 'Unable to send message right now.' }, 502);
	}

	return json({ ok: true, id: result.id });
}
