import { updateRepositoryFile } from '../../../lib/github';
import { getStudioSession } from '../../../lib/studio-auth';

export const prerender = false;

const blockTypes = new Set(['heading', 'text', 'image', 'link', 'divider']);

function response(body: Record<string, string>, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
	});
}

function cleanBlock(value: unknown, index: number) {
	if (!value || typeof value !== 'object') throw new Error('Invalid block.');
	const block = value as Record<string, unknown>;
	const type = typeof block.type === 'string' ? block.type : '';
	if (!blockTypes.has(type)) throw new Error('Unsupported block type.');
	const text = typeof block.text === 'string' ? block.text.trim().slice(0, 5000) : '';
	const id = typeof block.id === 'string' ? block.id.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 80) : `block-${index}`;
	const clean: Record<string, string> = { id: id || `block-${index}`, type, text };
	if (type === 'heading') clean.size = block.size === 'large' ? 'large' : 'xl';
	if (type === 'text') clean.style = block.style === 'meta' ? 'meta' : block.style === 'body' ? 'body' : 'lead';
	if (type === 'image') {
		clean.src = typeof block.src === 'string' ? block.src.slice(0, 2000) : '';
		clean.alt = typeof block.alt === 'string' ? block.alt.slice(0, 240) : '';
		clean.width = block.width === 'narrow' ? 'narrow' : block.width === 'full' ? 'full' : 'standard';
	}
	if (type === 'link') {
		clean.label = typeof block.label === 'string' ? block.label.slice(0, 160) : text;
		clean.url = typeof block.url === 'string' ? block.url.slice(0, 2000) : '';
	}
	return clean;
}

export async function POST({ request }: { request: Request }) {
	const session = await getStudioSession(request);
	if (!session) return response({ error: 'Please sign in again.' }, 401);
	try {
		const payload = (await request.json()) as { blocks?: unknown[] };
		if (!Array.isArray(payload.blocks) || payload.blocks.length > 40) throw new Error('Use between 1 and 40 blocks.');
		const blocks = payload.blocks.map(cleanBlock);
		await updateRepositoryFile(session, 'src/data/site.json', `${JSON.stringify({ blocks }, null, 2)}\n`, 'Update website from Studio');
		return response({ ok: 'Published. Vercel is rebuilding your site now.' });
	} catch (error) {
		return response({ error: error instanceof Error ? error.message : 'Unable to publish.' }, 400);
	}
}
