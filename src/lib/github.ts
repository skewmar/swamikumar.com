import type { StudioSession } from './studio-auth';

const owner = 'skewmar';
const repository = 'swamikumar.com';
const apiBase = `https://api.github.com/repos/${owner}/${repository}/contents`;

function encode(value: string) {
	return btoa(unescape(encodeURIComponent(value)));
}

async function github(session: StudioSession, path: string, init: RequestInit = {}) {
	const response = await fetch(`${apiBase}/${path}`, {
		...init,
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${session.accessToken}`,
			'X-GitHub-Api-Version': '2022-11-28',
			...init.headers,
		},
	});
	if (!response.ok) throw new Error(`GitHub could not complete this request (${response.status}).`);
	return response;
}

async function currentSha(session: StudioSession, path: string) {
	try {
		const response = await github(session, path);
		return (await response.json()).sha as string;
	} catch {
		return undefined;
	}
}

export async function updateRepositoryFile(session: StudioSession, path: string, content: string, message: string) {
	return updateRepositoryFileBase64(session, path, encode(content), message);
}

export async function updateRepositoryFileBase64(session: StudioSession, path: string, content: string, message: string) {
	const sha = await currentSha(session, path);
	await github(session, path, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ message, content, ...(sha ? { sha } : {}) }),
	});
}
