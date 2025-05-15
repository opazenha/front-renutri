"use client";

import type { 
  Patient, AnthropometricRecord, LabExamRecord, EnergyExpenditureRecord, MacronutrientPlan, MicronutrientRecommendation, 
  ActivityDetail, WorkActivityDetail, MicronutrientDetail, Appointment, Gender, Message,
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
// import { fetchAppointmentsFromGoogle, createGoogleCalendarAppointment, updateGoogleCalendarAppointment } from "@/services/google-calendar-service"; // Import when ready to hook up

interface PatientContextType {
  patients: Patient[];
  addPatient: (patientData: Omit<Patient, "id" | "registrationDate" | "anthropometricData" | "energyExpenditureRecords" | "macronutrientPlans" | "micronutrientRecommendations" | "appointments" | "clinicalAssessments" | "foodAssessments" | "behavioralAssessments" | "biochemicalAssessments" | "messages">) => Patient;
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
  addAppointment: (appointmentData: AppointmentFormData) => Promise<Appointment>; // Changed to Promise
  getAppointmentsByDate: (date: string) => Appointment[];
  updateAppointmentStatus: (appointmentId: string, status: AppointmentStatus) => Promise<void>; // Changed to Promise
  updateAppointment: (appointmentId: string, data: AppointmentFormData) => Promise<void>; // Changed to Promise

  getMessagesByPatientId: (patientId: string) => Message[];
  getAllMessages: () => Message[];
  markMessageAsRead: (messageId: string, patientId: string) => void;
  getUnreadMessagesCountForPatient: (patientId: string) => number;
  getTotalUnreadMessagesCount: () => number;
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
          messages: p.messages || [], 
        }));

        if (patientsToSet.length === 0) { 
             patientsToSet = mockPatients.map(p => ({
                ...p,
                clinicalAssessments: p.clinicalAssessments || [],
                foodAssessments: p.foodAssessments || [],
                behavioralAssessments: p.behavioralAssessments || [],
                biochemicalAssessments: p.biochemicalAssessments || [],
                messages: p.messages || [],
             }));
        }

      } else {
        patientsToSet = mockPatients.map(p => ({
            ...p,
            clinicalAssessments: p.clinicalAssessments || [],
            foodAssessments: p.foodAssessments || [],
            behavioralAssessments: p.behavioralAssessments || [],
            biochemicalAssessments: p.biochemicalAssessments || [],
            messages: p.messages || [],
         }));
      }
    } catch (error) {
      console.error("Failed to parse patients from localStorage, using mock data.", error);
      patientsToSet = mockPatients.map(p => ({
        ...p,
        clinicalAssessments: p.clinicalAssessments || [],
        foodAssessments: p.foodAssessments || [],
        behavioralAssessments: p.behavioralAssessments || [],
        biochemicalAssessments: p.biochemicalAssessments || [],
        messages: p.messages || [],
     }));
    }
    setPatients(patientsToSet);

    // TODO: When Google Calendar integration is live, fetch appointments from there too.
    // const googleAppointments = await fetchAppointmentsFromGoogle(new Date(), addMonths(new Date(), 1));
    // This would merge with localStorage or prioritize Google Calendar data.

    try {
        const storedAppointmentsJson = localStorage.getItem(LOCAL_STORAGE_KEY_APPOINTMENTS);
        if (storedAppointmentsJson) {
            const parsedAppointments = JSON.parse(storedAppointmentsJson) as Appointment[];
            if (Array.isArray(parsedAppointments)) {
                appointmentsToSet = parsedAppointments;
            } else {
                appointmentsToSet = []; // Fallback to empty if stored data is not an array
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
    setAppointments(appointmentsToSet.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.time.localeCompare(b.time)));

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


  const addPatient = (patientData: Omit<Patient, "id" | "registrationDate" | "anthropometricData" | "energyExpenditureRecords" | "macronutrientPlans" | "micronutrientRecommendations" | "appointments" | "clinicalAssessments" | "foodAssessments" | "behavioralAssessments" | "biochemicalAssessments" | "messages">) => {
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
      messages: [],
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
            // Ensure all fields from type are present or optional
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
            observations: data.observations,
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
          assessmentDate: data.assessmentDate,
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

  const addAppointment = async (appointmentData: AppointmentFormData): Promise<Appointment> => {
    const patient = getPatientById(appointmentData.patientId);
    if (!patient) {
      throw new Error("Paciente não encontrado para o agendamento.");
    }
    
    // TODO: Call server action to createGoogleCalendarAppointment(appointmentData, patient.name);
    // const googleAppointment = await createGoogleCalendarAppointment(appointmentData, patient.name);
    // For now, use mock creation:
    const googleAppointment = { id: `gcal-${Date.now()}`, ...appointmentData };


    const newAppointment: Appointment = {
      ...appointmentData,
      id: googleAppointment.id, // Use ID from Google Calendar response if available
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

  const updateAppointmentStatus = async (appointmentId: string, status: AppointmentStatus) => {
    // TODO: Call server action to update Google Calendar event status.
    // This might involve fetching the event, modifying it, and then updating.
    // await updateGoogleCalendarAppointment(appointmentId, { status: status }); 
    // For now, just update local state:
    setAppointments(prevAppointments => 
      prevAppointments.map(app => 
        app.id === appointmentId ? { ...app, status } : app
      )
    );
  };

  const updateAppointment = async (appointmentId: string, data: AppointmentFormData) => {
     const patient = getPatientById(data.patientId);
      if (!patient && data.patientId) {
        console.warn(`Patient with ID ${data.patientId} not found during appointment update for ${appointmentId}. Patient name may not be updated.`);
      }
    // TODO: Call server action to updateGoogleCalendarAppointment(appointmentId, data, patient?.name || '');
    // For now, just update local state:
    setAppointments(prevAppointments => {
      return prevAppointments.map(app =>
        app.id === appointmentId
          ? { ...app, ...data, patientName: patient ? patient.name : app.patientName } 
          : app
      ).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.time.localeCompare(b.time));
    });
  };

  const getMessagesByPatientId = (patientId: string): Message[] => {
    const patient = patients.find(p => p.id === patientId);
    return patient?.messages || [];
  };

  const getAllMessages = (): Message[] => {
    return patients.reduce((acc, p) => acc.concat(p.messages || []), [] as Message[])
                   .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const markMessageAsRead = (messageId: string, patientId: string) => {
    setPatients(prevPatients => 
      prevPatients.map(p => {
        if (p.id === patientId) {
          return {
            ...p,
            messages: (p.messages || []).map(msg => 
              msg.id === messageId ? { ...msg, isRead: true } : msg
            ),
          };
        }
        return p;
      })
    );
  };

  const getUnreadMessagesCountForPatient = (patientId: string): number => {
    const patient = patients.find(p => p.id === patientId);
    return (patient?.messages || []).filter(msg => !msg.isRead).length;
  };

  const getTotalUnreadMessagesCount = (): number => {
    return patients.reduce((count, p) => count + (p.messages || []).filter(msg => !msg.isRead).length, 0);
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
      getMessagesByPatientId,
      getAllMessages,
      markMessageAsRead,
      getUnreadMessagesCountForPatient,
      getTotalUnreadMessagesCount,
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
