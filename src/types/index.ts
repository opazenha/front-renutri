
export type Gender = "male" | "female" | "other"; // Patient gender
export type AiGender = "male" | "female"; // Gender for AI model

export type ActivityLevel = "sedentary" | "lightlyActive" | "moderatelyActive" | "veryActive" | "extraActive";
export type Goal = "weightLoss" | "weightGain" | "maintainWeight";

export interface Patient {
  id: string;
  name: string;
  dob: string; // YYYY-MM-DD
  gender: Gender;
  registrationDate: string; // YYYY-MM-DD ISO String
  anthropometricData: AnthropometricRecord[];
  foodAssessment: FoodAssessment;
  recommendations: MacronutrientRecommendation[];
}

export interface AnthropometricRecord {
  id: string;
  date: string; // YYYY-MM-DD ISO String
  weightKg: number;
  heightCm: number;
  bmi?: number; // Calculated
}

export interface FoodAssessment {
  dietaryPreferences: string;
  foodRestrictions: string;
  typicalMealPatterns: string;
  lastUpdated: string; // YYYY-MM-DD ISO String
}

export interface MacronutrientAiInput {
  gender: AiGender;
  age: number; 
  weightKg: number;
  heightCm: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  GET: number; 
  foodPreferences: string;
}

export interface MacronutrientRecommendationOutput {
  proteinGrams: number;
  carbohydrateGrams: number;
  fatGrams: number;
  recommendationRationale: string;
}

export interface MacronutrientRecommendation extends MacronutrientAiInput, MacronutrientRecommendationOutput {
  id: string;
  dateGenerated: string; // YYYY-MM-DD ISO String
}

// Helper to calculate age from DOB string
export function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
