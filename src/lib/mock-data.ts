
import type {
  ActivityDetail,
  AlcoholicBeverageRecord,
  AnthropometricRecord,
  Appointment,
  BehavioralAssessment,
  BiochemicalAssessment,
  ClinicalAssessment,
  EnergyExpenditureRecord,
  FoodAssessment,
  FoodFrequencyRecord,
  Gender,
  LabExamRecord,
  MacronutrientPlan,
  MealRecord,
  Message,
  MicronutrientDetail,
  MicronutrientRecommendation,
  Patient,
  WorkActivityDetail,
} from "@/types";
import { calculateAge } from "@/types";
import {
  addMonths,
  format,
  subDays,
  subHours,
  subMonths,
  subYears,
} from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { activityMetsValues } from "./mets-data"; // Import METs data

const today = new Date();
const formatDateISO = (date: Date): string => date.toISOString();
const formatDateYYYYMMDD = (date: Date): string => format(date, "yyyy-MM-dd");

const commonMicronutrientsList = [
  "Vitamina A",
  "Vitamina C",
  "Vitamina D",
  "Vitamina E",
  "Tiamina (B1)",
  "Riboflavina (B2)",
  "Niacina (B3)",
  "Vitamina B6",
  "Folato (B9)",
  "Vitamina B12",
  "Cálcio",
  "Fósforo",
  "Magnésio",
  "Ferro",
  "Zinco",
  "Cobre",
  "Selênio",
  "Iodo",
  "Sódio",
  "Potássio",
  "Cloreto",
];

const createLabExams = (count: number = 2): LabExamRecord[] => {
  const exams: LabExamRecord[] = [];
  const examNames = [
    "Glicemia de Jejum",
    "Colesterol Total",
    "Triglicerídeos",
    "Vitamina D",
    "Ferritina",
  ];
  for (let i = 0; i < count; i++) {
    exams.push({
      id: uuidv4(),
      collectionDate: formatDateYYYYMMDD(
        subDays(today, Math.floor(Math.random() * 90) + 15)
      ),
      examName: examNames[i % examNames.length],
      result: Math.floor(Math.random() * 100) + 50,
      unit: "mg/dL",
      referenceRange: "70-99 mg/dL",
    });
  }
  return exams;
};

const createBiochemicalAssessments = (
  numRecords: number = 1
): BiochemicalAssessment[] => {
  const assessments: BiochemicalAssessment[] = [];
  for (let i = 0; i < numRecords; i++) {
    assessments.push({
      id: uuidv4(),
      assessmentDate: formatDateYYYYMMDD(subMonths(today, i * 3)),
      exams: createLabExams(Math.floor(Math.random() * 3) + 2), // 2 to 4 exams per assessment
    });
  }
  return assessments.sort(
    (a, b) =>
      new Date(b.assessmentDate).getTime() -
      new Date(a.assessmentDate).getTime()
  );
};

const createAnthropometricRecords = (
  numRecords: number = 2,
  baseWeight: number,
  baseHeight: number
): AnthropometricRecord[] => {
  const records: AnthropometricRecord[] = [];
  for (let i = 0; i < numRecords; i++) {
    const recordDate = subMonths(today, i * 3);
    const currentWeight = baseWeight - i * 2;
    const heightInMeters = baseHeight / 100;
    const bmi = parseFloat(
      (currentWeight / (heightInMeters * heightInMeters)).toFixed(2)
    );

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
      // Adding mock behavioral data within anthropometric for simplicity as requested previously
      smokingHabit: i % 2 === 0 ? "Não" : "Ex-fumante",
      alcoholConsumption: i % 2 === 0 ? "Sim" : "Não",
      physicalActivityPractice: "Sim",
      stressLevel: "Moderado",
    });
  }
  return records.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

