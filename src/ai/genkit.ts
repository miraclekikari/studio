
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * Configuration Genkit ultra-stable pour l'Expertise Studio.
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY,
    })
  ],
});

export const MODEL_ID = 'googleai/gemini-1.5-flash';
