
import { z } from "zod";

export const PatientSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  dob: z.string().refine((date) => !isNaN(new Date(date).getTime()), {message: "Data de nascimento inválida."}),
  gender: z.enum(["male", "female", "other"], { required_error: "Gênero é obrigatório." }),
});
export type PatientFormData = z.infer<typeof PatientSchema>;

export const LabExamSchema = z.object({
  id: z.string().optional(), // Optional for new exams, will be generated
  collectionDate: z.string().refine((date) => !isNaN(new Date(date).getTime()), {message: "Data da coleta inválida."}),
  examName: z.string().min(1, { message: "Nome do exame é obrigatório." }),
  result: z.coerce.number({invalid_type_error: "Resultado deve ser um número."}),
  unit: z.string().min(1, { message: "Unidade é obrigatória." }),
  referenceRange: z.string().optional(),
  specificCondition: z.string().optional(),
});
export type LabExamFormData = z.infer<typeof LabExamSchema>;

export const AnthropometricSchema = z.object({
  date: z.string().refine((date) => !isNaN(new Date(date).getTime()), {message: "Data da avaliação inválida."}),
  weightKg: z.coerce.number().positive({ message: "O peso atual deve ser positivo." }).optional(),
  heightCm: z.coerce.number().positive({ message: "A altura deve ser positiva." }).optional(),
  usualWeightKg: z.coerce.number().positive({ message: "O peso habitual deve ser positivo." }).optional(),
  desiredWeightKg: z.coerce.number().positive({ message: "O peso desejado deve ser positivo." }).optional(),

  // Circumferences (cm)
  relaxedArmCircumference: z.coerce.number().optional(),
  contractedArmCircumference: z.coerce.number().optional(),
  waistCircumference: z.coerce.number().optional(),
  abdomenCircumference: z.coerce.number().optional(),
  hipCircumference: z.coerce.number().optional(),
  proximalThighCircumference: z.coerce.number().optional(),
  medialThighCircumference: z.coerce.number().optional(),
  calfCircumference: z.coerce.number().optional(),
  neckCircumference: z.coerce.number().optional(),
  wristCircumference: z.coerce.number().optional(),

  // Skinfolds (mm)
  bicepsSkinfold: z.coerce.number().optional(),
  tricepsSkinfold: z.coerce.number().optional(),
  subscapularSkinfold: z.coerce.number().optional(),
  pectoralSkinfold: z.coerce.number().optional(),
  midaxillarySkinfold: z.coerce.number().optional(),
  suprailiacSkinfold: z.coerce.number().optional(),
  abdominalSkinfold: z.coerce.number().optional(),
  thighSkinfold: z.coerce.number().optional(),
  medialCalfSkinfold: z.coerce.number().optional(),

  // Bone Diameters (cm)
  humerusBiepicondylarDiameter: z.coerce.number().optional(),
  femurBiepicondylarDiameter: z.coerce.number().optional(),

  assessmentObjective: z.string().optional(),

  labExams: z.array(LabExamSchema).optional(),
});
export type AnthropometricFormData = z.infer<typeof AnthropometricSchema>;


// Energy Expenditure Schemas
const ActivityDetailSchema = z.object({
  id: z.string().optional(),
  type: z.string().min(1, "Tipo de atividade é obrigatório."),
  duration: z.string().min(1, "Duração é obrigatória."),
  mets: z.coerce.number().positive("METS deve ser um número positivo.").optional(),
  intensity: z.enum(["Leve", "Moderada", "Intensa"]).optional(),
});
export type ActivityDetailFormData = z.infer<typeof ActivityDetailSchema>;

const WorkActivityDetailSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Descrição da atividade principal é obrigatória."),
  timeSpent: z.string().min(1, "Tempo gasto é obrigatório."),
  mets: z.coerce.number().positive("METS deve ser um número positivo.").optional(),
  occupationalActivityFactor: z.string().optional(),
});
export type WorkActivityDetailFormData = z.infer<typeof WorkActivityDetailSchema>;

