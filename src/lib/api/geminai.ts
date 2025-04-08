import { GEMINAI_API_KEY, GEMINAI_MODEL } from '$lib/config/config';
import type { GeminaiRequest } from '$lib/types/geminai';

export async function generateWithGeminai({ prompt }: GeminaiRequest): Promise<string> {
	const res = await fetch(
		`https://generativelanguage.googleapis.com/v1beta/models/${GEMINAI_MODEL}:generateContent?key=${GEMINAI_API_KEY}`,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				contents: [{ parts: [{ text: prompt }] }]
			})
		}
	);

	if (!res.ok) {
		console.error('[Geminai Error]', await res.text());
		throw new Error('Error al comunicarse con la API de Gemini');
	}

	const data = await res.json();
	return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}
