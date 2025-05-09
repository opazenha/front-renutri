
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
}

export interface AnthropometricRecord {
  id: string;
  date: string; // YYYY-MM-DD ISO String
  weightKg: number;
  heightCm: number;
  bmi?: number; // Calculated
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