const createEnergyExpenditureRecords = (
  weight: number,
  numRecords: number = 1
): EnergyExpenditureRecord[] => {
  const records: EnergyExpenditureRecord[] = [];
  const activityKeys = Object.keys(activityMetsValues);

  for (let i = 0; i < numRecords; i++) {
    const randomActivityKey = activityKeys[Math.floor(Math.random() * activityKeys.length)];
    records.push({
      id: uuidv4(),
      consultationDate: formatDateYYYYMMDD(subMonths(today, i * 2)),
      weightKg: weight - i,
      restingEnergyExpenditure: 1400 + (i * 50) - (Math.random() * 100), // GEB example
      gerFormula: "Harris-Benedict",
      sleepDuration: 7 + (Math.random() * 1.5 - 0.75), 
      physicalActivities: [
        {
          id: uuidv4(),
          type: randomActivityKey,
          frequency: `${Math.floor(Math.random() * 3) + 2}x/semana`,
          duration: `${Math.floor(Math.random() * 30) + 30} min/dia`,
          mets: activityMetsValues[randomActivityKey],
          intensity: "Moderada",
        },
         {
          id: uuidv4(),
          type: "Musculação média",
          frequency: "2x/semana",
          duration: "60 min",
          mets: 4.5,
          intensity: "Moderada",
        },
      ],
      workActivity: {
        id: uuidv4(),
        description: "Trabalho de escritório",
        timeSpent: "8 horas/dia",
        mets: 1.5, // Typical for light office work
        occupationalActivityFactor: "1.4", // Example
      },
      otherActivities: [
        {
            id: uuidv4(),
            type: "Tarefas domésticas leves",
            duration: "1 hora/dia",
            mets: 2.0,
        }
      ],
    });
  }
  return records.sort(
    (a, b) =>
      new Date(b.consultationDate).getTime() -
      new Date(a.consultationDate).getTime()
  );
};

