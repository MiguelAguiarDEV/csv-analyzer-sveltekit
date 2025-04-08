import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateWithGeminai } from '$lib/services/ai/geminaiService';
import type { GeminaiRequest, GeminaiResult } from '$lib/types/ai/geminai';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body: GeminaiRequest = await request.json();

		if (!body.prompt || body.prompt.trim() === '') {
			return json({ error: 'El prompt está vacío.' }, { status: 400 });
		}

		const content = await generateWithGeminai({ prompt: body.prompt });

		return json({ content });
	} catch (err) {
		console.error('Error al generar contenido con Geminai:', err);

		const errorResult: GeminaiResult = {
			error: 'Hubo un problema al procesar la solicitud.',
			status: 500
		};

		return json(errorResult, { status: 500 });
	}
};