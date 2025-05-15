
export type Gender = "male" | "female"; // Patient gender
export type AiGender = "male" | "female"; // Gender for AI model

export type ActivityLevel =
  | "sedentary"
  | "lightlyActive"
  | "moderatelyActive"
  | "veryActive"
  | "extraActive";
export type Goal = "weightLoss" | "weightGain" | "maintainWeight";

// Enums from XML
export type MaritalStatus =
  | "Solteiro(a)"
  | "Casado(a)"
  | "Divorciado(a)"
  | "Viúvo(a)"
  | "Outro";
export type BirthTerm = "Pré-termo" | "A termo" | "Pós-termo";
export type BowelFunction =
  | "Normal"
  | "Obstipado"
  | "Diarreico"
  | "Alterna diarreia e obstipação";
export type UrineColor = "Muito clara" | "Clara (normal)" | "Escura";
export type YesNoUnknown = "Sim" | "Não" | "Não sabe";
export type QuantityLevel = "Pouco" | "Moderado" | "Muito";
export type AppetiteLevel = "Pouco" | "Normal" | "Aumentado" | "Variável";
export type SleepQuality = "Bom" | "Regular" | "Ruim";
export type SmokingStatus = "Sim" | "Não" | "Ex-fumante";
export type AlcoholConsumptionStatus = "Sim" | "Não" | "Ex-consumidor";
export type PhysicalActivityPracticeStatus = "Sim" | "Não";
export type IntensityLevel = "Leve" | "Moderada" | "Intensa";
export type StressLevelType = "Baixo" | "Moderado" | "Alto";
export type CounselingProfessional =
  | "Endocrinologista"
  | "Nutricionista"
  | "Nutrólogo"
  | "Ortomolecular"
  | "Pediatra"
  | "Outro";
export type SaltUsage = "Pouco" | "Moderado" | "Muito" | "Não usa";
export type CookingOilFatQuantity = "Pouca" | "Moderada" | "Muita";
export type MealType =
  | "Desjejum"
  | "Colação"
  | "Almoço"
  | "Lanche"
  | "Jantar"
  | "Ceia"
  | "Antes de dormir";
export type ConsumptionFrequency =
  | "Diário"
  | "X vezes/semana"
  | "X vezes/mês"
  | "Raramente"
  | "Nunca";
export type AlcoholicBeverageType =
  | "Absinto"
  | "Cachaça"
  | "Chopp/cerveja"
  | "Ice"
  | "Rum/gim"
  | string; // string for custom
export type AlcoholicBeverageUnit =
  | "Cálices"
  | "Canecas"
  | "Copos americanos"
  | "Copos duplos"
  | "Doses"
  | string; // string for custom

export interface Message {
  id: string;
  patientId: string;
  patientName?: string; // Optional, can be derived
  source: "whatsapp" | "gmail";
  sender: string; // email address or phone number
  timestamp: string; // ISO string
  content: string;
  isRead: boolean;
}

export interface Patient {
  id: string;
  name: string;
  dob: string; // YYYY-MM-DD
  gender: Gender;
  schooling?: string;
  maritalStatus?: MaritalStatus;
  profession?: string;
  registrationDate: string; // YYYY-MM-DD ISO String

  clinicalAssessments?: ClinicalAssessment[];
  foodAssessments?: FoodAssessment[];
  behavioralAssessments?: BehavioralAssessment[];
  anthropometricData: AnthropometricRecord[];
  biochemicalAssessments?: BiochemicalAssessment[];
  energyExpenditureRecords?: EnergyExpenditureRecord[];
  macronutrientPlans?: MacronutrientPlan[];
  micronutrientRecommendations?: MicronutrientRecommendation[];
  appointments?: Appointment[];
  messages?: Message[];
}

export interface ClinicalAssessmentHabits {
  horasSono?: number;
  qualidadeSono?: SleepQuality;
  fuma?: SmokingStatus;
  tipoCigarro?: string; // if fuma = Sim
  frequenciaCigarro?: string; // if fuma = Sim
  quantidadeCigarro?: string; // if fuma = Sim
  consomeBebidaAlcoolica?: AlcoholConsumptionStatus;
  tipoBebidaAlcoolica?: string; // if consomeBebidaAlcoolica = Sim
  frequenciaBebidaAlcoolica?: string; // if consomeBebidaAlcoolica = Sim
  quantidadeBebidaAlcoolica?: string; // if consomeBebidaAlcoolica = Sim
}

