/** Central site params — change here, not scattered across pages/APIs. */
export const site = {
	name: 'Soul Flower Somatics',
	url: 'https://www.soulflowersomatics.com',
	tagline: 'Remember why you came here.',
	/** Inbox for contact + event registration notifications */
	contactEmail: 'rachelinflower@gmail.com',
	/**
	 * Resend `from` address.
	 * Use `onboarding@resend.dev` until soulflowersomatics.com is verified in Resend,
	 * then switch to hello@ (or rachel@) on the verified domain.
	 */
	fromEmail: 'Soul Flower Somatics <onboarding@resend.dev>',
	fromEmailProduction: 'Soul Flower Somatics <hello@soulflowersomatics.com>',
} as const;
