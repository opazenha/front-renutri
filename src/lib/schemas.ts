import { z } from "zod";

export const PatientSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  dob: z.string().refine((date) => !isNaN(new Date(date).getTime()), {message: "Data de nascimento inválida."}),
  gender: z.enum(["male", "female", "other"], { required_error: "Gênero é obrigatório." }),
});
export type PatientFormData = z.infer<typeof PatientSchema>;


export const AnthropometricSchema = z.object({
  date: z.string().refine((date) => !isNaN(new Date(date).getTime()), {message: "Data da avaliação inválida."}),
  weightKg: z.coerce.number().positive({ message: "O peso atual deve ser positivo." }).optional(), // Current Weight
  heightCm: z.coerce.number().positive({ message: "A altura deve ser positiva." }).optional(),
  
  // New Anthropometric fields
  usualWeightKg: z.coerce.number().positive({ message: "O peso habitual deve ser positivo." }).optional(),
  desiredWeightKg: z.coerce.number().positive({ message: "O peso desejado deve ser positivo." }).optional(),

  // Habits
  smokingStatus: z.enum(["yes", "no", "exSmoker"], {invalid_type_error: "Selecione uma opção para tabagismo."}).optional(),
  smokingStartDate: z.string().optional(),
  smokingProductType: z.string().optional(),
  smokingQuantityPerDay: z.string().optional(),
  smokingStopTime: z.string().optional(),

  alcoholConsumptionStatus: z.enum(["yes", "no", "exConsumer"], {invalid_type_error: "Selecione uma opção para consumo de álcool."}).optional(),
  alcoholStartDate: z.string().optional(),
  alcoholMainBeverageType: z.string().optional(),
  alcoholMainBeverageFrequency: z.string().optional(),
  alcoholMainBeverageQuantity: z.string().optional(),
  alcoholMainBeverageUnit: z.string().optional(),
  alcoholMainBeverageContent: z.coerce.number().optional(),
  alcoholOtherBeveragesNotes: z.string().optional(),
  alcoholStopTime: z.string().optional(),

  physicalActivityStatus: z.enum(["yes", "no"], {invalid_type_error: "Selecione uma opção para atividade física."}).optional(),
  physicalActivities: z.string().optional(),
  physicalActivityFrequency: z.string().optional(),
  physicalActivityDuration: z.string().optional(),
  physicalActivityIntensity: z.enum(["light", "moderate", "intense"], {invalid_type_error: "Selecione uma intensidade."}).optional(),
  
  stressLevel: z.enum(["low", "moderate", "high"], {invalid_type_error: "Selecione um nível de estresse."}).optional(),
  perceivedQualityOfLife: z.string().optional(),

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
});

export type AnthropometricFormData = z.infer<typeof AnthropometricSchema>;
