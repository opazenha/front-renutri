
"use client";

import type { 
  Patient, AnthropometricRecord, LabExamRecord, EnergyExpenditureRecord, MacronutrientPlan, MicronutrientRecommendation, 
  ActivityDetail, WorkActivityDetail, MicronutrientDetail, Appointment, Gender,
  ClinicalAssessment, FoodAssessment, BehavioralAssessment, BiochemicalAssessment
} from "@/types";
import type { 
  AnthropometricFormData, LabExamFormData, EnergyExpenditureFormData, MacronutrientPlanFormData, 
  MicronutrientRecommendationFormData, ActivityDetailFormData, WorkActivityDetailFormData, MicronutrientDetailFormData, 
  AppointmentFormData, ClinicalAssessmentFormData, FoodAssessmentFormData, BehavioralAssessmentFormData, BiochemicalAssessmentFormData
} from "@/lib/schemas";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import { mockPatients } from "@/lib/mock-data";
import type { AppointmentStatus } from "@/lib/schemas";
import { calculateAge } from "@/types";

interface PatientContextType {
  patients: Patient[];
  addPatient: (patientData: Omit<Patient, "id" | "registrationDate" | "anthropometricData" | "energyExpenditureRecords" | "macronutrientPlans" | "micronutrientRecommendations" | "appointments" | "clinicalAssessments" | "foodAssessments" | "behavioralAssessments" | "biochemicalAssessments">) => Patient;
  getPatientById: (id: string) => Patient | undefined;
  
  updatePatientClinicalAssessment: (patientId: string, data: ClinicalAssessmentFormData) => void;
  updatePatientFoodAssessment: (patientId: string, data: FoodAssessmentFormData) => void;
  updatePatientBehavioralAssessment: (patientId: string, data: BehavioralAssessmentFormData) => void;
  updatePatientAnthropometry: (patientId: string, data: AnthropometricFormData) => void;
  updatePatientBiochemicalAssessment: (patientId: string, data: BiochemicalAssessmentFormData) => void;
  updatePatientEnergyExpenditure: (patientId: string, data: EnergyExpenditureFormData) => void;
  updatePatientMacronutrientPlan: (patientId: string, data: MacronutrientPlanFormData) => void;
  updatePatientMicronutrientRecommendation: (patientId: string, data: MicronutrientRecommendationFormData) => void;
  
  isLoading: boolean;

