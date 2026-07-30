import { Resend } from 'resend';
import { requireEnv } from '../env';

export function getResend(): Resend {
	return new Resend(requireEnv('RESEND_API_KEY'));
}

export type SendEmailInput = {
	from: string;
	to: string | string[];
	subject: string;
	html: string;
	text: string;
	replyTo?: string | string[];
	tags?: { name: string; value: string }[];
	idempotencyKey?: string;
};

export type SendEmailResult =
	| { ok: true; id: string }
	| { ok: false; message: string };

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
	const resend = getResend();
	const { data, error } = await resend.emails.send(
		{
			from: input.from,
			to: input.to,
			subject: input.subject,
			html: input.html,
			text: input.text,
			replyTo: input.replyTo,
			tags: input.tags,
		},
		input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : undefined,
	);

	if (error) {
		return { ok: false, message: error.message };
	}

	if (!data?.id) {
		return { ok: false, message: 'Resend returned no message id' };
	}

	return { ok: true, id: data.id };
}
