
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
  energyExpenditureRecords?: EnergyExpenditureRecord[];
  macronutrientPlans?: MacronutrientPlan[];
  micronutrientRecommendations?: MicronutrientRecommendation[];
}

export interface LabExamRecord {
  id: string;
  collectionDate: string; // YYYY-MM-DD
  examName: string;
  result: number;
  unit: string;
  referenceRange?: string;
  specificCondition?: string;
}

export interface AnthropometricRecord {
  id: string;
  date: string; // YYYY-MM-DD ISO String
  weightKg?: number; 
  heightCm?: number;
  bmi?: number; // Calculated

  usualWeightKg?: number;
  desiredWeightKg?: number;

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
  pectoralSkinfold?: number; // Typically for men
  midaxillarySkinfold?: number;
  suprailiacSkinfold?: number;
  abdominalSkinfold?: number;
  thighSkinfold?: number;
  medialCalfSkinfold?: number;

  // Bone Diameters (cm)
  humerusBiepicondylarDiameter?: number;
  femurBiepicondylarDiameter?: number;

  assessmentObjective?: string;
  labExams?: LabExamRecord[];
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

export interface ActivityDetail {
  id: string;
  type: string;
  duration: string; // e.g., "30 min/dia", "3x semana"
  mets?: number; // Optional, for pre-defined or custom
  intensity?: 'Leve' | 'Moderada' | 'Intensa'; // For physical activity
}

export interface WorkActivityDetail {
  id: string;
  description: string;
  timeSpent: string; // e.g., "8 horas/dia"
  mets?: number;
  occupationalActivityFactor?: string; // e.g., Leve, Moderada, Intensa
}

export interface EnergyExpenditureRecord {
  id: string;
  consultationDate: string; // YYYY-MM-DD
  weightKg?: number; // Can auto-populate
  restingEnergyExpenditure?: number; // GER in Kcal/24h
  gerFormula?: string; // e.g., Harris-Benedict, Mifflin-St Jeor if calculated
  sleepDuration?: string; // hours per 24h cycle
  physicalActivities: ActivityDetail[];
  workActivity?: WorkActivityDetail; // Assuming one primary work activity for simplicity
  otherActivities: ActivityDetail[];
}

export type CaloricObjective = "Manutenção" | "Perda de Peso" | "Ganho de Massa";

export interface MacronutrientPlan {
  id: string;
  date: string; // YYYY-MM-DD
  totalEnergyExpenditure?: number; // GET in Kcal/dia
  caloricObjective: CaloricObjective;
  caloricAdjustment?: number; // e.g., -500 or +500 Kcal, or %
  proteinPercentage?: number;
  carbohydratePercentage?: number;
  lipidPercentage?: number;
  proteinGramsPerKg?: number;
  carbohydrateGramsPerKg?: number;
  lipidGramsPerKg?: number;
  weightForCalculation?: number; // kg
  activityFactor?: number;
  injuryStressFactor?: number;
  specificConsiderations?: string;
}

export interface MicronutrientDetail {
  id: string;
  nutrientName: string; // e.g., Vitamina A, Ferro
  specificRecommendation?: string; // Value and unit, e.g., "1000 UI", "15 mg"
  prescribedSupplementation?: {
    dose?: string;
    frequency?: string;
    duration?: string;
  };
}

export interface MicronutrientRecommendation {
  id: string;
  date: string; // YYYY-MM-DD
  ageAtTimeOfRec?: number; // Auto-populate
  sexAtTimeOfRec?: Gender; // Auto-populate
  specialConditions?: string[]; // e.g., Gestante, Lactante
  recommendations: MicronutrientDetail[];
}
