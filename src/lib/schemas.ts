import { z } from "zod";

export const PatientSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  dob: z.string().refine((date) => !isNaN(new Date(date).getTime()), {message: "Invalid date of birth."}),
  gender: z.enum(["male", "female", "other"], { required_error: "Gender is required." }),
});
export type PatientFormData = z.infer<typeof PatientSchema>;


export const AnthropometricSchema = z.object({
  date: z.string().refine((date) => !isNaN(new Date(date).getTime()), {message: "Invalid date."}),
  weightKg: z.coerce.number().positive({ message: "Weight must be positive." }),
  heightCm: z.coerce.number().positive({ message: "Height must be positive." }),
});
export type AnthropometricFormData = z.infer<typeof AnthropometricSchema>;


export const FoodAssessmentSchema = z.object({
  dietaryPreferences: z.string().optional(),
  foodRestrictions: z.string().optional(),
  typicalMealPatterns: z.string().optional(),
});
export type FoodAssessmentFormData = z.infer<typeof FoodAssessmentSchema>;


export const MacronutrientRecommendationInputSchema = z.object({
  // gender, age, weight, height will be pre-filled or derived
  activityLevel: z.enum(["sedentary", "lightlyActive", "moderatelyActive", "veryActive", "extraActive"], { required_error: "Activity level is required." }),
  goal: z.enum(["weightLoss", "weightGain", "maintainWeight"], { required_error: "Goal is required." }),
  GET: z.coerce.number().positive({ message: "GET must be a positive number." }),
  foodPreferences: z.string().optional(),
});
export type MacronutrientRecommendationFormInputData = z.infer<typeof MacronutrientRecommendationInputSchema>;
