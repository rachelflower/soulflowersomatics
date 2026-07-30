import { site } from '../../config/site';
import { readEnv } from '../env';

/** Inbox for notifications (env override → site default). */
export function getContactToEmail(): string {
	return readEnv('CONTACT_TO_EMAIL') ?? site.contactEmail;
}

/**
 * Resend `from` address.
 * Prefer CONTACT_FROM_EMAIL; otherwise use the test sender until the domain is verified.
 */
export function getFromEmail(): string {
	return readEnv('CONTACT_FROM_EMAIL') ?? site.fromEmail;
}

export function escapeHtml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

export function isValidEmail(value: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

export function normalizeWhitespace(value: string): string {
	return value.trim().replace(/\s+/g, ' ');
}
