import { sendEmail } from '../../lib/email/client';
import {
	getContactToEmail,
	getFromEmail,
	isValidEmail,
} from '../../lib/email/helpers';
import {
	buildRegisterGuestReply,
	buildRegisterNotifyEmail,
	parseRegisterPayload,
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

	const parsed = parseRegisterPayload(body);
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

	const notify = buildRegisterNotifyEmail(parsed);
	const guest = buildRegisterGuestReply(parsed);
	const from = getFromEmail();
	const to = getContactToEmail();

	let notifyResult;
	try {
		notifyResult = await sendEmail({
			from,
			to,
			replyTo: parsed.email,
			subject: notify.subject,
			text: notify.text,
			html: notify.html,
			tags: [
				{ name: 'form', value: 'register' },
			],
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Email failed to send';
		console.error('[api/register]', message);
		return json({ ok: false, error: 'Email is not configured yet.' }, 503);
	}

	if (!notifyResult.ok) {
		console.error('[api/register] Resend notify error:', notifyResult.message);
		return json({ ok: false, error: 'Unable to complete registration right now.' }, 502);
	}

	// Guest auto-reply is best-effort — registration still succeeds if notify went out
	const guestResult = await sendEmail({
		from,
		to: parsed.email,
		subject: guest.subject,
		text: guest.text,
		html: guest.html,
		tags: [
			{ name: 'form', value: 'register-confirm' },
		],
	}).catch((error) => {
		console.error('[api/register] guest reply failed:', error);
		return { ok: false as const, message: 'guest reply failed' };
	});

	if (!guestResult.ok) {
		console.error('[api/register] Resend guest reply error:', guestResult.message);
	}

	return json({
		ok: true,
		id: notifyResult.id,
		guestEmailSent: guestResult.ok,
	});
}
