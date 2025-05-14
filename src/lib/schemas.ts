import { z } from "zod";

// Enums for reusability in schemas
const maritalStatusEnum = z.enum(["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)", "Outro"]);
const birthTermEnum = z.enum(["Pré-termo", "A termo", "Pós-termo"]);
const bowelFunctionEnum = z.enum(["Normal", "Obstipado", "Diarreico", "Alterna diarreia e obstipação"]);
const urineColorEnum = z.enum(["Muito clara", "Clara (normal)", "Escura"]);
const yesNoUnknownEnum = z.enum(["Sim", "Não", "Não sabe"]);
const quantityLevelEnum = z.enum(["Pouco", "Moderado", "Muito"]);
const appetiteLevelEnum = z.enum(["Pouco", "Normal", "Aumentado", "Variável"]);
const sleepQualityEnum = z.enum(["Bom", "Regular", "Ruim"]);
const smokingStatusEnum = z.enum(["Sim", "Não", "Ex-fumante"]);
const alcoholConsumptionStatusEnum = z.enum(["Sim", "Não", "Ex-consumidor"]);
const physicalActivityPracticeStatusEnum = z.enum(["Sim", "Não"]);
const intensityLevelEnum = z.enum(["Leve", "Moderada", "Intensa"]);
const stressLevelTypeEnum = z.enum(["Baixo", "Moderado", "Alto"]);
const counselingProfessionalEnum = z.enum(["Endocrinologista", "Nutricionista", "Nutrólogo", "Ortomolecular", "Pediatra", "Outro"]);
const saltUsageEnum = z.enum(["Pouco", "Moderado", "Muito", "Não usa"]);
const cookingOilFatQuantityEnum = z.enum(["Pouca", "Moderada", "Muita"]);
const mealTypeEnum = z.enum(["Desjejum", "Colação", "Almoço", "Lanche", "Jantar", "Ceia", "Antes de dormir"]);
const consumptionFrequencyEnum = z.enum(["Diário", "X vezes/semana", "X vezes/mês", "Raramente", "Nunca"]);


export const PatientSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  dob: z.string().refine((date) => date === "" || !isNaN(new Date(date).getTime()), {message: "Data de nascimento inválida."}),
  gender: z.enum(["male", "female", "other"], { required_error: "Gênero é obrigatório." }),
  schooling: z.string().optional(),
  maritalStatus: maritalStatusEnum.optional(),
  profession: z.string().optional(),
  // registrationDate is auto-generated
});
export type PatientFormData = z.infer<typeof PatientSchema>;


const ClinicalAssessmentHabitsSchema = z.object({
  horasSono: z.coerce.number().optional(),
  qualidadeSono: sleepQualityEnum.optional(),
  fuma: smokingStatusEnum.optional(),
  tipoCigarro: z.string().optional(),
  frequenciaCigarro: z.string().optional(),
  quantidadeCigarro: z.string().optional(),
  consomeBebidaAlcoolica: alcoholConsumptionStatusEnum.optional(),
  tipoBebidaAlcoolica: z.string().optional(),
  frequenciaBebidaAlcoolica: z.string().optional(),
  quantidadeBebidaAlcoolica: z.string().optional(),
});

const ClinicalAssessmentSignsAndSymptomsSchema = z.object({
  alergiasAlimentares: yesNoUnknownEnum.optional(),
  intoleranciasAlimentares: yesNoUnknownEnum.optional(),
  dificuldadeMastigacao: yesNoUnknownEnum.optional(),
  dificuldadeDegluticao: yesNoUnknownEnum.optional(),
  nauseas: yesNoUnknownEnum.optional(),
  vomitos: yesNoUnknownEnum.optional(),
  pirose: yesNoUnknownEnum.optional(),
  refluxo: yesNoUnknownEnum.optional(),
  diarreia: yesNoUnknownEnum.optional(),
  obstipacao: yesNoUnknownEnum.optional(),
  dorAbdominal: yesNoUnknownEnum.optional(),
  distensaoAbdominal: yesNoUnknownEnum.optional(),
  usoLaxantes: yesNoUnknownEnum.optional(),
  usoAntiacidos: yesNoUnknownEnum.optional(),
  alteracoesApetite: appetiteLevelEnum.optional(),
  alteracoesPesoRecentes: z.string().optional(),
  presencaEdema: yesNoUnknownEnum.optional(),
  cansacoFadiga: yesNoUnknownEnum.optional(),
  alteracoesPele: yesNoUnknownEnum.optional(),
  alteracoesUnhas: yesNoUnknownEnum.optional(),
  alteracoesCabelos: yesNoUnknownEnum.optional(),
  sedeExcessiva: yesNoUnknownEnum.optional(),
  poliuria: yesNoUnknownEnum.optional(),
  doresMuscularesArticulares: yesNoUnknownEnum.optional(),
  caimbras: yesNoUnknownEnum.optional(),
});

