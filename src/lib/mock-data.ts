
import type { Patient, AnthropometricRecord, EnergyExpenditureRecord, MacronutrientPlan, MicronutrientRecommendation, LabExamRecord, ActivityDetail, WorkActivityDetail, MicronutrientDetail, Appointment, Gender, ClinicalAssessment, FoodAssessment, BehavioralAssessment, BiochemicalAssessment, MealRecord, FoodFrequencyRecord, AlcoholicBeverageRecord } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { format, subDays, subMonths, subYears, addMonths } from 'date-fns';
import { calculateAge } from '@/types';

const today = new Date();
const formatDateISO = (date: Date): string => date.toISOString();
const formatDateYYYYMMDD = (date: Date): string => format(date, "yyyy-MM-dd");

const commonMicronutrientsList = [
  "Vitamina A", "Vitamina C", "Vitamina D", "Vitamina E", "Tiamina (B1)", 
  "Riboflavina (B2)", "Niacina (B3)", "Vitamina B6", "Folato (B9)", "Vitamina B12",
  "Cálcio", "Fósforo", "Magnésio", "Ferro", "Zinco", "Cobre", "Selênio", "Iodo",
  "Sódio", "Potássio", "Cloreto"
];

const createLabExams = (count: number = 2): LabExamRecord[] => {
  const exams: LabExamRecord[] = [];
  const examNames = ["Glicemia de Jejum", "Colesterol Total", "Triglicerídeos", "Vitamina D", "Ferritina"];
  for (let i = 0; i < count; i++) {
    exams.push({
      id: uuidv4(),
      collectionDate: formatDateYYYYMMDD(subDays(today, Math.floor(Math.random() * 90) + 15)),
      examName: examNames[i % examNames.length],
      result: Math.floor(Math.random() * 100) + 50,
      unit: "mg/dL",
      referenceRange: "70-99 mg/dL",
    });
  }
  return exams;
};

