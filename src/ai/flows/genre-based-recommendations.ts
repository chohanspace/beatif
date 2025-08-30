'use server';
/**
 * @fileOverview A flow for generating music recommendations based on user's listening history.
 *
 * - generateGenreBasedRecommendations - A function that takes user's listening history and returns music recommendations.
 * - GenreBasedRecommendationsInput - The input type for the generateGenreBasedRecommendations function.
 * - GenreBasedRecommendationsOutput - The return type for the generateGenreBasedRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenreBasedRecommendationsInputSchema = z.object({
  listeningHistory: z
    .string()
    .describe("The user's listening history as a string. Include as much detail as possible."),
});
export type GenreBasedRecommendationsInput = z.infer<typeof GenreBasedRecommendationsInputSchema>;

const GenreBasedRecommendationsOutputSchema = z.object({
  recommendations: z.string().describe('A list of music recommendations based on the user listening history.'),
});
export type GenreBasedRecommendationsOutput = z.infer<typeof GenreBasedRecommendationsOutputSchema>;

export async function generateGenreBasedRecommendations(input: GenreBasedRecommendationsInput): Promise<GenreBasedRecommendationsOutput> {
  return genreBasedRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'genreBasedRecommendationsPrompt',
  input: {schema: GenreBasedRecommendationsInputSchema},
  output: {schema: GenreBasedRecommendationsOutputSchema},
  prompt: `You are a music expert. Analyze the user's listening history and provide music recommendations based on their preferred genres.

User Listening History: {{{listeningHistory}}}

Recommendations:`, // Fixed typo here
});

const genreBasedRecommendationsFlow = ai.defineFlow(
  {
    name: 'genreBasedRecommendationsFlow',
    inputSchema: GenreBasedRecommendationsInputSchema,
    outputSchema: GenreBasedRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
