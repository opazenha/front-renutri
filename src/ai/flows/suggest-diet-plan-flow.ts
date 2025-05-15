
'use server';
/**
 * @fileOverview AI flow to suggest a diet plan based on patient data.
 *
 * - getAIDietSuggestion - A function that handles the diet plan suggestion process.
 * - SuggestDietPlanInput - The input type for the getAIDietSuggestion function.
 * - SuggestDietPlanOutput - The return type for the getAIDietSuggestion function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { TacoItem } from '@/types'; // Assuming TacoItem is defined
import { tacoData } from '@/lib/data/taco-data'; // Corrected import: allTacoData to tacoData


// --- Input Schema ---
const SuggestDietPlanInputSchema = z.object({
  age: z.number().int().positive(),
  gender: z.enum(['male', 'female']),
  weightKg: z.number().positive(),
  heightCm: z.number().positive(),
  activityLevel: z.string().describe("Nível de atividade física (ex: Leve, Moderada, Intensa)"),
  caloricTarget: z.number().positive().describe("Meta calórica diária em Kcal"),
  proteinTargetGrams: z.number().positive().describe("Meta de proteína diária em gramas"),
  carbTargetGrams: z.number().positive().describe("Meta de carboidratos diária em gramas"),
  fatTargetGrams: z.number().positive().describe("Meta de gorduras diária em gramas"),
  dietaryPreferences: z.string().optional().describe("Preferências alimentares do paciente (ex: vegetariano, sem glúten)"),
  foodAversions: z.string().optional().describe("Aversões alimentares do paciente (alimentos que devem ser evitados)"),
  previousFeedback: z.string().optional().describe("Feedback sobre sugestões anteriores para refinar o plano"),
});
export type SuggestDietPlanInput = z.infer<typeof SuggestDietPlanInputSchema>;


// --- Output Schema ---
const SuggestedMealItemSchema = z.object({
  mealReference: z.string().describe("Referência da refeição (ex: Café da Manhã, Almoço, Jantar, Lanche)"),
  mealTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "HH:MM format").describe("Horário sugerido para a refeição (formato HH:MM)"),
  tacoItemId: z.number().int().positive().describe("ID do alimento na tabela TACO. Tente encontrar o alimento mais próximo na tabela TACO e use seu ID."),
  foodDescription: z.string().describe("Descrição do alimento como consta na tabela TACO ou o mais próximo possível."),
  quantityGrams: z.number().positive().describe("Quantidade sugerida do alimento em gramas."),
});

const SuggestDietPlanOutputSchema = z.object({
  meals: z.array(SuggestedMealItemSchema).describe("Lista de itens de refeição sugeridos para um dia."),
  notes: z.string().optional().describe("Notas ou observações adicionais sobre o plano sugerido."),
});
export type SuggestDietPlanOutput = z.infer<typeof SuggestDietPlanOutputSchema>;

// --- Placeholder Prompt Definition ---
// THIS IS A CRITICAL PART THAT NEEDS ACTUAL AI LOGIC
const suggestDietPlanPrompt = ai.definePrompt({
  name: 'suggestDietPlanPrompt',
  input: { schema: SuggestDietPlanInputSchema },
  output: { schema: SuggestDietPlanOutputSchema },
  prompt: `
    Você é um nutricionista assistente especialista em criar planos alimentares.
    Com base nos dados do paciente fornecidos, sugira um plano alimentar para um dia, dividido em refeições principais e lanches.
    Para cada item alimentar, forneça:
    1.  Referência da Refeição (ex: Café da Manhã, Almoço, Lanche da Tarde, Jantar).
    2.  Horário Sugerido (formato HH:MM).
    3.  ID do Alimento na Tabela TACO (tacoItemId): Encontre o alimento mais próximo possível na tabela TACO (fornecida abaixo) e use seu ID numérico. Se não encontrar um exato, use o mais similar.
    4.  Descrição do Alimento (foodDescription): Use a descrição exata da tabela TACO correspondente ao ID.
    5.  Quantidade Sugerida (quantityGrams): Em gramas.

    Tente atingir as metas calóricas e de macronutrientes. Considere as preferências e aversões.
    Se houver feedback anterior, use-o para refinar a sugestão.

    Dados do Paciente:
    - Idade: {{{age}}} anos
    - Gênero: {{{gender}}}
    - Peso: {{{weightKg}}} kg
    - Altura: {{{heightCm}}} cm
    - Nível de Atividade: {{{activityLevel}}}
    - Meta Calórica: {{{caloricTarget}}} Kcal
    - Meta Proteínas: {{{proteinTargetGrams}}}g
    - Meta Carboidratos: {{{carbTargetGrams}}}g
    - Meta Gorduras: {{{fatTargetGrams}}}g
    {{#if dietaryPreferences}}- Preferências: {{{dietaryPreferences}}}{{/if}}
    {{#if foodAversions}}- Aversões: {{{foodAversions}}}{{/if}}
    {{#if previousFeedback}}- Feedback Anterior: {{{previousFeedback}}}{{/if}}

    Priorize alimentos comuns e saudáveis. Distribua as calorias e macros ao longo do dia.
    A sua resposta DEVE ser um JSON VÁLIDO que corresponda ao schema de output.

    Um subconjunto da Tabela TACO para referência de IDs e descrições (use apenas IDs desta lista se possível):
    ${tacoData.slice(0, 50).map(item => `- ID ${item.id}: ${item.alimento_descricao}`).join('\n')}
    ... (mais itens seriam listados aqui ou o modelo teria acesso completo)
    
    Retorne APENAS o JSON.
  `,
});

// --- Flow Definition ---
const suggestDietPlanFlow = ai.defineFlow(
  {
    name: 'suggestDietPlanFlow',
    inputSchema: SuggestDietPlanInputSchema,
    outputSchema: SuggestDietPlanOutputSchema,
  },
  async (input) => {
    // In a real scenario, here you might pre-process input or fetch more context.
    // For example, dynamically provide a more relevant subset of TACO data to the prompt
    // based on patient preferences, or use a tool for TACO lookup.

    console.log("AI Flow Input:", input);

    // Placeholder: For now, the prompt itself will try to generate JSON.
    // More robustly, you'd call the LLM and then parse its text output into the Zod schema.
    // const llmResponse = await model.generate({ prompt: compiledPrompt });
    // const suggestion = SuggestDietPlanOutputSchema.parse(JSON.parse(llmResponse.text()));

    // For demonstration, returning a mock response that fits the schema:
    if (input.previousFeedback && input.previousFeedback.toLowerCase().includes("mais frango")) {
         return {
            meals: [
                { mealReference: "Almoço", mealTime: "12:30", tacoItemId: 430, foodDescription: "Porco, lombo, assado", quantityGrams: 200 },
                { mealReference: "Jantar", mealTime: "19:30", tacoItemId: 401, foodDescription: "Frango, filé, à milanesa", quantityGrams: 180 },
            ],
            notes: "Plano ajustado com mais frango conforme feedback."
        };
    }

    // Default mock suggestion if no specific feedback to trigger the above
    const mockResponse = {
        meals: [
            { mealReference: "Café da Manhã", mealTime: "07:30", tacoItemId: 1, foodDescription: "Arroz, integral, cozido", quantityGrams: 150 },
            { mealReference: "Almoço", mealTime: "12:00", tacoItemId: 326, foodDescription: "Carne, bovina, acém, moído, cozido", quantityGrams: 120 },
            { mealReference: "Lanche da Tarde", mealTime: "16:00", tacoItemId: 178, foodDescription: "Banana, maçã, crua", quantityGrams: 100 },
            { mealReference: "Jantar", mealTime: "19:00", tacoItemId: 301, foodDescription: "Merluza, filé, assado", quantityGrams: 150 },
        ],
        notes: "Este é um plano alimentar inicial sugerido pela IA. Ajustes podem ser necessários."
    };
    
    // Simulate calling the prompt and getting its output
    // const { output } = await suggestDietPlanPrompt(input);
    // return output!;
    // For now, directly returning mock. Replace with actual prompt call when ready.
    return mockResponse;

    // TODO: Properly call the 'suggestDietPlanPrompt' when Gemini API is active.
    // The current mock above is for UI testing. The actual call would look like:
    // const { output } = await suggestDietPlanPrompt(input);
    // if (!output) {
    //   throw new Error("AI did not return a valid plan.");
    // }
    // // Validate each tacoItemId from the output against allTacoData
    // output.meals.forEach(meal => {
    //   if (!allTacoData.find(taco => taco.id === meal.tacoItemId)) {
    //     console.warn(`Warning: AI suggested tacoItemId ${meal.tacoItemId} which is not in TACO data. Description: ${meal.foodDescription}`);
    //     // Optionally, try to find a match by description or mark as needing review
    //   }
    // });
    // return output;
  }
);

// --- Exported Server Action ---
export async function getAIDietSuggestion(
  input: SuggestDietPlanInput,
  feedback?: string // Added optional feedback parameter
): Promise<SuggestDietPlanOutput> {
  const flowInput = feedback ? { ...input, previousFeedback: feedback } : input;
  return suggestDietPlanFlow(flowInput);
}
