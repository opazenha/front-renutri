
"use client";

import type { Patient, AnthropometricRecord, LabExamRecord, EnergyExpenditureRecord, MacronutrientPlan, MicronutrientRecommendation, ActivityDetail, WorkActivityDetail, MicronutrientDetail, Appointment, Gender } from "@/types";
import type { AnthropometricFormData, LabExamFormData, EnergyExpenditureFormData, MacronutrientPlanFormData, MicronutrientRecommendationFormData, ActivityDetailFormData, WorkActivityDetailFormData, MicronutrientDetailFormData, AppointmentFormData } from "@/lib/schemas";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs
import { mockPatients } from "@/lib/mock-data"; // Import mock data
import type { AppointmentStatus } from "@/lib/schemas"; // Explicitly import AppointmentStatus
import { calculateAge } from "@/types";

interface PatientContextType {
  patients: Patient[];
  addPatient: (patientData: Omit<Patient, "id" | "registrationDate" | "anthropometricData" | "energyExpenditureRecords" | "macronutrientPlans" | "micronutrientRecommendations" | "appointments">) => Patient;
  getPatientById: (id: string) => Patient | undefined;
  updatePatientAnthropometry: (patientId: string, data: AnthropometricFormData) => void;
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
        if (Array.isArray(parsedPatients) && parsedPatients.length > 0) {
          patientsToSet = parsedPatients;
        } else {
          // If localStorage has an empty array or is invalid, use mock data.
          patientsToSet = mockPatients;
        }
      } else {
        // No patients in localStorage, use mock data.
        patientsToSet = mockPatients;
      }
    } catch (error) {
      console.error("Failed to parse patients from localStorage, using mock data.", error);
      patientsToSet = mockPatients; // Fallback to mock data on error
    }
    setPatients(patientsToSet);

    try {
        const storedAppointmentsJson = localStorage.getItem(LOCAL_STORAGE_KEY_APPOINTMENTS);
        if (storedAppointmentsJson) {
            const parsedAppointments = JSON.parse(storedAppointmentsJson) as Appointment[];
            if (Array.isArray(parsedAppointments)) {
                appointmentsToSet = parsedAppointments;
            } else {
                appointmentsToSet = []; // Default to empty if localStorage is invalid
            }
        } else {
             // Initialize appointments for mock patients if they don't exist in localStorage
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


  const addPatient = (patientData: Omit<Patient, "id" | "registrationDate" | "anthropometricData" | "energyExpenditureRecords" | "macronutrientPlans" | "micronutrientRecommendations" | "appointments">) => {
    const newPatient: Patient = {
      ...patientData,
      id: uuidv4(),
      registrationDate: new Date().toISOString(),
      anthropometricData: [],
      energyExpenditureRecords: [],
      macronutrientPlans: [],
      micronutrientRecommendations: [],
      appointments: [], 
    };
    setPatients((prevPatients) => [...prevPatients, newPatient]);
    return newPatient;
  };

  const updatePatientAnthropometry = (patientId: string, data: AnthropometricFormData) => {
    setPatients((prevPatients) =>
      prevPatients.map((p) => {
        if (p.id === patientId) {
          let bmi: number | undefined = undefined;
          if (data.weightKg && data.heightCm && data.heightCm > 0) {
            const heightInMeters = data.heightCm / 100;
            const calculatedBmi = data.weightKg / (heightInMeters * heightInMeters);
            bmi = parseFloat(calculatedBmi.toFixed(2));
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
            labExams: data.labExams?.map((exam: LabExamFormData) => ({
              ...exam,
              id: exam.id || uuidv4(), 
              result: exam.result as number, 
            } as LabExamRecord)) || [],
            smokingHabit: data.smokingHabit,
            smokingDetails: data.smokingDetails,
            alcoholConsumption: data.alcoholConsumption,
            alcoholDetails: data.alcoholDetails?.map(ad => ({...ad, id: ad.id || uuidv4()})),
            physicalActivityPractice: data.physicalActivityPractice,
            physicalActivitiesDetails: data.physicalActivitiesDetails?.map(pad => ({...pad, id: pad.id || uuidv4()})),
            stressLevel: data.stressLevel,
            perceivedQualityOfLife: data.perceivedQualityOfLife,
          };
          const updatedAnthropometricData = [...p.anthropometricData, newRecord].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          return { ...p, anthropometricData: updatedAnthropometricData };
        }
        return p;
      })
    );
  };

  const updatePatientEnergyExpenditure = (patientId: string, data: EnergyExpenditureFormData) => {
    setPatients(prevPatients => prevPatients.map(p => {
      if (p.id === patientId) {
        const newRecord: EnergyExpenditureRecord = {
          id: uuidv4(),
          consultationDate: data.consultationDate,
          weightKg: data.weightKg,
          restingEnergyExpenditure: data.restingEnergyExpenditure,
          gerFormula: data.gerFormula,
          sleepDuration: data.sleepDuration,
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
        const newPlan: MacronutrientPlan = {
          id: uuidv4(),
          date: data.date,
          totalEnergyExpenditure: data.totalEnergyExpenditure,
          caloricObjective: data.caloricObjective,
          caloricAdjustment: data.caloricAdjustment,
          proteinPercentage: data.proteinPercentage,
          carbohydratePercentage: data.carbohydratePercentage,
          lipidPercentage: data.lipidPercentage,
          proteinGramsPerKg: data.proteinGramsPerKg,
          carbohydrateGramsPerKg: data.carbohydrateGramsPerKg,
          lipidGramsPerKg: data.lipidGramsPerKg,
          weightForCalculation: data.weightForCalculation,
          activityFactor: data.activityFactor,
          injuryStressFactor: data.injuryStressFactor,
          specificConsiderations: data.specificConsiderations,
        };
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
          date: data.date,
          ageAtTimeOfRec: patientAge, // Use patient's current age
          sexAtTimeOfRec: patientGender, // Use patient's gender
          specialConditions: data.specialConditions || [],
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
      updatePatientAnthropometry, 
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


