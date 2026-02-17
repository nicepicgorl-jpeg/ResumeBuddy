import { SYSTEM_PROMPT } from './rubric';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export interface GeminiResponse {
    optimized_summary: string;
    optimized_experience: Array<{
        company: string;
        role: string;
        startDate: string;
        endDate: string;
        bullets: string[];
    }>;
    optimized_skills: string[];
    score: {
        total: number;
        breakdown: {
            keyword_match: { score: number; findings: string[] };
            formatting: { score: number; findings: string[] };
            job_alignment: { score: number; findings: string[] };
        };
    };
    suggestions: string[];
}

/**
 * Calls the Gemini API directly from the client using the user's own API key.
 * No server-side proxy needed — privacy-first, BYOK.
 */
export async function callGemini(
    apiKey: string,
    userPrompt: string
): Promise<GeminiResponse> {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            system_instruction: {
                parts: [{ text: SYSTEM_PROMPT }],
            },
            contents: [
                {
                    role: 'user',
                    parts: [{ text: userPrompt }],
                },
            ],
            generationConfig: {
                temperature: 0.4,
                topP: 0.95,
                maxOutputTokens: 65536,
                responseMimeType: 'application/json',
            },
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        if (response.status === 400 && errorBody.includes('API_KEY_INVALID')) {
            throw new Error('Invalid API Key. Please check your Gemini API key in Settings.');
        }
        throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
    }

    const data = await response.json();

    const rawText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
        throw new Error('Empty response from Gemini API.');
    }

    // Clean potential markdown code fences
    const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    try {
        return JSON.parse(cleaned) as GeminiResponse;
    } catch {
        throw new Error('Failed to parse Gemini response as JSON. Raw: ' + rawText.substring(0, 200));
    }
}