const createBiochemicalAssessments = (numRecords: number = 1): BiochemicalAssessment[] => {
  const assessments: BiochemicalAssessment[] = [];
  for (let i = 0; i < numRecords; i++) {
    assessments.push({
      id: uuidv4(),
      assessmentDate: formatDateYYYYMMDD(subMonths(today, i * 3)),
      exams: createLabExams(Math.floor(Math.random() * 3) + 2), // 2 to 4 exams per assessment
    });
  }
  return assessments.sort((a,b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime());
};


const createAnthropometricRecords = (numRecords: number = 2, baseWeight: number, baseHeight: number): AnthropometricRecord[] => {
  const records: AnthropometricRecord[] = [];
  for (let i = 0; i < numRecords; i++) {
    const recordDate = subMonths(today, i * 3);
    const currentWeight = baseWeight - i * 2;
    const heightInMeters = baseHeight / 100;
    const bmi = parseFloat((currentWeight / (heightInMeters * heightInMeters)).toFixed(2));

    records.push({
      id: uuidv4(),
      date: formatDateYYYYMMDD(recordDate),
      weightKg: currentWeight,
      heightCm: baseHeight,
      bmi: bmi,
      usualWeightKg: baseWeight + 2,
      desiredWeightKg: baseWeight - 5,
      waistCircumference: 80 + i * 1.5,
      hipCircumference: 95 + i * 1,
      assessmentObjective: "Perda de peso e melhoria da saúde geral",
    });
  }
  return records.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const createEnergyExpenditureRecords = (weight: number, numRecords: number = 1): EnergyExpenditureRecord[] => {
  const records: EnergyExpenditureRecord[] = [];
  for (let i = 0; i < numRecords; i++) {
    records.push({
      id: uuidv4(),
      consultationDate: formatDateYYYYMMDD(subMonths(today, i * 2)),
      weightKg: weight - i,
      restingEnergyExpenditure: 1500 + (i * 50),
      gerFormula: "Harris-Benedict",
      sleepDuration: "7.5",
      physicalActivities: [
        { id: uuidv4(), type: "Caminhada leve (3km/h)", duration: "30 min/dia", mets: 3.0, intensity: "Leve" },
      ],
      workActivity: { id: uuidv4(), description: "Trabalho de escritório", timeSpent: "8 horas/dia", occupationalActivityFactor: "1.2" },
      otherActivities: [],
    });
  }
  return records.sort((a,b) => new Date(b.consultationDate).getTime() - new Date(a.consultationDate).getTime());
};

const createMacronutrientPlans = (baseTEE: number, weight: number, numRecords: number = 1): MacronutrientPlan[] => {
  const plans: MacronutrientPlan[] = [];
  for (let i = 0; i < numRecords; i++) {
    plans.push({
      id: uuidv4(),
      date: formatDateYYYYMMDD(subMonths(today, i * 2)),
      totalEnergyExpenditure: baseTEE - (i * 100),
      caloricObjective: "Perda de Peso",
      caloricAdjustment: -500,
      proteinPercentage: 20,
      carbohydratePercentage: 50,
      lipidPercentage: 30,
      weightForCalculation: weight - (i * 2),
      specificConsiderations: "Aumentar ingestão de fibras e água.",
    });
  }
  return plans.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const createMicronutrientRecommendations = (patient: Patient, numRecords: number = 1): MicronutrientRecommendation[] => {
  const recs: MicronutrientRecommendation[] = [];
  for (let i = 0; i < numRecords; i++) {
    recs.push({
      id: uuidv4(),
      date: formatDateYYYYMMDD(subMonths(today, i * 2)),
      ageAtTimeOfRec: calculateAge(patient.dob),
      sexAtTimeOfRec: patient.gender as Gender,
      specialConditions: i % 2 === 0 ? ["Baixa exposição solar"] : [],
      recommendations: commonMicronutrientsList.slice(0, 3).map(name => ({
        id: uuidv4(),
        nutrientName: name,
        specificRecommendation: name === "Vitamina D" ? "2000 UI/dia" : "",
        prescribedSupplementation: name === "Vitamina D" ? { dose: "2000 UI", frequency: "1x/dia", duration: "3 meses"} : {},
      })),
    });
  }
  return recs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const createClinicalAssessments = (numRecords: number = 1): ClinicalAssessment[] => {
    const assessments: ClinicalAssessment[] = [];
    for (let i = 0; i < numRecords; i++) {
        assessments.push({
            id: uuidv4(),
            assessmentDate: formatDateYYYYMMDD(subMonths(today, i * 4)),
            queixaPrincipal: "Cansaço excessivo e dificuldade para perder peso.",
            historiaDoencaAtual: "Paciente relata ganho de peso progressivo nos últimos 2 anos, associado a sedentarismo e aumento do estresse.",
            historiaMedicaPregressa: "Nega comorbidades prévias significativas. Nega cirurgias.",
            historiaFamiliar: "Mãe com DM2, pai com HAS.",
            habits: {
                horasSono: 6,
                qualidadeSono: "Regular",
                fuma: "Não",
                consomeBebidaAlcoolica: "Sim",
                tipoBebidaAlcoolica: "Cerveja",
                frequenciaBebidaAlcoolica: "Fins de semana",
                quantidadeBebidaAlcoolica: "3-4 latas",
            },
            signsAndSymptoms: {
                obstipacao: "Sim",
                distensaoAbdominal: "Sim",
                cansacoFadiga: "Sim",
                alteracoesApetite: "Aumentado",
            },
            specificQuestions: {
                nasceuDeParto: "A termo",
                funcionamentoIntestinal: "Obstipado",
                corDaUrina: "Clara (normal)",
                usoMedicamentos: "Nenhum regular."
            }
        });
    }
    return assessments.sort((a,b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime());
};

const createFoodAssessments = (numRecords: number = 1): FoodAssessment[] => {
    const assessments: FoodAssessment[] = [];
    for (let i = 0; i < numRecords; i++) {
        assessments.push({
            id: uuidv4(),
            assessmentDate: formatDateYYYYMMDD(subMonths(today, i * 4)),
            previousNutritionalCounseling: "Sim",
            objectiveOfPreviousCounseling: "Perda de peso",
            counselingProfessional: "Nutricionista",
            appetite: "Aumentado",
            mealLocation: "Casa e trabalho",
            mealPreparer: "Próprio / Restaurante",
            waterConsumption: "1.5L/dia",
            dietaryRecall24h: [
                {id: uuidv4(), mealType: "Desjejum", time: "08:00", foodItem: "Pão francês com manteiga, café com açúcar", quantity: "2 unidades, 1 xícara"},
                {id: uuidv4(), mealType: "Almoço", time: "13:00", foodItem: "Arroz, feijão, bife grelhado, salada de alface e tomate", quantity: "4 col sopa, 1 concha, 1 unidade média, à vontade"},
                {id: uuidv4(), mealType: "Jantar", time: "20:00", foodItem: "Pizza", quantity: "3 fatias"},
            ],
            foodFrequency: [
                {id: uuidv4(), foodOrGroup: "Refrigerantes", consumptionFrequency: "Diário", usualPortion: "2 copos"},
                {id: uuidv4(), foodOrGroup: "Frutas", consumptionFrequency: "X vezes/semana", usualPortion: "1-2 porções"},
            ]
        });
    }
    return assessments.sort((a,b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime());
};

const createBehavioralAssessments = (numRecords: number = 1): BehavioralAssessment[] => {
    const assessments: BehavioralAssessment[] = [];
    for (let i = 0; i < numRecords; i++) {
        assessments.push({
            id: uuidv4(),
            assessmentDate: formatDateYYYYMMDD(subMonths(today, i*4)),
            smoking: { status: "Não" },
            alcohol: {
                status: "Sim",
                inicioConsumo: "20 anos",
                beverages: [
                    {id: uuidv4(), type: "Chopp/cerveja", frequency: "2x/semana", quantityPerOccasion: 3, unitOfMeasure: "Canecas", alcoholContent: 5},
                ]
            },
            physicalActivityPractice: "Não",
            stressLevel: "Moderado",
            perceivedQualityOfLife: "Regular, poderia ser melhor."
        });
    }
    return assessments.sort((a,b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime());
}


export const mockPatients: Patient[] = [
  {
    id: "1",
    name: "Ana Silva",
    dob: "1990-05-15",
    gender: "female",
    schooling: "Ensino Superior Completo",
    maritalStatus: "Casado(a)",
    profession: "Advogada",
    registrationDate: formatDateISO(subYears(today, 2)),
    clinicalAssessments: createClinicalAssessments(2),
    foodAssessments: createFoodAssessments(1),
    behavioralAssessments: createBehavioralAssessments(1),
    anthropometricData: createAnthropometricRecords(3, 75, 165),
    biochemicalAssessments: createBiochemicalAssessments(2),
    energyExpenditureRecords: createEnergyExpenditureRecords(75, 2),
    macronutrientPlans: createMacronutrientPlans(2000, 75, 2),
    micronutrientRecommendations: [], // Will be populated later
    appointments: [
        { id: uuidv4(), patientId: "1", patientName: "Ana Silva", date: formatDateYYYYMMDD(addMonths(today,1)), time: "10:00", description: "Consulta de retorno", status: "scheduled" },
        { id: uuidv4(), patientId: "1", patientName: "Ana Silva", date: formatDateYYYYMMDD(today), time: "14:30", description: "Avaliação inicial", status: "scheduled" },
    ],
  },
  {
    id: "2",
    name: "Bruno Costa",
    dob: "1985-09-20",
    gender: "male",
    schooling: "Mestrado",
    maritalStatus: "Solteiro(a)",
    profession: "Engenheiro de Software",
    registrationDate: formatDateISO(subYears(today, 1)),
    clinicalAssessments: createClinicalAssessments(1),
    foodAssessments: createFoodAssessments(1),
    behavioralAssessments: createBehavioralAssessments(1),
    anthropometricData: createAnthropometricRecords(2, 85, 180),
    biochemicalAssessments: createBiochemicalAssessments(1),
    energyExpenditureRecords: createEnergyExpenditureRecords(85, 1),
    macronutrientPlans: createMacronutrientPlans(2800, 85, 1),
    micronutrientRecommendations: [],
    appointments: [
         { id: uuidv4(), patientId: "2", patientName: "Bruno Costa", date: formatDateYYYYMMDD(subDays(today,5)), time: "09:00", description: "Acompanhamento", status: "completed" }
    ],
  },
  {
    id: "3",
    name: "Carla Dias",
    dob: "1978-02-10",
    gender: "female",
    schooling: "Doutorado",
    maritalStatus: "Divorciado(a)",
    profession: "Professora Universitária",
    registrationDate: formatDateISO(subYears(today, 3)),
    clinicalAssessments: createClinicalAssessments(3),
    foodAssessments: createFoodAssessments(2),
    behavioralAssessments: createBehavioralAssessments(2),
    anthropometricData: createAnthropometricRecords(3, 65, 160),
    biochemicalAssessments: createBiochemicalAssessments(3),
    energyExpenditureRecords: createEnergyExpenditureRecords(65, 1),
    macronutrientPlans: createMacronutrientPlans(1800, 65, 1),
    micronutrientRecommendations: [],
    appointments: [],
  },
  {
    id: "4",
    name: "Daniel Faria",
    dob: "2000-11-30",
    gender: "male",
    schooling: "Ensino Médio Completo",
    maritalStatus: "Solteiro(a)",
    profession: "Estudante",
    registrationDate: formatDateISO(subMonths(today, 6)),
    clinicalAssessments: createClinicalAssessments(1),
    foodAssessments: createFoodAssessments(1),
    behavioralAssessments: createBehavioralAssessments(1),
    anthropometricData: createAnthropometricRecords(2, 95, 175),
    biochemicalAssessments: createBiochemicalAssessments(1),
    energyExpenditureRecords: createEnergyExpenditureRecords(95,1),
    macronutrientPlans: createMacronutrientPlans(2200, 95,1),
    micronutrientRecommendations: [],
    appointments: [],
  },
  {
    id: "5",
    name: "Elisa Moreira",
    dob: "1995-07-01",
    gender: "female",
    schooling: "Ensino Superior Completo",
    maritalStatus: "Solteiro(a)",
    profession: "Personal Trainer",
    registrationDate: formatDateISO(subYears(today, 1)),
    clinicalAssessments: createClinicalAssessments(1),
    foodAssessments: createFoodAssessments(1),
    behavioralAssessments: createBehavioralAssessments(1),
    anthropometricData: createAnthropometricRecords(2, 60, 170),
    biochemicalAssessments: createBiochemicalAssessments(1),
    energyExpenditureRecords: createEnergyExpenditureRecords(60,1),
    macronutrientPlans: createMacronutrientPlans(2500, 60,1),
    micronutrientRecommendations: [],
    appointments: [],
  },
];

mockPatients.forEach(patient => {
  patient.micronutrientRecommendations = createMicronutrientRecommendations(patient, 1);
});

    