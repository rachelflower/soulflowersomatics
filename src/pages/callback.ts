import type { APIRoute } from 'astro';
import { readEnv } from '../lib/env';

export const prerender = false;

function htmlResponse(body: string, status = 200) {
	return new Response(body, {
		status,
		headers: { 'Content-Type': 'text/html; charset=utf-8' },
	});
}

/** GitHub OAuth callback — posts the token back to the Decap popup. */
export const GET: APIRoute = async ({ url }) => {
	const clientId = readEnv('GITHUB_OAUTH_CLIENT_ID');
	const clientSecret = readEnv('GITHUB_OAUTH_CLIENT_SECRET');
	if (!clientId || !clientSecret) {
		return htmlResponse(
			'<p>Missing GITHUB_OAUTH_CLIENT_ID or GITHUB_OAUTH_CLIENT_SECRET.</p>',
			500,
		);
	}

	const code = url.searchParams.get('code');
	if (!code) {
		return htmlResponse('<p>Missing OAuth code.</p>', 400);
	}

	const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			client_id: clientId,
			client_secret: clientSecret,
			code,
			redirect_uri: `${url.origin}/callback`,
		}),
	});

	const tokenJson = (await tokenRes.json()) as {
		access_token?: string;
		error?: string;
		error_description?: string;
	};

	if (!tokenJson.access_token) {
		const message = tokenJson.error_description || tokenJson.error || 'Token exchange failed';
		return htmlResponse(`<p>${message}</p>`, 400);
	}

	const authMessage = `authorization:github:success:${JSON.stringify({
		token: tokenJson.access_token,
	})}`;

	return htmlResponse(`<!doctype html>
<html lang="en">
<head><meta charset="utf-8" /><title>Authorizing…</title></head>
<body>
<p>Authorizing Decap…</p>
<script>
  (function () {
    var authMessage = ${JSON.stringify(authMessage)};
    function receiveMessage(message) {
      window.opener.postMessage(authMessage, message.origin);
      window.removeEventListener('message', receiveMessage, false);
    }
    window.addEventListener('message', receiveMessage, false);
    window.opener.postMessage('authorizing:github', '*');
  })();
</script>
</body>
</html>`);
};
