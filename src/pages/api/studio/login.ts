import { redirect } from '../../../lib/studio-auth';

export const prerender = false;

export async function GET({ request }: { request: Request }) {
	const clientId = import.meta.env.GITHUB_OAUTH_CLIENT_ID;
	if (!clientId) return redirect('/studio?error=missing-config');

	const state = crypto.randomUUID();
	const configuredRedirect = import.meta.env.GITHUB_OAUTH_REDIRECT_URI;
	const redirectUri = configuredRedirect || new URL('/api/studio/callback', request.url).toString();
	const url = new URL('https://github.com/login/oauth/authorize');
	url.searchParams.set('client_id', clientId);
	url.searchParams.set('redirect_uri', redirectUri);
	url.searchParams.set('scope', 'read:user public_repo');
	url.searchParams.set('state', state);

	return redirect(url.toString(), {
		'Set-Cookie': `studio_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=600`,
	});
}