  appointments: Appointment[];
  addAppointment: (appointmentData: AppointmentFormData) => Appointment;
  getAppointmentsByDate: (date: string) => Appointment[];
  updateAppointmentStatus: (appointmentId: string, status: AppointmentStatus) => void;
  updateAppointment: (appointmentId: string, data: AppointmentFormData) => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PATIENTS = "renutri_patients";
const LOCAL_STORAGE_KEY_APPOINTMENTS = "renutri_appointments";


export const PatientProvider = ({ children }: { children: ReactNode }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
    setIsLoading(true);
    let patientsToSet: Patient[] = [];
    let appointmentsToSet: Appointment[] = [];

    try {
      const storedPatientsJson = localStorage.getItem(LOCAL_STORAGE_KEY_PATIENTS);
      if (storedPatientsJson) {
        const parsedPatients = JSON.parse(storedPatientsJson) as Patient[];
        // Ensure all necessary arrays exist for each patient
        patientsToSet = parsedPatients.map(p => ({
          ...p,
          anthropometricData: p.anthropometricData || [],
          energyExpenditureRecords: p.energyExpenditureRecords || [],
          macronutrientPlans: p.macronutrientPlans || [],
          micronutrientRecommendations: p.micronutrientRecommendations || [],
          clinicalAssessments: p.clinicalAssessments || [],
          foodAssessments: p.foodAssessments || [],
          behavioralAssessments: p.behavioralAssessments || [],
          biochemicalAssessments: p.biochemicalAssessments || [],
          appointments: p.appointments || [],
        }));

        if (patientsToSet.length === 0) { // If localStorage was valid but empty
             patientsToSet = mockPatients.map(p => ({ // Ensure mock patients also have all arrays
                ...p,
                clinicalAssessments: p.clinicalAssessments || [],
                foodAssessments: p.foodAssessments || [],
                behavioralAssessments: p.behavioralAssessments || [],
                biochemicalAssessments: p.biochemicalAssessments || [],
             }));
        }

      } else {
        patientsToSet = mockPatients.map(p => ({ // Ensure mock patients also have all arrays
            ...p,
            clinicalAssessments: p.clinicalAssessments || [],
            foodAssessments: p.foodAssessments || [],
            behavioralAssessments: p.behavioralAssessments || [],
            biochemicalAssessments: p.biochemicalAssessments || [],
         }));
      }
    } catch (error) {
      console.error("Failed to parse patients from localStorage, using mock data.", error);
      patientsToSet = mockPatients.map(p => ({ // Ensure mock patients also have all arrays
        ...p,
        clinicalAssessments: p.clinicalAssessments || [],
        foodAssessments: p.foodAssessments || [],
        behavioralAssessments: p.behavioralAssessments || [],
        biochemicalAssessments: p.biochemicalAssessments || [],
     }));
    }
    setPatients(patientsToSet);

    try {
        const storedAppointmentsJson = localStorage.getItem(LOCAL_STORAGE_KEY_APPOINTMENTS);
        if (storedAppointmentsJson) {
            const parsedAppointments = JSON.parse(storedAppointmentsJson) as Appointment[];
            if (Array.isArray(parsedAppointments)) {
                appointmentsToSet = parsedAppointments;
            } else {
                appointmentsToSet = [];
            }
        } else {
             const initialAppointments: Appointment[] = [];
             patientsToSet.forEach(p => {
                if(p.appointments && p.appointments.length > 0) {
                    initialAppointments.push(...p.appointments);
                }
             });
             appointmentsToSet = initialAppointments.length > 0 ? initialAppointments : [];
        }
    } catch (error) {
        console.error("Failed to parse appointments from localStorage, initializing based on patients or empty.", error);
        const initialAppointmentsFromPatients: Appointment[] = [];
        patientsToSet.forEach(p => {
            if(p.appointments && p.appointments.length > 0) {
                initialAppointmentsFromPatients.push(...p.appointments);
            }
         });
        appointmentsToSet = initialAppointmentsFromPatients.length > 0 ? initialAppointmentsFromPatients : [];
    }
    setAppointments(appointmentsToSet);

    setIsLoading(false);
  }, []);


  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_PATIENTS, JSON.stringify(patients));
      } catch (error) {
        console.error("Failed to save patients to localStorage", error);
      }
    }
  }, [patients, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_APPOINTMENTS, JSON.stringify(appointments));
      } catch (error) {
        console.error("Failed to save appointments to localStorage", error);
      }
    }
  }, [appointments, isLoading]);


  const addPatient = (patientData: Omit<Patient, "id" | "registrationDate" | "anthropometricData" | "energyExpenditureRecords" | "macronutrientPlans" | "micronutrientRecommendations" | "appointments" | "clinicalAssessments" | "foodAssessments" | "behavioralAssessments" | "biochemicalAssessments">) => {
    const newPatient: Patient = {
      ...patientData,
      id: uuidv4(),
      registrationDate: new Date().toISOString(),
      anthropometricData: [],
      energyExpenditureRecords: [],
      macronutrientPlans: [],
      micronutrientRecommendations: [],
      appointments: [], 
      clinicalAssessments: [],
      foodAssessments: [],
      behavioralAssessments: [],
      biochemicalAssessments: [],
    };
    setPatients((prevPatients) => [...prevPatients, newPatient]);
    return newPatient;
  };

  const updatePatientClinicalAssessment = (patientId: string, data: ClinicalAssessmentFormData) => {
    setPatients(prevPatients => prevPatients.map(p => {
      if (p.id === patientId) {
        const newRecord: ClinicalAssessment = { id: uuidv4(), ...data };
        const updatedRecords = [...(p.clinicalAssessments || []), newRecord].sort((a,b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime());
        return { ...p, clinicalAssessments: updatedRecords };
      }
      return p;
    }));
  };

  const updatePatientFoodAssessment = (patientId: string, data: FoodAssessmentFormData) => {
    setPatients(prevPatients => prevPatients.map(p => {
      if (p.id === patientId) {
        const newRecord: FoodAssessment = { 
          id: uuidv4(), 
          ...data,
          dietaryRecall24h: data.dietaryRecall24h?.map(item => ({...item, id: item.id || uuidv4()})),
          foodFrequency: data.foodFrequency?.map(item => ({...item, id: item.id || uuidv4()})),
        };
        const updatedRecords = [...(p.foodAssessments || []), newRecord].sort((a,b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime());
        return { ...p, foodAssessments: updatedRecords };
      }
      return p;
    }));
  };
  
  const updatePatientBehavioralAssessment = (patientId: string, data: BehavioralAssessmentFormData) => {
    setPatients(prevPatients => prevPatients.map(p => {
      if (p.id === patientId) {
        const newRecord: BehavioralAssessment = { 
          id: uuidv4(), 
          ...data,
          alcohol: data.alcohol ? {
            ...data.alcohol,
            beverages: data.alcohol.beverages?.map(bev => ({...bev, id: bev.id || uuidv4()}))
          } : undefined,
          physicalActivitiesDetails: data.physicalActivitiesDetails?.map(act => ({...act, id: act.id || uuidv4()})),
        };
        const updatedRecords = [...(p.behavioralAssessments || []), newRecord].sort((a,b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime());
        return { ...p, behavioralAssessments: updatedRecords };
      }
      return p;
    }));
  };

  const updatePatientAnthropometry = (patientId: string, data: AnthropometricFormData) => {
    setPatients((prevPatients) =>
      prevPatients.map((p) => {
        if (p.id === patientId) {
          let bmi: number | undefined = undefined;
          if (data.weightKg && data.heightCm && data.heightCm > 0) {
            const heightInMeters = data.heightCm / 100;
            bmi = parseFloat((data.weightKg / (heightInMeters * heightInMeters)).toFixed(2));
          }
          
          const newRecord: AnthropometricRecord = { 
            id: uuidv4(), 
            date: data.date,
            weightKg: data.weightKg,
            heightCm: data.heightCm,
            bmi: bmi,
            usualWeightKg: data.usualWeightKg,
            desiredWeightKg: data.desiredWeightKg,
            relaxedArmCircumference: data.relaxedArmCircumference,
            contractedArmCircumference: data.contractedArmCircumference,
            waistCircumference: data.waistCircumference,
            abdomenCircumference: data.abdomenCircumference,
            hipCircumference: data.hipCircumference,
            proximalThighCircumference: data.proximalThighCircumference,
            medialThighCircumference: data.medialThighCircumference,
            calfCircumference: data.calfCircumference,
            neckCircumference: data.neckCircumference,
            wristCircumference: data.wristCircumference,
            bicepsSkinfold: data.bicepsSkinfold,
            tricepsSkinfold: data.tricepsSkinfold,
            subscapularSkinfold: data.subscapularSkinfold,
            pectoralSkinfold: data.pectoralSkinfold,
            midaxillarySkinfold: data.midaxillarySkinfold,
            suprailiacSkinfold: data.suprailiacSkinfold,
            abdominalSkinfold: data.abdominalSkinfold,
            thighSkinfold: data.thighSkinfold,
            medialCalfSkinfold: data.medialCalfSkinfold,
            humerusBiepicondylarDiameter: data.humerusBiepicondylarDiameter,
            femurBiepicondylarDiameter: data.femurBiepicondylarDiameter,
            assessmentObjective: data.assessmentObjective,
          };
          const updatedAnthropometricData = [...p.anthropometricData, newRecord].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          return { ...p, anthropometricData: updatedAnthropometricData };
        }
        return p;
      })
    );
  };

  const updatePatientBiochemicalAssessment = (patientId: string, data: BiochemicalAssessmentFormData) => {
    setPatients(prevPatients => prevPatients.map(p => {
      if (p.id === patientId) {
        const newRecord: BiochemicalAssessment = { 
          id: uuidv4(), 
          assessmentDate: data.assessmentDate, // Or a fixed date like new Date().toISOString() if not part of form
          exams: data.exams.map(exam => ({...exam, id: exam.id || uuidv4()}) as LabExamRecord)
        };
        const updatedRecords = [...(p.biochemicalAssessments || []), newRecord].sort((a,b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime());
        return { ...p, biochemicalAssessments: updatedRecords };
      }
      return p;
    }));
  };

  const updatePatientEnergyExpenditure = (patientId: string, data: EnergyExpenditureFormData) => {
    setPatients(prevPatients => prevPatients.map(p => {
      if (p.id === patientId) {
        const newRecord: EnergyExpenditureRecord = {
          id: uuidv4(),
          ...data,
          physicalActivities: data.physicalActivities?.map((act: ActivityDetailFormData) => ({ ...act, id: act.id || uuidv4() } as ActivityDetail)) || [],
          workActivity: data.workActivity ? { ...data.workActivity, id: data.workActivity.id || uuidv4() } as WorkActivityDetail : undefined,
          otherActivities: data.otherActivities?.map((act: ActivityDetailFormData) => ({ ...act, id: act.id || uuidv4() } as ActivityDetail)) || [],
        };
        const updatedRecords = [...(p.energyExpenditureRecords || []), newRecord].sort((a,b) => new Date(b.consultationDate).getTime() - new Date(a.consultationDate).getTime());
        return { ...p, energyExpenditureRecords: updatedRecords };
      }
      return p;
    }));
  };

  const updatePatientMacronutrientPlan = (patientId: string, data: MacronutrientPlanFormData) => {
     setPatients(prevPatients => prevPatients.map(p => {
      if (p.id === patientId) {
        const newPlan: MacronutrientPlan = { id: uuidv4(), ...data };
        const updatedPlans = [...(p.macronutrientPlans || []), newPlan].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return { ...p, macronutrientPlans: updatedPlans };
      }
      return p;
    }));
  };
  
  const updatePatientMicronutrientRecommendation = (patientId: string, data: MicronutrientRecommendationFormData) => {
    setPatients(prevPatients => prevPatients.map(p => {
      if (p.id === patientId) {
        const patientAge = calculateAge(p.dob);
        const patientGender = p.gender;

        const newRecommendation: MicronutrientRecommendation = {
          id: uuidv4(),
          ...data,
          ageAtTimeOfRec: patientAge,
          sexAtTimeOfRec: patientGender,
          recommendations: data.recommendations?.map((rec: MicronutrientDetailFormData) => ({ 
            ...rec, 
            id: rec.id || uuidv4(),
            prescribedSupplementation: rec.prescribedSupplementation || {}
          } as MicronutrientDetail)) || [],
        };
        const updatedRecommendations = [...(p.micronutrientRecommendations || []), newRecommendation].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return { ...p, micronutrientRecommendations: updatedRecommendations };
      }
      return p;
    }));
  };

  const getPatientById = (id: string) => patients.find((p) => p.id === id);

  const addAppointment = (appointmentData: AppointmentFormData): Appointment => {
    const patient = getPatientById(appointmentData.patientId);
    if (!patient) {
      throw new Error("Paciente não encontrado para o agendamento.");
    }
    const newAppointment: Appointment = {
      ...appointmentData,
      id: uuidv4(),
      patientName: patient.name, 
    };
    setAppointments((prevAppointments) => 
        [...prevAppointments, newAppointment].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.time.localeCompare(b.time))
    );
    return newAppointment;
  };

  const getAppointmentsByDate = (date: string): Appointment[] => {
    return appointments.filter(app => app.date === date);
  };

  const updateAppointmentStatus = (appointmentId: string, status: AppointmentStatus) => {
    setAppointments(prevAppointments => 
      prevAppointments.map(app => 
        app.id === appointmentId ? { ...app, status } : app
      )
    );
  };

  const updateAppointment = (appointmentId: string, data: AppointmentFormData) => {
    setAppointments(prevAppointments => {
      const patient = getPatientById(data.patientId);
      if (!patient && data.patientId) {
        console.warn(`Patient with ID ${data.patientId} not found during appointment update for ${appointmentId}. Patient name may not be updated.`);
      }
      return prevAppointments.map(app =>
        app.id === appointmentId
          ? { ...app, ...data, patientName: patient ? patient.name : app.patientName } 
          : app
      ).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.time.localeCompare(b.time));
    });
  };


  return (
    <PatientContext.Provider value={{ 
      patients, 
      addPatient, 
      getPatientById, 
      updatePatientClinicalAssessment,
      updatePatientFoodAssessment,
      updatePatientBehavioralAssessment,
      updatePatientAnthropometry, 
      updatePatientBiochemicalAssessment,
      updatePatientEnergyExpenditure,
      updatePatientMacronutrientPlan,
      updatePatientMicronutrientRecommendation,
      isLoading,
      appointments,
      addAppointment,
      getAppointmentsByDate,
      updateAppointmentStatus,
      updateAppointment,
    }}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatientContext = () => {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error("usePatientContext must be used within a PatientProvider");
  }
  return context;
};

    