export interface ClinicalAssessmentSignsAndSymptoms {
  alergiasAlimentares?: YesNoUnknown;
  intoleranciasAlimentares?: YesNoUnknown;
  dificuldadeMastigacao?: YesNoUnknown;
  dificuldadeDegluticao?: YesNoUnknown;
  nauseas?: YesNoUnknown;
  vomitos?: YesNoUnknown;
  pirose?: YesNoUnknown;
  refluxo?: YesNoUnknown;
  diarreia?: YesNoUnknown;
  obstipacao?: YesNoUnknown;
  dorAbdominal?: YesNoUnknown;
  distensaoAbdominal?: YesNoUnknown;
  usoLaxantes?: YesNoUnknown;
  usoAntiacidos?: YesNoUnknown;
  alteracoesApetite?: AppetiteLevel;
  alteracoesPesoRecentes?: string;
  presencaEdema?: YesNoUnknown;
  cansacoFadiga?: YesNoUnknown;
  alteracoesPele?: YesNoUnknown;
  alteracoesUnhas?: YesNoUnknown;
  alteracoesCabelos?: YesNoUnknown;
  sedeExcessiva?: YesNoUnknown;
  poliuria?: YesNoUnknown;
  doresMuscularesArticulares?: YesNoUnknown;
  caimbras?: YesNoUnknown;
}

export interface ClinicalAssessmentSpecificQuestions {
  nasceuDeParto?: BirthTerm;
  funcionamentoIntestinal?: BowelFunction;
  corDaUrina?: UrineColor;
  usoMedicamentos?: string;
  usoSuplementos?: string;
  outrasObservacoesRelevantes?: string;
}

export interface ClinicalAssessment {
  id: string;
  assessmentDate: string; // YYYY-MM-DD
  queixaPrincipal?: string;
  historiaDoencaAtual?: string;
  historiaMedicaPregressa?: string;
  historiaFamiliar?: string;
  habits?: ClinicalAssessmentHabits;
  signsAndSymptoms?: ClinicalAssessmentSignsAndSymptoms;
  specificQuestions?: ClinicalAssessmentSpecificQuestions;
  assessmentObjective?: string;
}

export interface MealRecord {
  id: string;
  mealType: MealType;
  time?: string; // HH:MM
  foodItem: string;
  quantity: string;
  preparationMethod?: string;
  observations?: string;
}

export interface FoodFrequencyRecord {
  id: string;
  foodOrGroup: string;
  consumptionFrequency: ConsumptionFrequency;
  usualPortion?: string;
}

export interface FoodAssessment {
  id: string;
  assessmentDate: string; // YYYY-MM-DD
  previousNutritionalCounseling?: YesNoUnknown;
  objectiveOfPreviousCounseling?: string;
  counselingProfessional?: CounselingProfessional;
  foodAllergiesDescribed?: string;
  foodIntolerancesDescribed?: string;
  appetite?: AppetiteLevel;
  mealLocation?: string;
  mealPreparer?: string;
  mealTimes?: string;
  waterConsumption?: string;
  saltUsage?: SaltUsage;
  saltType?: string;
  cookingOilFatUsage?: string;
  cookingOilFatQuantity?: CookingOilFatQuantity;
  sugarSweetenerUsage?: string;
  foodPreferences?: string;
  foodAversions?: string;
  dietaryRecall24h?: MealRecord[];
  foodFrequency?: FoodFrequencyRecord[];
}

export interface AlcoholicBeverageRecord {
  id: string;
  type: AlcoholicBeverageType;
  frequency?: string;
  quantityPerOccasion?: number;
  unitOfMeasure?: AlcoholicBeverageUnit;
  alcoholContent?: number;
}

export interface BehavioralAssessment {
  id: string;
  assessmentDate: string; // YYYY-MM-DD
  smoking?: {
    status?: SmokingStatus;
    inicio?: string;
    tipoProduto?: string;
    quantidadeDia?: string;
    tempoParou?: string; // if ex-fumante
  };
  alcohol?: {
    status?: AlcoholConsumptionStatus;
    inicioConsumo?: string;
    beverages?: AlcoholicBeverageRecord[];
    tempoParou?: string; // if ex-consumidor
  };
  physicalActivityPractice?: PhysicalActivityPracticeStatus;
  physicalActivitiesDetails?: ActivityDetail[]; // Using existing ActivityDetail
  stressLevel?: StressLevelType;
  perceivedQualityOfLife?: string;
}

export interface LabExamRecord {
  id: string;
  collectionDate: string; // YYYY-MM-DD
  examName: string;
  result?: number; // Made optional to align with AnthropometricSchema if empty
  unit?: string;
  referenceRange?: string;
  specificCondition?: string;
}

export interface BiochemicalAssessment {
  id: string;
  assessmentDate: string;
  exams: LabExamRecord[];
}

