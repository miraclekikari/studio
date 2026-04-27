
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * Configuration Genkit ultra-stable.
 * Utilise l'identifiant de modèle string literal pour une compatibilité maximale.
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY,
    })
  ],
});

export const MODEL_ID = 'googleai/gemini-1.5-flash';
