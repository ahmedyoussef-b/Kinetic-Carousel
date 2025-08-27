import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
 plugins: [googleAI()],
});

export function initializeGenkit() {
  // Initialization is now done when the module is imported and `ai` is created.
  // This function can remain but might not be strictly necessary depending on usage.
}