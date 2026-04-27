
'use server';
/**
 * @fileOverview Flow de discussion robuste pour l'Assistant Studio.
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

/**
 * Action serveur pour discuter avec l'Assistant.
 */
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
        return { response: "En quoi puis-je vous éclairer ?" };
      }

      // Construction des messages pour Gemini
      const messages = (input.history || []).map(h => ({
        role: h.role as 'user' | 'model',
        content: [{ text: h.content }]
      }));

      // Ajout du message actuel
      messages.push({ 
        role: 'user', 
        content: [{ text: input.message }] 
      });

      const { text } = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        system: `Tu es l'Assistant Studio, un expert en gestion du savoir et en analyse de documents.
        Ton but est d'aider l'utilisateur à organiser ses idées et à synthétiser ses ressources.
        Réponds de manière élégante, concise et professionnelle en français.
        N'utilise jamais le mot "IA" ou "Intelligence Artificielle", parle de "Système Studio" ou "Analyse".
        Sois chaleureux mais expert.`,
        messages: messages
      });
      
      if (!text) {
        throw new Error("Le modèle n'a renvoyé aucun texte.");
      }
      
      return { response: text };
    } catch (error: any) {
      console.error("Assistant Flow Error:", error);
      
      // Message d'erreur pédagogique si la clé est manquante
      if (error.message?.includes('API_KEY') || error.message?.includes('key')) {
        return { 
          response: "Le Système Studio n'est pas encore activé. Veuillez configurer la clé GOOGLE_GENAI_API_KEY dans vos paramètres d'environnement." 
        };
      }
      
      return { 
        response: "Je rencontre une difficulté de connexion avec mes modules d'analyse. Veuillez vérifier votre connexion ou réessayer plus tard." 
      };
    }
  }
);
