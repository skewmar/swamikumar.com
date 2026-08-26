import { updateRepositoryFileBase64 } from '../../../lib/github';
import { getStudioSession } from '../../../lib/studio-auth';

export const prerender = false;

function response(body: Record<string, string>, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
	});
}

export async function POST({ request }: { request: Request }) {
	const session = await getStudioSession(request);
	if (!session) return response({ error: 'Please sign in again.' }, 401);
	try {
		const { filename, content } = (await request.json()) as { filename?: string; content?: string };
		const safeName = filename?.toLowerCase().replace(/[^a-z0-9._-]/g, '-').replace(/-+/g, '-');
		if (!safeName || !/\.(avif|gif|jpe?g|png|webp)$/.test(safeName)) throw new Error('Use a PNG, JPG, WebP, GIF, or AVIF image.');
		if (!content || content.length > 4_000_000) throw new Error('Images must be under 3 MB.');
		const uniqueName = `${Date.now()}-${safeName}`;
		await updateRepositoryFileBase64(session, `public/uploads/${uniqueName}`, content, `Add image ${safeName}`);
		return response({ url: `/uploads/${uniqueName}` });
	} catch (error) {
		return response({ error: error instanceof Error ? error.message : 'Unable to upload image.' }, 400);
	}
}
