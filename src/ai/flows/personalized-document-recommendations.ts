
'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating personalized document recommendations.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedDocumentRecommendationsInputSchema = z.object({
  userInterests: z
    .array(z.string())
    .describe('A list of topics or keywords representing the user\'s interests.'),
  browsingHistoryDocumentTitles: z
    .array(z.string())
    .describe('A list of titles of documents the user has recently viewed.'),
  uploadedDocumentTitles: z
    .array(z.string())
    .describe('A list of titles of documents the user has uploaded.'),
  availableDocuments: z
    .array(
      z.object({
        id: z.string().describe('The unique identifier of the document.'),
        title: z.string().describe('The title of the document.'),
        description: z.string().describe('A brief description of the document.'),
        tags: z.array(z.string()).describe('A list of keywords or tags associated with the document.'),
      })
    )
    .describe('A list of all documents available in the library with their metadata.'),
});
export type PersonalizedDocumentRecommendationsInput = z.infer<
  typeof PersonalizedDocumentRecommendationsInputSchema
>;

const PersonalizedDocumentRecommendationsOutputSchema = z.object({
  recommendations: z
    .array(
      z.object({
        documentId: z.string().describe('The ID of the recommended document.'),
        title: z.string().describe('The title of the recommended document.'),
        description: z.string().describe('A brief description of the recommended document.'),
        reasons: z.string().describe('A concise explanation of why this document was recommended.'),
      })
    )
    .describe('A list of recommended documents.'),
});
export type PersonalizedDocumentRecommendationsOutput = z.infer<
  typeof PersonalizedDocumentRecommendationsOutputSchema
>;

export async function personalizedDocumentRecommendations(
  input: PersonalizedDocumentRecommendationsInput
): Promise<PersonalizedDocumentRecommendationsOutput> {
  return personalizedDocumentRecommendationsFlow(input);
}

const personalizedDocumentRecommendationsPrompt = ai.definePrompt({
  name: 'personalizedDocumentRecommendationsPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: {schema: PersonalizedDocumentRecommendationsInputSchema},
  output: {schema: PersonalizedDocumentRecommendationsOutputSchema},
  prompt: `You are an expert librarian and content recommender. Your task is to suggest documents from a given list that are highly relevant to a user, based on their interests and past interactions.

**User Profile:**
Interests: {{#if userInterests}}{{{userInterests}}}{{else}}None specified.{{/if}}
Recently Viewed Documents: {{#if browsingHistoryDocumentTitles}}{{{browsingHistoryDocumentTitles}}}{{else}}None.{{/if}}
Uploaded Documents: {{#if uploadedDocumentTitles}}{{{uploadedDocumentTitles}}}{{else}}None.{{/if}}

**Available Documents in the Library:**
{{#each availableDocuments}}
  ID: {{{id}}}
  Title: {{{title}}}
  Description: {{{description}}}
  Tags: {{{tags}}}
---
{{/each}}

Please provide a list of up to 5 document recommendations. For each recommendation, provide the \`documentId\`, \`title\`, \`description\`, and a concise \`reasons\` explaining why this document was recommended, considering the user's profile.

**IMPORTANT**: Do not recommend any document whose title is listed in 'Recently Viewed Documents' or 'Uploaded Documents'. Ensure that the recommended documents are truly new and relevant to the user's interests.`,
});

const personalizedDocumentRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedDocumentRecommendationsFlow',
    inputSchema: PersonalizedDocumentRecommendationsInputSchema,
    outputSchema: PersonalizedDocumentRecommendationsOutputSchema,
  },
  async (input) => {
    const {output} = await personalizedDocumentRecommendationsPrompt(input);
    return output!;
  }
);
