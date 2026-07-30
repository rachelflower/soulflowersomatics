// @ts-check
import { defineConfig, envField } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
	site: 'https://www.soulflowersomatics.com',
	adapter: cloudflare(),
	env: {
		schema: {
			// Local: `.dev.vars` (Cloudflare runtime). Optional mirror in `.env`.
			// Production: Cloudflare → Settings → Variables and Secrets.
			RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
			CONTACT_TO_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
			CONTACT_FROM_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
			// Decap CMS GitHub OAuth (production login at /admin/)
			GITHUB_OAUTH_CLIENT_ID: envField.string({ context: 'server', access: 'secret', optional: true }),
			GITHUB_OAUTH_CLIENT_SECRET: envField.string({
				context: 'server',
				access: 'secret',
				optional: true,
			}),
			// Set to "1" if the GitHub repo is private (requests `repo` scope)
			GITHUB_REPO_PRIVATE: envField.string({ context: 'server', access: 'secret', optional: true }),
		},
	},
});
