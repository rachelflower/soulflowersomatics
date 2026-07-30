import type { APIRoute } from 'astro';
import { readEnv } from '../lib/env';

export const prerender = false;

function randomState(): string {
	const buf = new Uint8Array(8);
	crypto.getRandomValues(buf);
	return Array.from(buf, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** GitHub OAuth start — used by Decap CMS at /admin/ */
export const GET: APIRoute = ({ url }) => {
	const clientId = readEnv('GITHUB_OAUTH_CLIENT_ID');
	if (!clientId) {
		return new Response(
			'Missing GITHUB_OAUTH_CLIENT_ID. Add it in Cloudflare secrets (and .dev.vars for local).',
			{ status: 500 },
		);
	}

	const provider = url.searchParams.get('provider');
	if (provider && provider !== 'github') {
		return new Response('Invalid provider', { status: 400 });
	}

	const scope = readEnv('GITHUB_REPO_PRIVATE') === '1' ? 'repo user' : 'public_repo user';
	const redirectUri = `${url.origin}/callback`;
	const authorize = new URL('https://github.com/login/oauth/authorize');
	authorize.searchParams.set('client_id', clientId);
	authorize.searchParams.set('redirect_uri', redirectUri);
	authorize.searchParams.set('scope', scope);
	authorize.searchParams.set('state', randomState());

	return Response.redirect(authorize.toString(), 302);
};
