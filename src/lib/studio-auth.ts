export interface StudioSession {
	login: string;
	accessToken: string;
	expiresAt: number;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function getSecret() {
	const secret = import.meta.env.STUDIO_SESSION_SECRET;
	if (!secret) throw new Error('STUDIO_SESSION_SECRET is not configured.');
	return secret;
}

function toBase64Url(bytes: Uint8Array) {
	let binary = '';
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value: string) {
	const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (value.length % 4)) % 4);
	const binary = atob(padded);
	return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function encryptionKey() {
	const digest = await crypto.subtle.digest('SHA-256', encoder.encode(getSecret()));
	return crypto.subtle.importKey('raw', digest, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

export async function sealSession(session: StudioSession) {
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const encrypted = await crypto.subtle.encrypt(
		{ name: 'AES-GCM', iv },
		await encryptionKey(),
		encoder.encode(JSON.stringify(session)),
	);
	return `${toBase64Url(iv)}.${toBase64Url(new Uint8Array(encrypted))}`;
}

export async function unsealSession(value?: string): Promise<StudioSession | null> {
	if (!value) return null;
	try {
		const [iv, encrypted] = value.split('.');
		if (!iv || !encrypted) return null;
		const decrypted = await crypto.subtle.decrypt(
			{ name: 'AES-GCM', iv: fromBase64Url(iv) },
			await encryptionKey(),
			fromBase64Url(encrypted),
		);
		const session = JSON.parse(decoder.decode(decrypted)) as StudioSession;
		return session.expiresAt > Date.now() && session.login === 'skewmar' ? session : null;
	} catch {
		return null;
	}
}

export function readCookie(request: Request, name: string) {
	const item = request.headers
		.get('cookie')
		?.split(';')
		.map((part) => part.trim())
		.find((part) => part.startsWith(`${name}=`));
	return item ? decodeURIComponent(item.slice(name.length + 1)) : undefined;
}

export async function getStudioSession(request: Request) {
	return unsealSession(readCookie(request, 'studio_session'));
}

export function sessionCookie(value: string) {
	return `studio_session=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=43200`;
}

export function clearSessionCookie() {
	return 'studio_session=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0';
}

export function redirect(location: string, headers: HeadersInit = {}) {
	return new Response(null, { status: 302, headers: { location, ...headers } });
}
