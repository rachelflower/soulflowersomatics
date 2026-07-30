import { env } from 'cloudflare:workers';
import { getSecret } from 'astro:env/server';

/**
 * Read a server secret from Cloudflare bindings first, then Astro env (.env / .dev.vars).
 * Cloudflare dashboard secrets show up on `cloudflare:workers`; local values live in `.dev.vars`.
 */
export function readEnv(key: string): string | undefined {
	const fromWorker = env[key as keyof typeof env];
	if (typeof fromWorker === 'string' && fromWorker !== '') {
		return fromWorker;
	}

	const fromAstro = getSecret(key);
	if (typeof fromAstro === 'string' && fromAstro !== '') {
		return fromAstro;
	}

	return undefined;
}

export function requireEnv(key: string): string {
	const value = readEnv(key);
	if (!value) {
		throw new Error(`Missing required environment variable: ${key}`);
	}
	return value;
}
