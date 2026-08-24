import { readCookie, redirect, sealSession, sessionCookie } from '../../../lib/studio-auth';

export const prerender = false;

export async function GET({ request }: { request: Request }) {
	const url = new URL(request.url);
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	if (!code || !state || state !== readCookie(request, 'studio_oauth_state')) {
		return redirect('/studio?error=signin-failed');
	}

	const clientId = import.meta.env.GITHUB_OAUTH_CLIENT_ID;
	const clientSecret = import.meta.env.GITHUB_OAUTH_CLIENT_SECRET;
	if (!clientId || !clientSecret) return redirect('/studio?error=missing-config');

	const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
		method: 'POST',
		headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
		body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
	});
	const tokenData = (await tokenResponse.json()) as { access_token?: string };
	if (!tokenData.access_token) return redirect('/studio?error=signin-failed');

	const userResponse = await fetch('https://api.github.com/user', {
		headers: { Authorization: `Bearer ${tokenData.access_token}`, Accept: 'application/vnd.github+json' },
	});
	const user = (await userResponse.json()) as { login?: string };
	if (user.login !== 'skewmar') return redirect('/studio?error=not-authorized');

	const session = await sealSession({
		login: user.login,
		accessToken: tokenData.access_token,
		expiresAt: Date.now() + 12 * 60 * 60 * 1000,
	});
	return redirect('/studio', {
		'Set-Cookie': sessionCookie(session),
	});
}