export const EnergyExpenditureSchema = z.object({
  consultationDate: z.string().refine((date) => !isNaN(new Date(date).getTime()), { message: "Data da consulta inválida." }),
  weightKg: z.coerce.number().positive("Peso deve ser positivo.").optional(),
  restingEnergyExpenditure: z.coerce.number().positive("GER deve ser positivo.").optional(),
  gerFormula: z.string().optional(),
  sleepDuration: z.string().optional().refine(val => !val || /^\d+(\.\d+)?$/.test(val), { message: "Duração do sono deve ser um número (ex: 7.5)." }),
  physicalActivities: z.array(ActivityDetailSchema).optional(),
  workActivity: WorkActivityDetailSchema.optional(),
  otherActivities: z.array(ActivityDetailSchema).optional(),
});
export type EnergyExpenditureFormData = z.infer<typeof EnergyExpenditureSchema>;


// Macronutrient Plan Schemas
export const MacronutrientPlanSchema = z.object({
  date: z.string().refine((date) => !isNaN(new Date(date).getTime()), { message: "Data do plano inválida." }),
  totalEnergyExpenditure: z.coerce.number().positive("GET deve ser positivo.").optional(),
  caloricObjective: z.enum(["Manutenção", "Perda de Peso", "Ganho de Massa"], { required_error: "Objetivo calórico é obrigatório." }),
  caloricAdjustment: z.coerce.number().optional(),
  proteinPercentage: z.coerce.number().min(0).max(100, "Percentual deve ser entre 0 e 100.").optional(),
  carbohydratePercentage: z.coerce.number().min(0).max(100, "Percentual deve ser entre 0 e 100.").optional(),
  lipidPercentage: z.coerce.number().min(0).max(100, "Percentual deve ser entre 0 e 100.").optional(),
  proteinGramsPerKg: z.coerce.number().min(0, "Gramas por Kg deve ser positivo.").optional(),
  carbohydrateGramsPerKg: z.coerce.number().min(0).optional(), // Less common to set directly
  lipidGramsPerKg: z.coerce.number().min(0).optional(), // Less common to set directly
  weightForCalculation: z.coerce.number().positive("Peso para cálculo deve ser positivo.").optional(),
  activityFactor: z.coerce.number().positive("Fator atividade deve ser positivo.").optional(),
  injuryStressFactor: z.coerce.number().positive("Fator injúria/estresse deve ser positivo.").optional(),
  specificConsiderations: z.string().optional(),
}).refine(data => {
  if (data.proteinPercentage && data.carbohydratePercentage && data.lipidPercentage) {
    const totalPercentage = data.proteinPercentage + data.carbohydratePercentage + data.lipidPercentage;
    // Allow for slight floating point inaccuracies, e.g., 99.9 to 100.1
    return totalPercentage > 99 && totalPercentage < 101;
  }
  return true;
}, {
  message: "A soma dos percentuais de macronutrientes deve ser aproximadamente 100%.",
  path: ["proteinPercentage"], // You can point to a specific field or the root
});
export type MacronutrientPlanFormData = z.infer<typeof MacronutrientPlanSchema>;


// Micronutrient Recommendation Schemas
const MicronutrientDetailSchema = z.object({
  id: z.string().optional(),
  nutrientName: z.string().min(1, "Nome do micronutriente é obrigatório."),
  specificRecommendation: z.string().optional(),
  prescribedSupplementation: z.object({
    dose: z.string().optional(),
    frequency: z.string().optional(),
    duration: z.string().optional(),
  }).optional(),
});
export type MicronutrientDetailFormData = z.infer<typeof MicronutrientDetailSchema>;

export const MicronutrientRecommendationSchema = z.object({
  date: z.string().refine((date) => !isNaN(new Date(date).getTime()), { message: "Data da recomendação inválida." }),
  ageAtTimeOfRec: z.coerce.number().int().positive("Idade deve ser um número positivo.").optional(),
  sexAtTimeOfRec: z.enum(["male", "female", "other"]).optional(),
  specialConditions: z.array(z.string()).optional(),
  recommendations: z.array(MicronutrientDetailSchema).optional(),
});
export type MicronutrientRecommendationFormData = z.infer<typeof MicronutrientRecommendationSchema>;

// Appointment Schema
export const AppointmentSchema = z.object({
  patientId: z.string().min(1, { message: "Paciente é obrigatório." }),
  date: z.string().refine((d) => d && !isNaN(new Date(d).getTime()), { message: "Data do agendamento inválida." }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Hora inválida. Use o formato HH:MM." }),
  description: z.string().min(3, { message: "Descrição deve ter pelo menos 3 caracteres." }),
  status: z.enum(["scheduled", "completed", "cancelled"]).default("scheduled"),
});
export type AppointmentFormData = z.infer<typeof AppointmentSchema>;
