import type { Patient, AnthropometricRecord, EnergyExpenditureRecord, MacronutrientPlan, MicronutrientRecommendation, LabExamRecord, ActivityDetail, WorkActivityDetail, MicronutrientDetail, Appointment, Gender } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { format, subDays, subMonths, subYears, addMonths } from 'date-fns';
import { calculateAge } from '@/types';

// Helper to create dates relative to today
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

const createAnthropometricRecords = (patientId: string, baseWeight: number, baseHeight: number, numRecords: number = 2): AnthropometricRecord[] => {
  const records: AnthropometricRecord[] = [];
  for (let i = 0; i < numRecords; i++) {
    const recordDate = subMonths(today, i * 3); // Records every 3 months approx
    const currentWeight = baseWeight - i * 2; // Simulating weight change
    const heightInMeters = baseHeight / 100;
    const bmi = parseFloat((currentWeight / (heightInMeters * heightInMeters)).toFixed(2));

    records.push({
      id: uuidv4(),
      date: formatDateYYYYMMDD(recordDate),
      weightKg: currentWeight,
      heightCm: baseHeight,
      bmi: bmi,
      usualWeightKg: baseWeight + 5,
      desiredWeightKg: baseWeight - 10,
      waistCircumference: 80 + i * 1.5,
      hipCircumference: 95 + i * 1,
      assessmentObjective: "Perda de peso e melhoria da saúde geral",
      labExams: i === 0 ? createLabExams(2) : [], // Add exams only to the latest record for simplicity
      // Add more fields as needed
    });
  }
  return records.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const createEnergyExpenditureRecords = (patientId: string, weight: number, numRecords: number = 1): EnergyExpenditureRecord[] => {
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
        { id: uuidv4(), type: "Yoga", duration: "2x semana, 60 min", mets: 2.5, intensity: "Leve" }
      ],
      workActivity: { id: uuidv4(), description: "Trabalho de escritório", timeSpent: "8 horas/dia", occupationalActivityFactor: "1.2" },
      otherActivities: [],
    });
  }
  return records.sort((a,b) => new Date(b.consultationDate).getTime() - new Date(a.consultationDate).getTime());
};

const createMacronutrientPlans = (patientId: string, baseTEE: number, numRecords: number = 1): MacronutrientPlan[] => {
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
      weightForCalculation: 70 - (i * 2),
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
      recommendations: commonMicronutrientsList.slice(0, 5).map(name => ({
        id: uuidv4(),
        nutrientName: name,
        specificRecommendation: name === "Vitamina D" ? "2000 UI/dia" : "",
        prescribedSupplementation: name === "Vitamina D" ? { dose: "2000 UI", frequency: "1x/dia", duration: "3 meses"} : {},
      })),
    });
  }
  return recs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};


