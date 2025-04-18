'use server';
/**
 * @fileOverview Extracts text from an image using OCR.
 *
 * - extractTextFromImage - A function that handles the text extraction process.
 * - ExtractTextFromImageInput - The input type for the extractTextFromImage function.
 * - ExtractTextFromImageOutput - The return type for the extractTextFromImage function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const ExtractTextFromImageInputSchema = z.object({
  imageUrl: z.string().describe('The URL of the image to extract text from.'),
});
export type ExtractTextFromImageInput = z.infer<typeof ExtractTextFromImageInputSchema>;

const ExtractTextFromImageOutputSchema = z.object({
  extractedText: z.string().describe('The extracted text from the image.'),
});
export type ExtractTextFromImageOutput = z.infer<typeof ExtractTextFromImageOutputSchema>;

export async function extractTextFromImage(input: ExtractTextFromImageInput): Promise<ExtractTextFromImageOutput> {
  return extractTextFromImageFlow(input);
}

const extractTextPrompt = ai.definePrompt({
  name: 'extractTextPrompt',
  input: {
    schema: z.object({
      imageUrl: z.string().describe('The URL of the image to extract text from.'),
    }),
  },
  output: {
    schema: z.object({
      extractedText: z.string().describe('The extracted text from the image.'),
    }),
  },
  prompt: `Extract the text from the following image. Return only the raw text.

Image: {{media url=imageUrl}}`,
});

const extractTextFromImageFlow = ai.defineFlow<
  typeof ExtractTextFromImageInputSchema,
  typeof ExtractTextFromImageOutputSchema
>({
  name: 'extractTextFromImageFlow',
  inputSchema: ExtractTextFromImageInputSchema,
  outputSchema: ExtractTextFromImageOutputSchema,
},
async input => {
  const {output} = await extractTextPrompt(input);
  return output!;
});
