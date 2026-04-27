
'use server';
/**
 * @fileOverview Système de discussion robuste pour l'Assistant Studio.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatInputSchema = z.object({
  message: z.string().describe('Le message de l\'utilisateur.'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string()
  })).optional().describe('L\'historique de la conversation.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe('La réponse du système.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chatWithAssistant(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    try {
      if (!input.message || input.message.trim() === '') {
        return { response: "Le Système Studio attend votre message." };
      }

      const messages = (input.history || []).map(h => ({
        role: h.role as 'user' | 'model',
        content: [{ text: h.content }]
      }));

      messages.push({ 
        role: 'user', 
        content: [{ text: input.message }] 
      });

      const response = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        system: `Tu es l'Assistant Studio. Tu es un expert en gestion du savoir.
        Ton but est d'aider l'utilisateur à organiser ses idées et ses documents.
        Réponds de manière concise, élégante et professionnelle en français.
        N'utilise pas de jargon technique sur l'IA, parle de "Système de Savoir".`,
        messages: messages
      });
      
      const text = response.text;
      
      if (!text) {
        throw new Error("Réponse vide du système.");
      }
      
      return { response: text };
    } catch (error: any) {
      console.error("Assistant Flow Error:", error);
      
      if (error.message?.includes('404') || error.message?.includes('not found') || error.message?.includes('API_KEY_INVALID')) {
        return { 
          response: "Le Système Studio nécessite une clé API valide (GOOGLE_GENAI_API_KEY) pour fonctionner. Veuillez vérifier votre configuration Vercel." 
        };
      }
      
      return { 
        response: `Le Système Studio rencontre une perturbation temporaire. Réessayez dans un instant.` 
      };
    }
  }
);