const createMacronutrientPlans = (
  baseTEE: number, // This is the GET
  weight: number,
  numRecords: number = 1
): MacronutrientPlan[] => {
  const plans: MacronutrientPlan[] = [];
  const objectives: CaloricObjective[] = ["Manutenção", "Perda de Peso", "Ganho de Massa"];
  for (let i = 0; i < numRecords; i++) {
    const objective = objectives[i % objectives.length];
    let caloricAdjustment = 0;
    if (objective === "Perda de Peso") caloricAdjustment = -300 - Math.floor(Math.random() * 200);
    if (objective === "Ganho de Massa") caloricAdjustment = 300 + Math.floor(Math.random() * 200);

    plans.push({
      id: uuidv4(),
      date: formatDateYYYYMMDD(subMonths(today, i * 2)),
      totalEnergyExpenditure: baseTEE - (i * 100) + Math.floor(Math.random() * 100 - 50), // GET example
      caloricObjective: objective,
      caloricAdjustment: caloricAdjustment,
      proteinPercentage: 15 + Math.floor(Math.random() * 10), // 15-25%
      carbohydratePercentage: 45 + Math.floor(Math.random() * 10), // 45-55%
      lipidPercentage: 100 - ( (15 + Math.floor(Math.random() * 10)) + (45 + Math.floor(Math.random() * 10)) ), // Remainder for lipids
      proteinGramsPerKg: parseFloat(( ( (baseTEE + caloricAdjustment) * ( (15 + Math.floor(Math.random() * 10)) / 100 ) ) / 4 / weight).toFixed(1)),
      weightForCalculation: weight - i * 2,
      activityFactor: 1.55 + (Math.random() * 0.4 - 0.2), // Example activity factor
      injuryStressFactor: 1.0,
      specificConsiderations: "Aumentar ingestão de fibras e água. Monitorar hidratação.",
    });
  }
  return plans.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

const createMicronutrientRecommendations = (
  patient: Patient,
  numRecords: number = 1
): MicronutrientRecommendation[] => {
  const recs: MicronutrientRecommendation[] = [];
  for (let i = 0; i < numRecords; i++) {
    recs.push({
      id: uuidv4(),
      date: formatDateYYYYMMDD(subMonths(today, i * 2)),
      ageAtTimeOfRec: calculateAge(patient.dob),
      sexAtTimeOfRec: patient.gender as Gender,
      specialConditions: i % 2 === 0 ? ["Baixa exposição solar"] : [],
      recommendations: commonMicronutrientsList.slice(0, 3).map((name) => ({
        id: uuidv4(),
        nutrientName: name,
        specificRecommendation: name === "Vitamina D" ? "2000 UI/dia" : "",
        prescribedSupplementation:
          name === "Vitamina D"
            ? { dose: "2000 UI", frequency: "1x/dia", duration: "3 meses" }
            : {},
      })),
    });
  }
  return recs.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

const createClinicalAssessments = (
  numRecords: number = 1
): ClinicalAssessment[] => {
  const assessments: ClinicalAssessment[] = [];
  for (let i = 0; i < numRecords; i++) {
    assessments.push({
      id: uuidv4(),
      assessmentDate: formatDateYYYYMMDD(subMonths(today, i * 4)),
      queixaPrincipal: "Cansaço excessivo e dificuldade para perder peso.",
      historiaDoencaAtual:
        "Paciente relata ganho de peso progressivo nos últimos 2 anos, associado a sedentarismo e aumento do estresse.",
      historiaMedicaPregressa:
        "Nega comorbidades prévias significativas. Nega cirurgias.",
      historiaFamiliar: "Mãe com DM2, pai com HAS.",
      assessmentObjective: "Avaliação clínica de rotina para acompanhamento nutricional.",
      habits: {
        horasSono: 6 + Math.floor(Math.random()*3) -1,
        qualidadeSono: ["Bom", "Regular", "Ruim"][Math.floor(Math.random()*3)] as SleepQuality,
        fuma: i % 3 === 0 ? "Sim" : ( i % 3 === 1 ? "Não" : "Ex-fumante"),
        tipoCigarro: i % 3 === 0 ? "Comercial" : undefined,
        frequenciaCigarro: i % 3 === 0 ? "Diário" : undefined,
        quantidadeCigarro: i % 3 === 0 ? "10-15" : undefined,
        consomeBebidaAlcoolica: i % 2 === 0 ? "Sim" : "Não",
        tipoBebidaAlcoolica: i % 2 === 0 ? "Cerveja" : undefined,
        frequenciaBebidaAlcoolica: i % 2 === 0 ? "Fins de semana" : undefined,
        quantidadeBebidaAlcoolica: i % 2 === 0 ? "3-4 latas" : undefined,
      },
      signsAndSymptoms: {
        obstipacao: "Sim",
        distensaoAbdominal: "Sim",
        cansacoFadiga: "Sim",
        alteracoesApetite: "Aumentado",
        refluxo: i % 2 === 0 ? "Sim" : "Não",
      },
      specificQuestions: {
        nasceuDeParto: "A termo",
        funcionamentoIntestinal: "Obstipado",
        corDaUrina: "Clara (normal)",
        usoMedicamentos: "Nenhum regular.",
      },
    });
  }
  return assessments.sort(
    (a, b) =>
      new Date(b.assessmentDate).getTime() -
      new Date(a.assessmentDate).getTime()
  );
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
        {
          id: uuidv4(),
          mealType: "Desjejum",
          time: "08:00",
          foodItem: "Pão francês com manteiga, café com açúcar",
          quantity: "2 unidades, 1 xícara",
        },
        {
          id: uuidv4(),
          mealType: "Almoço",
          time: "13:00",
          foodItem: "Arroz, feijão, bife grelhado, salada de alface e tomate",
          quantity: "4 col sopa, 1 concha, 1 unidade média, à vontade",
        },
        {
          id: uuidv4(),
          mealType: "Jantar",
          time: "20:00",
          foodItem: "Pizza",
          quantity: "3 fatias",
        },
      ],
      foodFrequency: [
        {
          id: uuidv4(),
          foodOrGroup: "Refrigerantes",
          consumptionFrequency: "Diário",
          usualPortion: "2 copos",
        },
        {
          id: uuidv4(),
          foodOrGroup: "Frutas",
          consumptionFrequency: "X vezes/semana",
          usualPortion: "1-2 porções",
        },
      ],
    });
  }
  return assessments.sort(
    (a, b) =>
      new Date(b.assessmentDate).getTime() -
      new Date(a.assessmentDate).getTime()
  );
};

