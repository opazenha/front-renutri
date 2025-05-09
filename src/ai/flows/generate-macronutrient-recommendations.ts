'use server';

/**
 * @fileOverview AI-powered macronutrient recommendation generator.
 *
 * - generateMacronutrientRecommendations - A function that generates macronutrient recommendations based on patient data.
 * - GenerateMacronutrientRecommendationsInput - The input type for the generateMacronutrientRecommendations function.
 * - GenerateMacronutrientRecommendationsOutput - The return type for the generateMacronutrientRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMacronutrientRecommendationsInputSchema = z.object({
  gender: z.enum(['male', 'female']).describe('The patient\'s gender.'),
  age: z.number().describe('The patient\'s age in years.'),
  weightKg: z.number().describe('The patient\'s weight in kilograms.'),
  heightCm: z.number().describe('The patient\'s height in centimeters.'),
  activityLevel: z
    .enum(['sedentary', 'lightlyActive', 'moderatelyActive', 'veryActive', 'extraActive'])
    .describe('The patient\'s activity level.'),
  goal: z
    .enum(['weightLoss', 'weightGain', 'maintainWeight'])
    .describe('The patient\'s nutritional goal.'),
  GET: z.number().describe('The patient\'s total daily energy expenditure (GET) in calories.'),
  foodPreferences: z.string().describe('The patient\'s dietary preferences and restrictions.'),
});
export type GenerateMacronutrientRecommendationsInput = z.infer<
  typeof GenerateMacronutrientRecommendationsInputSchema
>;

const GenerateMacronutrientRecommendationsOutputSchema = z.object({
  proteinGrams: z.number().describe('Recommended daily protein intake in grams.'),
  carbohydrateGrams: z.number().describe('Recommended daily carbohydrate intake in grams.'),
  fatGrams: z.number().describe('Recommended daily fat intake in grams.'),
  recommendationRationale: z
    .string()
    .describe('Explanation of why these macronutrient amounts are recommended.'),
});
export type GenerateMacronutrientRecommendationsOutput = z.infer<
  typeof GenerateMacronutrientRecommendationsOutputSchema
>;

export async function generateMacronutrientRecommendations(
  input: GenerateMacronutrientRecommendationsInput
): Promise<GenerateMacronutrientRecommendationsOutput> {
  return generateMacronutrientRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMacronutrientRecommendationsPrompt',
  input: {schema: GenerateMacronutrientRecommendationsInputSchema},
  output: {schema: GenerateMacronutrientRecommendationsOutputSchema},
  prompt: `You are an expert nutritionist providing personalized macronutrient recommendations.

  Based on the following patient data, generate macronutrient recommendations to help them achieve their nutritional goals. Adhere to established nutritional guidelines, and use your expert knowledge to provide a safe and effective plan.

  Patient Data:
  Gender: {{{gender}}}
  Age: {{{age}}} years
  Weight: {{{weightKg}}} kg
  Height: {{{heightCm}}} cm
  Activity Level: {{{activityLevel}}}
  Goal: {{{goal}}}
  GET (Total Daily Energy Expenditure): {{{GET}}} calories
  Food Preferences and Restrictions: {{{foodPreferences}}}

  Consider the patient's preferences and restrictions when making your recommendations.

  Output should be in JSON format.
  `, // Must be in JSON format
});

const generateMacronutrientRecommendationsFlow = ai.defineFlow(
  {
    name: 'generateMacronutrientRecommendationsFlow',
    inputSchema: GenerateMacronutrientRecommendationsInputSchema,
    outputSchema: GenerateMacronutrientRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
