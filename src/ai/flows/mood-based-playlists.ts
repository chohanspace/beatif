'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating mood-based playlists.
 *
 * The flow takes a mood as input and returns a list of song recommendations.
 * It exports the following:
 * - `generateMoodPlaylist(mood: string)`: A function that generates a mood-based playlist.
 * - `MoodPlaylistInput`: The input type for the generateMoodPlaylist function.
 * - `MoodPlaylistOutput`: The return type for the generateMoodPlaylist function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MoodPlaylistInputSchema = z.object({
  mood: z
    .string()
    .describe('The desired mood for the playlist (e.g., happy, relaxed, energetic).'),
});

export type MoodPlaylistInput = z.infer<typeof MoodPlaylistInputSchema>;

const MoodPlaylistOutputSchema = z.object({
  songs: z
    .array(z.string())
    .describe('A list of song recommendations for the specified mood.'),
});

export type MoodPlaylistOutput = z.infer<typeof MoodPlaylistOutputSchema>;

const moodPlaylistPrompt = ai.definePrompt({
  name: 'moodPlaylistPrompt',
  input: {schema: MoodPlaylistInputSchema},
  output: {schema: MoodPlaylistOutputSchema},
  prompt: `You are a playlist generation expert. A user is feeling a specific mood and wants songs to match that mood. Create a playlist of songs that is most appropriate for the mood.

Mood: {{{mood}}}

Songs:`,
});

const generateMoodPlaylistFlow = ai.defineFlow(
  {
    name: 'generateMoodPlaylistFlow',
    inputSchema: MoodPlaylistInputSchema,
    outputSchema: MoodPlaylistOutputSchema,
  },
  async input => {
    const {output} = await moodPlaylistPrompt(input);
    return output!;
  }
);

export async function generateMoodPlaylist(mood: string): Promise<MoodPlaylistOutput> {
  return generateMoodPlaylistFlow({mood});
}