const ClinicalAssessmentSpecificQuestionsSchema = z.object({
  nasceuDeParto: birthTermEnum.optional(),
  funcionamentoIntestinal: bowelFunctionEnum.optional(),
  corDaUrina: urineColorEnum.optional(),
  usoMedicamentos: z.string().optional(),
  usoSuplementos: z.string().optional(),
  outrasObservacoesRelevantes: z.string().optional(),
});

export const ClinicalAssessmentSchema = z.object({
  assessmentDate: z.string().refine((date) => !isNaN(new Date(date).getTime()), {message: "Data da avaliação inválida."}),
  queixaPrincipal: z.string().optional(),
  historiaDoencaAtual: z.string().optional(),
  historiaMedicaPregressa: z.string().optional(),
  historiaFamiliar: z.string().optional(),
  habits: ClinicalAssessmentHabitsSchema.optional(),
  signsAndSymptoms: ClinicalAssessmentSignsAndSymptomsSchema.optional(),
  specificQuestions: ClinicalAssessmentSpecificQuestionsSchema.optional(),
  assessmentObjective: z.string().optional(),
});
export type ClinicalAssessmentFormData = z.infer<typeof ClinicalAssessmentSchema>;


const MealRecordSchema = z.object({
  id: z.string().optional(),
  mealType: mealTypeEnum,
  time: z.string().optional(), // Consider validation if format is strict HH:MM
  foodItem: z.string().min(1, "Alimento é obrigatório."),
  quantity: z.string().min(1, "Quantidade é obrigatória."),
  preparationMethod: z.string().optional(),
  observations: z.string().optional(),
});
export type MealRecordFormData = z.infer<typeof MealRecordSchema>;

const FoodFrequencySchema = z.object({
  id: z.string().optional(),
  foodOrGroup: z.string().min(1, "Alimento/Grupo é obrigatório."),
  consumptionFrequency: consumptionFrequencyEnum,
  usualPortion: z.string().optional(),
});
export type FoodFrequencyFormData = z.infer<typeof FoodFrequencySchema>;

export const FoodAssessmentSchema = z.object({
  assessmentDate: z.string().refine((date) => !isNaN(new Date(date).getTime()), {message: "Data da avaliação inválida."}),
  previousNutritionalCounseling: yesNoUnknownEnum.optional(),
  objectiveOfPreviousCounseling: z.string().optional(),
  counselingProfessional: counselingProfessionalEnum.optional(),
  foodAllergiesDescribed: z.string().optional(),
  foodIntolerancesDescribed: z.string().optional(),
  appetite: appetiteLevelEnum.optional(),
  mealLocation: z.string().optional(),
  mealPreparer: z.string().optional(),
  mealTimes: z.string().optional(),
  waterConsumption: z.string().optional(),
  saltUsage: saltUsageEnum.optional(),
  saltType: z.string().optional(),
  cookingOilFatUsage: z.string().optional(),
  cookingOilFatQuantity: cookingOilFatQuantityEnum.optional(),
  sugarSweetenerUsage: z.string().optional(),
  foodPreferences: z.string().optional(),
  foodAversions: z.string().optional(),
  dietaryRecall24h: z.array(MealRecordSchema).optional(),
  foodFrequency: z.array(FoodFrequencySchema).optional(),
});
export type FoodAssessmentFormData = z.infer<typeof FoodAssessmentSchema>;


const AlcoholicBeverageSchema = z.object({
  id: z.string().optional(),
  type: z.string().min(1, "Tipo de bebida é obrigatório."), // Allow custom string
  frequency: z.string().optional(),
  quantityPerOccasion: z.coerce.number().optional(),
  unitOfMeasure: z.string().optional(), // Allow custom string
  alcoholContent: z.coerce.number().optional(),
});
export type AlcoholicBeverageFormData = z.infer<typeof AlcoholicBeverageSchema>;

export const ActivityDetailSchema = z.object({
  id: z.string().optional(),
  type: z.string().min(1, "Tipo de atividade é obrigatório."),
  frequency: z.string().optional(),
  duration: z.string().optional(),
  mets: z.coerce.number().positive("METS deve ser um número positivo.").optional().nullable(),
  intensity: intensityLevelEnum.optional(),
});
export type ActivityDetailFormData = z.infer<typeof ActivityDetailSchema>;


