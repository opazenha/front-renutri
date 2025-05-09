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