export const mockPatients: Patient[] = [
  {
    id: "1",
    name: "Ana Silva",
    dob: "1990-05-15",
    gender: "female",
    registrationDate: formatDateISO(subYears(today, 2)),
    anthropometricData: createAnthropometricRecords("1", 75, 165, 3),
    energyExpenditureRecords: createEnergyExpenditureRecords("1", 75, 2),
    macronutrientPlans: createMacronutrientPlans("1", 2000, 2),
    micronutrientRecommendations: [], // Will be populated by the helper
    appointments: [],
  },
  {
    id: "2",
    name: "Bruno Costa",
    dob: "1985-09-20",
    gender: "male",
    registrationDate: formatDateISO(subYears(today, 1)),
    anthropometricData: createAnthropometricRecords("2", 85, 180, 2),
    energyExpenditureRecords: [
      { 
        id: uuidv4(), 
        consultationDate: formatDateYYYYMMDD(subMonths(today, 1)), 
        weightKg: 85,
        restingEnergyExpenditure: 1800,
        physicalActivities: [
          { id: uuidv4(), type: "Musculação pesada", duration: "5x semana, 90 min", mets: 6.0, intensity: "Intensa" },
          { id: uuidv4(), type: "Corrida (10km/h)", duration: "3x semana, 45 min", mets: 10.0, intensity: "Intensa" },
        ],
        workActivity: { id: uuidv4(), description: "Engenheiro de Software", timeSpent: "8 horas/dia", occupationalActivityFactor: "1.3" },
        otherActivities: [],
        sleepDuration: "7",
      }
    ],
    macronutrientPlans: [
      {
        id: uuidv4(),
        date: formatDateYYYYMMDD(subMonths(today, 1)),
        totalEnergyExpenditure: 2800,
        caloricObjective: "Ganho de Massa",
        caloricAdjustment: 500,
        proteinGramsPerKg: 2.0, // Example of g/kg
        carbohydratePercentage: 50,
        lipidPercentage: 25, // Protein % will be calculated from g/kg and total calories
        weightForCalculation: 85,
        specificConsiderations: "Foco em recuperação muscular e hidratação.",
      }
    ],
    micronutrientRecommendations: [],
    appointments: [],
  },
  {
    id: "3",
    name: "Carla Dias",
    dob: "1978-02-10",
    gender: "female",
    registrationDate: formatDateISO(subYears(today, 3)),
    anthropometricData: createAnthropometricRecords("3", 65, 160, 3),
    energyExpenditureRecords: createEnergyExpenditureRecords("3", 65, 1),
    macronutrientPlans: createMacronutrientPlans("3", 1800, 1),
    micronutrientRecommendations: [],
    appointments: [],
  },
  {
    id: "4",
    name: "Daniel Faria",
    dob: "2000-11-30",
    gender: "male",
    registrationDate: formatDateISO(subMonths(today, 6)),
    anthropometricData: createAnthropometricRecords("4", 95, 175, 2),
    energyExpenditureRecords: [
       { 
        id: uuidv4(), 
        consultationDate: formatDateYYYYMMDD(subMonths(today, 1)), 
        weightKg: 95,
        restingEnergyExpenditure: 1900,
        physicalActivities: [
          { id: uuidv4(), type: "Nenhuma regular", duration: "", intensity: "Leve" },
        ],
        workActivity: { id: uuidv4(), description: "Estudante", timeSpent: "6 horas/dia sentado", occupationalActivityFactor: "1.1" },
        otherActivities: [],
        sleepDuration: "8",
      }
    ],
    macronutrientPlans: [
      {
        id: uuidv4(),
        date: formatDateYYYYMMDD(subMonths(today, 1)),
        totalEnergyExpenditure: 2200,
        caloricObjective: "Perda de Peso",
        caloricAdjustment: -400,
        proteinPercentage: 25,
        carbohydratePercentage: 45,
        lipidPercentage: 30,
        weightForCalculation: 95,
        specificConsiderations: "Incentivar início de atividade física leve.",
      }
    ],
    micronutrientRecommendations: [],
    appointments: [],
  },
  {
    id: "5",
    name: "Elisa Moreira",
    dob: "1995-07-01",
    gender: "female",
    registrationDate: formatDateISO(subYears(today, 1)),
    anthropometricData: createAnthropometricRecords("5", 60, 170, 2),
    energyExpenditureRecords: [
      { 
        id: uuidv4(), 
        consultationDate: formatDateYYYYMMDD(subMonths(today, 2)), 
        weightKg: 60,
        restingEnergyExpenditure: 1400,
        physicalActivities: [
          { id: uuidv4(), type: "Corrida de Longa Distância", duration: "4x semana, 75 min", mets: 9.0, intensity: "Intensa" },
          { id: uuidv4(), type: "Treinamento de Força", duration: "2x semana, 60 min", mets: 5.0, intensity: "Moderada" },
        ],
        workActivity: { id: uuidv4(), description: "Personal Trainer", timeSpent: "6 horas/dia", occupationalActivityFactor: "1.6" },
        otherActivities: [],
        sleepDuration: "7",
      }
    ],
    macronutrientPlans: [
       {
        id: uuidv4(),
        date: formatDateYYYYMMDD(subMonths(today, 2)),
        totalEnergyExpenditure: 2500,
        caloricObjective: "Manutenção",
        proteinGramsPerKg: 1.8,
        carbohydratePercentage: 55,
        lipidPercentage: 25, // Approx
        weightForCalculation: 60,
        specificConsiderations: "Adequar hidratação e reposição de eletrólitos. Monitorar ferro.",
      }
    ],
    micronutrientRecommendations: [],
    appointments: [],
  },
];

// Populate micronutrient recommendations after patients are defined
mockPatients.forEach(patient => {
  patient.micronutrientRecommendations = createMicronutrientRecommendations(patient, 1);
});