export const BehavioralAssessmentSchema = z.object({
  assessmentDate: z.string().refine((date) => !isNaN(new Date(date).getTime()), {message: "Data da avaliação inválida."}),
  smoking: z.object({
    status: smokingStatusEnum.optional(),
    inicio: z.string().optional(),
    tipoProduto: z.string().optional(),
    quantidadeDia: z.string().optional(),
    tempoParou: z.string().optional(),
  }).optional(),
  alcohol: z.object({
    status: alcoholConsumptionStatusEnum.optional(),
    inicioConsumo: z.string().optional(),
    beverages: z.array(AlcoholicBeverageSchema).optional(),
    tempoParou: z.string().optional(),
  }).optional(),
  physicalActivityPractice: physicalActivityPracticeStatusEnum.optional(),
  physicalActivitiesDetails: z.array(ActivityDetailSchema).optional(),
  stressLevel: stressLevelTypeEnum.optional(),
  perceivedQualityOfLife: z.string().optional(),
});
export type BehavioralAssessmentFormData = z.infer<typeof BehavioralAssessmentSchema>;

export const LabExamSchema = z.object({
  id: z.string().optional(),
  collectionDate: z.string().refine((date) => date === "" || !isNaN(new Date(date).getTime()), {message: "Data da coleta inválida."}),
  examName: z.string().min(1, { message: "Nome do exame é obrigatório." }),
  result: z.coerce.number({invalid_type_error: "Resultado deve ser um número."}).optional(),
  unit: z.string().optional(),
  referenceRange: z.string().optional(),
  specificCondition: z.string().optional(),
});
export type LabExamFormData = z.infer<typeof LabExamSchema>;

export const BiochemicalAssessmentSchema = z.object({
  assessmentDate: z.string().refine((date) => !isNaN(new Date(date).getTime()), {message: "Data da avaliação inválida."}), 
  exams: z.array(LabExamSchema),
});
export type BiochemicalAssessmentFormData = z.infer<typeof BiochemicalAssessmentSchema>;

export const AnthropometricSchema = z.object({
  date: z.string().refine((date) => date === "" || !isNaN(new Date(date).getTime()), {message: "Data da avaliação inválida."}),
  weightKg: z.coerce.number().positive("Peso deve ser positivo.").optional().nullable(),
  heightCm: z.coerce.number().positive("Altura deve ser positiva.").optional().nullable(),
  usualWeightKg: z.coerce.number().positive("Peso usual deve ser positivo.").optional().nullable(),
  desiredWeightKg: z.coerce.number().positive("Peso desejado deve ser positivo.").optional().nullable(),
  
  relaxedArmCircumference: z.coerce.number().optional().nullable(),
  contractedArmCircumference: z.coerce.number().optional().nullable(),
  waistCircumference: z.coerce.number().optional().nullable(),
  abdomenCircumference: z.coerce.number().optional().nullable(),
  hipCircumference: z.coerce.number().optional().nullable(),
  proximalThighCircumference: z.coerce.number().optional().nullable(),
  medialThighCircumference: z.coerce.number().optional().nullable(),
  calfCircumference: z.coerce.number().optional().nullable(),
  thoracicCircumference: z.coerce.number().optional().nullable(),
  cephalicCircumference: z.coerce.number().optional().nullable(),

  bicepsSkinfold: z.coerce.number().optional().nullable(),
  tricepsSkinfold: z.coerce.number().optional().nullable(),
  subscapularSkinfold: z.coerce.number().optional().nullable(),
  pectoralSkinfold: z.coerce.number().optional().nullable(),
  midaxillarySkinfold: z.coerce.number().optional().nullable(),
  suprailiacSkinfold: z.coerce.number().optional().nullable(),
  abdominalSkinfold: z.coerce.number().optional().nullable(),
  thighSkinfold: z.coerce.number().optional().nullable(),
  medialCalfSkinfold: z.coerce.number().optional().nullable(),
  observations: z.string().optional(),
});
export type AnthropometricFormData = z.infer<typeof AnthropometricSchema>;


const WorkActivityDetailSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Descrição da atividade principal é obrigatória."),
  timeSpent: z.string().min(1, "Tempo gasto é obrigatório."),
  mets: z.coerce.number().positive("METS deve ser um número positivo.").optional().nullable(),
  occupationalActivityFactor: z.string().optional().nullable(),
});
export type WorkActivityDetailFormData = z.infer<typeof WorkActivityDetailSchema>;

