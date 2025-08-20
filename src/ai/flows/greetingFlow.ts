'use server';
/**
 * @fileOverview A flow for generating personalized greetings.
 *
 * - generateGreeting - A function that generates a personalized greeting message.
 * - GreetingInput - The input type for the generateGreeting function.
 * - GreetingOutput - The return type for the generateGreeting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GreetingInputSchema = z.object({
  name: z.string().describe('The name of the person to greet.'),
  baseGreeting: z
    .string()
    .describe('The base greeting based on the time of day (e.g., "Bonjour", "Bonsoir").'),
});
export type GreetingInput = z.infer<typeof GreetingInputSchema>;

export async function generateGreeting(
  input: GreetingInput
): Promise<string> {
    const {output} = await greetingPrompt(input);
    return output!;
}

const greetingPrompt = ai.definePrompt(
  {
    name: 'greetingPrompt',
    input: {schema: GreetingInputSchema},
    output: {schema: z.string()},
    prompt: `
        You are a serene and poetic greeter.
        Generate a short, calming, and personalized greeting in French for the user.
        The greeting should incorporate the user's name and the base greeting provided.
        Keep it concise, like a single, beautiful sentence.

        Example:
        - Input: { name: 'Claude', baseGreeting: 'Bonsoir' }
        - Output: "Que votre soirée soit douce et paisible, Claude."

        User's Name: {{{name}}}
        Base Greeting: {{{baseGreeting}}}
    `,
    config: {
        model: 'googleai/gemini-1.5-flash',
        temperature: 0.9,
    }
  },
);
