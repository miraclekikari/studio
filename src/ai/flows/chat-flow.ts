
'use server';
/**
 * @fileOverview Système de discussion robuste pour l'Assistant Studio.
 */

import {ai, MODEL_ID} from '@/ai/genkit';
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
      if (!input.message?.trim()) {
        return { response: "L'Expertise Studio est prête. Posez votre question sur vos ressources." };
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
        model: MODEL_ID,
        system: `Tu es l'Expert Studio, un spécialiste en gestion du savoir.
        Ton but est d'analyser les idées et d'aider à organiser les ressources numériques.
        Réponds de manière concise, professionnelle et inspirante en français.
        Évite tout jargon technique sur l'IA ou les bases de données.`,
        messages: messages
      });
      
      const responseText = response.text;
      
      if (!responseText) {
        throw new Error("Réponse vide du système d'analyse.");
      }
      
      return { response: responseText };
    } catch (error: any) {
      console.error("Assistant Chat Error:", error);
      
      if (error.message?.includes('404') || error.message?.includes('API_KEY_INVALID')) {
        return { 
          response: "Configuration requise. Le système d'analyse attend sa clé d'accès (GOOGLE_GENAI_API_KEY)." 
        };
      }
      
      return { 
        response: "Une interruption momentanée empêche l'analyse. Merci de patienter un instant." 
      };
    }
  }
);