export const EnergyExpenditureSchema = z.object({
  consultationDate: z.string().refine((date) => !isNaN(new Date(date).getTime()), { message: "Data da consulta inválida." }),
  weightKg: z.coerce.number().positive("Peso deve ser positivo.").optional().nullable(),
  restingEnergyExpenditure: z.coerce.number().positive("GER deve ser positivo.").optional().nullable(),
  gerFormula: z.string().optional().nullable(),
  sleepDuration: z.coerce.number().positive("Duração do sono deve ser positiva e em horas.").optional().nullable(),
  physicalActivities: z.array(ActivityDetailSchema).optional(),
  workActivity: WorkActivityDetailSchema.optional().nullable(),
  otherActivities: z.array(ActivityDetailSchema).optional(),
});
export type EnergyExpenditureFormData = z.infer<typeof EnergyExpenditureSchema>;

export const MacronutrientPlanSchema = z.object({
  date: z.string().refine((date) => !isNaN(new Date(date).getTime()), { message: "Data do plano inválida." }),
  totalEnergyExpenditure: z.coerce.number().positive("GET deve ser positivo.").optional().nullable(),
  caloricObjective: z.enum(["Manutenção", "Perda de Peso", "Ganho de Massa"], { required_error: "Objetivo calórico é obrigatório." }),
  caloricAdjustment: z.coerce.number().optional().nullable(),
  proteinPercentage: z.coerce.number().min(0).max(100, "Percentual deve ser entre 0 e 100.").optional().nullable(),
  carbohydratePercentage: z.coerce.number().min(0).max(100, "Percentual deve ser entre 0 e 100.").optional().nullable(),
  lipidPercentage: z.coerce.number().min(0).max(100, "Percentual deve ser entre 0 e 100.").optional().nullable(),
  proteinGramsPerKg: z.coerce.number().min(0, "Gramas por Kg deve ser positivo.").optional().nullable(),
  carbohydrateGramsPerKg: z.coerce.number().min(0).optional().nullable(),
  lipidGramsPerKg: z.coerce.number().min(0).optional().nullable(),
  weightForCalculation: z.coerce.number().positive("Peso para cálculo deve ser positivo.").optional().nullable(),
  activityFactor: z.coerce.number().positive("Fator atividade deve ser positivo.").optional().nullable(),
  injuryStressFactor: z.coerce.number().positive("Fator injúria/estresse deve ser positivo.").optional().nullable(),
  specificConsiderations: z.string().optional().nullable(),
}).refine(data => {
  if (data.proteinPercentage && data.carbohydratePercentage && data.lipidPercentage) {
    const totalPercentage = data.proteinPercentage + data.carbohydratePercentage + data.lipidPercentage;
    return totalPercentage > 99 && totalPercentage < 101;
  }
  return true;
}, {
  message: "A soma dos percentuais de macronutrientes deve ser aproximadamente 100%.",
  path: ["proteinPercentage"],
});
export type MacronutrientPlanFormData = z.infer<typeof MacronutrientPlanSchema>;

export const MicronutrientDetailSchema = z.object({
  id: z.string().optional(),
  nutrientName: z.string().min(1, "Nome do micronutriente é obrigatório."),
  specificRecommendation: z.string().optional().nullable(),
  prescribedSupplementation: z.object({
    dose: z.string().optional().nullable(),
    frequency: z.string().optional().nullable(),
    duration: z.string().optional().nullable(),
  }).optional().nullable(),
});
export type MicronutrientDetailFormData = z.infer<typeof MicronutrientDetailSchema>;

export const MicronutrientRecommendationSchema = z.object({
  date: z.string().refine((date) => !isNaN(new Date(date).getTime()), { message: "Data da recomendação inválida." }),
  ageAtTimeOfRec: z.coerce.number().int().positive("Idade deve ser um número positivo.").optional().nullable(),
  sexAtTimeOfRec: z.enum(["male", "female", "other"]).optional().nullable(),
  specialConditions: z.array(z.string()).optional(),
  recommendations: z.array(MicronutrientDetailSchema).optional(),
});
export type MicronutrientRecommendationFormData = z.infer<typeof MicronutrientRecommendationSchema>;

export const AppointmentSchema = z.object({
  patientId: z.string().min(1, { message: "Paciente é obrigatório." }),
  date: z.string().refine((d) => d && !isNaN(new Date(d).getTime()), { message: "Data do agendamento inválida." }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Hora inválida. Use o formato HH:MM." }),
  description: z.string().min(3, { message: "Descrição deve ter pelo menos 3 caracteres." }),
  status: z.enum(["scheduled", "completed", "cancelled"]).default("scheduled"),
});
export type AppointmentFormData = z.infer<typeof AppointmentSchema>;

export const AppointmentTypeSchema = AppointmentSchema.extend({
  id: z.string(),
  patientName: z.string(),
});
export type Appointment = z.infer<typeof AppointmentTypeSchema>;

export type AppointmentStatus = z.infer<typeof AppointmentSchema.shape.status>;