export interface AnthropometricRecord {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg?: number;
  heightCm?: number;
  bmi?: number; // Calculated: weightKg / (heightCm/100)^2
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
  thoracicCircumference?: number;
  cephalicCircumference?: number;

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
  observations?: string;
  // New behavioral fields - these should likely be in BehavioralAssessment
  smokingHabit?: SmokingStatus;
  smokingDetails?: {
    startDate?: string;
    productType?: string;
    quantityPerDay?: string;
    stoppedDate?: string;
  };
  alcoholConsumption?: AlcoholConsumptionStatus;
  alcoholDetails?: Array<{
    type: string;
    frequency: string;
    quantity: number;
    unit: string;
    alcoholContent?: number;
  }>;
  physicalActivityPractice?: PhysicalActivityPracticeStatus;
  physicalActivitiesDetails?: Array<{
    type: string;
    frequency: string;
    duration: string;
    intensity?: IntensityLevel;
    mets?: number;
  }>;
  stressLevel?: StressLevelType;
  perceivedQualityOfLife?: string;
}

export function calculateAge(dob: string): number {
  if (!dob) return 0;
  const birthDate = new Date(dob);
  const today = new Date();
  if (isNaN(birthDate.getTime())) return 0;

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age > 0 ? age : 0;
}

export interface ActivityDetail {
  id: string;
  type: string;
  frequency?: string; // e.g., "3x/semana"
  duration: string; // e.g., "30 min/dia", "60 minutos"
  mets?: number;
  intensity?: IntensityLevel;
}

export interface WorkActivityDetail {
  id: string;
  description: string;
  timeSpent: string; // e.g., "8 horas/dia"
  mets?: number;
  occupationalActivityFactor?: string;
}

export interface EnergyExpenditureRecord {
  id: string;
  consultationDate: string; // YYYY-MM-DD
  weightKg?: number;
  restingEnergyExpenditure?: number; // GER in Kcal/24h
  gerFormula?: string;
  sleepDuration?: number | null; // hours per 24h cycle, changed to number
  physicalActivities: ActivityDetail[];
  workActivity?: WorkActivityDetail;
  otherActivities: ActivityDetail[];
}

export type CaloricObjective =
  | "Manutenção"
  | "Perda de Peso"
  | "Ganho de Massa";

export interface MacronutrientPlan {
  id: string;
  date: string; // YYYY-MM-DD
  totalEnergyExpenditure?: number; // GET in Kcal/dia
  caloricObjective: CaloricObjective;
  caloricAdjustment?: number;
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
  nutrientName: string;
  specificRecommendation?: string;
  prescribedSupplementation?: {
    dose?: string;
    frequency?: string;
    duration?: string;
  };
}

export interface MicronutrientRecommendation {
  id: string;
  date: string; // YYYY-MM-DD
  ageAtTimeOfRec?: number;
  sexAtTimeOfRec?: Gender;
  specialConditions?: string[];
  recommendations: MicronutrientDetail[];
}

export type AppointmentStatus = "scheduled" | "completed" | "cancelled";

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  description: string;
  status: AppointmentStatus;
}

// TACO Table Item Structure (based on provided JSON)
export interface TacoItem {
  id: number;
  alimento_descricao: string;
  umidade_percent?: number | null;
  energia_kcal?: number | null;
  energia_kj?: number | null;
  proteina_g?: number | null;
  lipidios_g?: number | null;
  colesterol_mg?: number | null;
  carboidrato_g?: number | null;
  fibra_alimentar_g?: number | null;
  cinzas_g?: number | null;
  calcio_mg?: number | null;
  magnesio_mg?: number | null;
  manganes_mg?: number | null;
  fosforo_mg?: number | null;
  ferro_mg?: number | null;
  sodio_mg?: number | null;
  potassio_mg?: number | null;
  cobre_mg?: number | null;
  zinco_mg?: number | null;
  retinol_mcg?: number | null;
  re_mcg?: number | null;
  rae_mcg?: number | null;
  tiamina_mg?: number | null;
  riboflavina_mg?: number | null;
  piridoxina_mg?: number | null;
  niacina_mg?: number | null;
  vitamina_c_mg?: number | null;
  categoria?: string | null;
  // Fatty acids - all optional and can be null
  "12:0"?: number | null;
  "14:0"?: number | null;
  "16:0"?: number | null;
  "18:0"?: number | null;
  "20:0"?: number | null;
  "22:0"?: number | null;
  "24:0"?: number | null;
  "14:1"?: number | null;
  "16:1"?: number | null;
  "18:1"?: number | null;
  "20:1"?: number | null;
  "18:2 n-6"?: number | null;
  "18:3 n-3"?: number | null;
  "20:4"?: number | null;
  "20:5"?: number | null;
  "22:5"?: number | null;
  "22:6"?: number | null;
  "18:1t"?: number | null;
  "18:2t"?: number | null;
}
