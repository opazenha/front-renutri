
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
  weightKg?: number; // Current Weight
  heightCm?: number;
  bmi?: number; // Calculated

  // New Anthropometric fields
  usualWeightKg?: number;
  desiredWeightKg?: number;

  // Habits
  smokingStatus?: "yes" | "no" | "exSmoker";
  smokingStartDate?: string;
  smokingProductType?: string;
  smokingQuantityPerDay?: string;
  smokingStopTime?: string;

  alcoholConsumptionStatus?: "yes" | "no" | "exConsumer";
  alcoholStartDate?: string;
  alcoholMainBeverageType?: string;
  alcoholMainBeverageFrequency?: string;
  alcoholMainBeverageQuantity?: string;
  alcoholMainBeverageUnit?: string;
  alcoholMainBeverageContent?: number;
  alcoholOtherBeveragesNotes?: string;
  alcoholStopTime?: string;
  
  physicalActivityStatus?: "yes" | "no";
  physicalActivities?: string;
  physicalActivityFrequency?: string;
  physicalActivityDuration?: string;
  physicalActivityIntensity?: "light" | "moderate" | "intense";
  
  stressLevel?: "low" | "moderate" | "high";
  perceivedQualityOfLife?: string;

  // Circumferences (cm)
  relaxedArmCircumference?: number;
  contractedArmCircumference?: number;
  waistCircumference?: number;
  abdomenCircumference?: number;
  hipCircumference?: number;
  proximalThighCircumference?: number;
  medialThighCircumference?: number;
  calfCircumference?: number;
  neckCircumference?: number;
  wristCircumference?: number;

  // Skinfolds (mm)
  bicepsSkinfold?: number;
  tricepsSkinfold?: number;
  subscapularSkinfold?: number;
  pectoralSkinfold?: number;
  midaxillarySkinfold?: number;
  suprailiacSkinfold?: number;
  abdominalSkinfold?: number;
  thighSkinfold?: number;
  medialCalfSkinfold?: number;

  // Bone Diameters (cm)
  humerusBiepicondylarDiameter?: number;
  femurBiepicondylarDiameter?: number;

  assessmentObjective?: string;
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
