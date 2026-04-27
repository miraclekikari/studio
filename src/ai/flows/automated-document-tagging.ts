
'use server';
/**
 * @fileOverview An AI agent for automatically suggesting tags for uploaded documents.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutomatedDocumentTaggingInputSchema = z.object({
  documentContent: z.string().describe('The textual content of the document.'),
});
export type AutomatedDocumentTaggingInput = z.infer<
  typeof AutomatedDocumentTaggingInputSchema
>;

const AutomatedDocumentTaggingOutputSchema = z.object({
  tags: z
    .array(z.string())
    .describe('A list of relevant tags or keywords for the document.'),
});
export type AutomatedDocumentTaggingOutput = z.infer<
  typeof AutomatedDocumentTaggingOutputSchema
>;

export async function automatedDocumentTagging(
  input: AutomatedDocumentTaggingInput
): Promise<AutomatedDocumentTaggingOutput> {
  return automatedDocumentTaggingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'automatedDocumentTaggingPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: {schema: AutomatedDocumentTaggingInputSchema},
  output: {schema: AutomatedDocumentTaggingOutputSchema},
  prompt: `You are an expert document categorizer. Based on the provided document content, suggest a list of relevant tags or keywords that describe its main topics and themes. Provide at least 3 and at most 10 tags. Do not include any other text or explanation, just the JSON array of tags.

Document content: {{{documentContent}}}`,
});

const automatedDocumentTaggingFlow = ai.defineFlow(
  {
    name: 'automatedDocumentTaggingFlow',
    inputSchema: AutomatedDocumentTaggingInputSchema,
    outputSchema: AutomatedDocumentTaggingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
