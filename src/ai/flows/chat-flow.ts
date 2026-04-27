'use server';
/**
 * @fileOverview Flow de discussion intelligent pour l'Assistant Studio.
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
  response: z.string().describe('La réponse de l\'assistant.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chatWithAssistant(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema},
  prompt: `Tu es l'Assistant Studio, un expert en gestion du savoir et en analyse de documents.
Ton but est d'aider l'utilisateur à comprendre ses fichiers, à synthétiser des informations et à organiser ses idées. Réponds de manière concise et professionnelle.

Historique :
{{#each history}}
  {{role}}: {{{content}}}
{{/each}}

Utilisateur : {{{message}}}
Assistant :`,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    try {
      // Nettoyage et validation
      if (!input.message || input.message.trim() === '') {
        return { response: "Comment puis-je vous aider aujourd'hui ?" };
      }

      const {output} = await prompt({
        message: input.message,
        history: input.history || []
      });
      
      if (!output || !output.response) {
        throw new Error("Réponse vide du modèle");
      }
      
      return output;
    } catch (error) {
      console.error("Genkit Chat Flow Error:", error);
      return { 
        response: "Je rencontre une petite difficulté pour traiter cette demande. Pouvez-vous reformuler ou essayer un autre sujet ?" 
      };
    }
  }
);