const createBehavioralAssessments = (
  numRecords: number = 1
): BehavioralAssessment[] => {
  const assessments: BehavioralAssessment[] = [];
  const activityTypes = ["Caminhada", "Corrida", "Natação", "Musculação", "Dança"];
  const intensities: IntensityLevel[] = ["Leve", "Moderada", "Intensa"];

  for (let i = 0; i < numRecords; i++) {
    assessments.push({
      id: uuidv4(),
      assessmentDate: formatDateYYYYMMDD(subMonths(today, i * 4)),
      smoking: { 
        status: i % 3 === 0 ? "Sim" : ( i % 3 === 1 ? "Não" : "Ex-fumante"),
        inicio: i % 3 === 0 ? "18 anos" : undefined,
        tipoProduto: i % 3 === 0 ? "Cigarro" : undefined,
        quantidadeDia: i % 3 === 0 ? "10" : undefined,
        tempoParou: i % 3 === 2 ? "2 anos" : undefined,
      },
      alcohol: {
        status: i % 2 === 0 ? "Sim" : "Não",
        inicioConsumo: i % 2 === 0 ? "20 anos" : undefined,
        beverages: i % 2 === 0 ? [
          {
            id: uuidv4(),
            type: "Chopp/cerveja",
            frequency: "2x/semana",
            quantityPerOccasion: Math.floor(Math.random() * 3) + 2,
            unitOfMeasure: "Canecas",
            alcoholContent: 5,
          },
        ] : [],
      },
      physicalActivityPractice: i % 2 === 0 ? "Sim" : "Não",
      physicalActivitiesDetails: i % 2 === 0 ? [
        {
          id: uuidv4(),
          type: activityTypes[Math.floor(Math.random() * activityTypes.length)],
          frequency: `${Math.floor(Math.random() * 3) + 2}x/semana`,
          duration: `${Math.floor(Math.random() * 30) + 30} min`,
          intensity: intensities[Math.floor(Math.random() * intensities.length)],
          mets: parseFloat((Math.random() * 5 + 3).toFixed(1)), // Random METs between 3 and 8
        },
      ] : [],
      stressLevel: ["Baixo", "Moderado", "Alto"][Math.floor(Math.random()*3)] as StressLevelType,
      perceivedQualityOfLife: ["Boa", "Regular", "Poderia ser melhor"][Math.floor(Math.random()*3)],
    });
  }
  return assessments.sort(
    (a, b) =>
      new Date(b.assessmentDate).getTime() -
      new Date(a.assessmentDate).getTime()
  );
};

const createMessages = (
  patientId: string,
  patientName: string,
  count: number
): Message[] => {
  const messages: Message[] = [];
  const sources: Array<"whatsapp" | "gmail"> = ["whatsapp", "gmail"];
  for (let i = 0; i < count; i++) {
    const isRead = Math.random() > 0.5;
    const source = sources[Math.floor(Math.random() * sources.length)];
    messages.push({
      id: uuidv4(),
      patientId,
      patientName,
      source,
      sender:
        source === "whatsapp"
          ? `+55 11 98765-432${i}`
          : `paciente${i}@example.com`,
      timestamp: subHours(
        subDays(today, i),
        Math.floor(Math.random() * 24)
      ).toISOString(),
      content: `Esta é uma mensagem de teste número ${
        i + 1
      } de ${patientName} via ${source}. ${
        isRead ? "(Lida)" : "(Não lida)"
      } Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
      isRead,
    });
  }
  return messages.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

export let mockPatients: Patient[] = [
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
      {
        id: uuidv4(),
        patientId: "1",
        patientName: "Ana Silva",
        date: formatDateYYYYMMDD(addMonths(today, 1)),
        time: "10:00",
        description: "Consulta de retorno",
        status: "scheduled",
      },
      {
        id: uuidv4(),
        patientId: "1",
        patientName: "Ana Silva",
        date: formatDateYYYYMMDD(today),
        time: "14:30",
        description: "Avaliação inicial",
        status: "scheduled",
      },
    ],
    messages: [], // Will be populated later
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
      {
        id: uuidv4(),
        patientId: "2",
        patientName: "Bruno Costa",
        date: formatDateYYYYMMDD(subDays(today, 5)),
        time: "09:00",
        description: "Acompanhamento",
        status: "completed",
      },
    ],
    messages: [],
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
    messages: [],
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
    energyExpenditureRecords: createEnergyExpenditureRecords(95, 1),
    macronutrientPlans: createMacronutrientPlans(2200, 95, 1),
    micronutrientRecommendations: [],
    appointments: [],
    messages: [],
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
    energyExpenditureRecords: createEnergyExpenditureRecords(60, 1),
    macronutrientPlans: createMacronutrientPlans(2500, 60, 1),
    micronutrientRecommendations: [],
    appointments: [],
    messages: [],
  },
];

mockPatients = mockPatients.map((patient) => {
  patient.micronutrientRecommendations = createMicronutrientRecommendations(
    patient,
    1
  );
  patient.messages = createMessages(
    patient.id,
    patient.name,
    Math.floor(Math.random() * 5) + 1
  ); // 1 to 5 messages
  return patient;
});

