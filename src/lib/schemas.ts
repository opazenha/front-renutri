import { z } from "zod";

export const PatientSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  dob: z.string().refine((date) => !isNaN(new Date(date).getTime()), {message: "Data de nascimento inválida."}),
  gender: z.enum(["male", "female", "other"], { required_error: "Gênero é obrigatório." }),
});
export type PatientFormData = z.infer<typeof PatientSchema>;


export const AnthropometricSchema = z.object({
  date: z.string().refine((date) => !isNaN(new Date(date).getTime()), {message: "Data inválida."}),
  weightKg: z.coerce.number().positive({ message: "O peso deve ser positivo." }),
  heightCm: z.coerce.number().positive({ message: "A altura deve ser positiva." }),
});
export type AnthropometricFormData = z.infer<typeof AnthropometricSchema>;


export const FoodAssessmentSchema = z.object({
  dietaryPreferences: z.string().optional(),
  foodRestrictions: z.string().optional(),
  typicalMealPatterns: z.string().optional(),
});
export type FoodAssessmentFormData = z.infer<typeof FoodAssessmentSchema>;


export const MacronutrientRecommendationInputSchema = z.object({
  activityLevel: z.enum(["sedentary", "lightlyActive", "moderatelyActive", "veryActive", "extraActive"], { required_error: "Nível de atividade é obrigatório." }),
  goal: z.enum(["weightLoss", "weightGain", "maintainWeight"], { required_error: "Objetivo é obrigatório." }),
  GET: z.coerce.number().positive({ message: "GET deve ser um número positivo." }),
  foodPreferences: z.string().optional(),
  genderForAI: z.enum(["male", "female"]).optional(), // Added for conditional validation, not directly in AI input type.
});
export type MacronutrientRecommendationFormInputData = z.infer<typeof MacronutrientRecommendationInputSchema>;
