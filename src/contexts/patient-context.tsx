
"use client";

import type { Patient, AnthropometricRecord } from "@/types";
import type { AnthropometricFormData } from "@/lib/schemas";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs

interface PatientContextType {
  patients: Patient[];
  addPatient: (patientData: Omit<Patient, "id" | "registrationDate" | "anthropometricData">) => Patient;
  getPatientById: (id: string) => Patient | undefined;
  updatePatientAnthropometry: (patientId: string, data: AnthropometricFormData) => void;
  isLoading: boolean;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "renutri_patients";

export const PatientProvider = ({ children }: { children: ReactNode }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedPatients = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedPatients) {
        setPatients(JSON.parse(storedPatients));
      }
    } catch (error) {
      console.error("Failed to load patients from localStorage", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(patients));
      } catch (error) {
        console.error("Failed to save patients to localStorage", error);
      }
    }
  }, [patients, isLoading]);

  const addPatient = (patientData: Omit<Patient, "id" | "registrationDate" | "anthropometricData">) => {
    const newPatient: Patient = {
      ...patientData,
      id: uuidv4(),
      registrationDate: new Date().toISOString(),
      anthropometricData: [],
    };
    setPatients((prevPatients) => [...prevPatients, newPatient]);
    return newPatient;
  };

  const getPatientById = (id: string) => {
    return patients.find((p) => p.id === id);
  };

  const updatePatientAnthropometry = (patientId: string, data: AnthropometricFormData) => {
    setPatients((prevPatients) =>
      prevPatients.map((p) => {
        if (p.id === patientId) {
          let bmi: number | undefined = undefined;
          if (data.weightKg && data.heightCm && data.heightCm > 0) {
            const calculatedBmi = data.weightKg / ((data.heightCm / 100) ** 2);
            bmi = parseFloat(calculatedBmi.toFixed(2));
          }
          
          const newRecord: AnthropometricRecord = { 
            ...data, // Spread all form data
            id: uuidv4(), 
            bmi: bmi,
            // Ensure all optional fields from schema are included, even if undefined
            usualWeightKg: data.usualWeightKg,
            desiredWeightKg: data.desiredWeightKg,
            smokingStatus: data.smokingStatus,
            smokingStartDate: data.smokingStartDate,
            smokingProductType: data.smokingProductType,
            smokingQuantityPerDay: data.smokingQuantityPerDay,
            smokingStopTime: data.smokingStopTime,
            alcoholConsumptionStatus: data.alcoholConsumptionStatus,
            alcoholStartDate: data.alcoholStartDate,
            alcoholMainBeverageType: data.alcoholMainBeverageType,
            alcoholMainBeverageFrequency: data.alcoholMainBeverageFrequency,
            alcoholMainBeverageQuantity: data.alcoholMainBeverageQuantity,
            alcoholMainBeverageUnit: data.alcoholMainBeverageUnit,
            alcoholMainBeverageContent: data.alcoholMainBeverageContent,
            alcoholOtherBeveragesNotes: data.alcoholOtherBeveragesNotes,
            alcoholStopTime: data.alcoholStopTime,
            physicalActivityStatus: data.physicalActivityStatus,
            physicalActivities: data.physicalActivities,
            physicalActivityFrequency: data.physicalActivityFrequency,
            physicalActivityDuration: data.physicalActivityDuration,
            physicalActivityIntensity: data.physicalActivityIntensity,
            stressLevel: data.stressLevel,
            perceivedQualityOfLife: data.perceivedQualityOfLife,
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

          // Add new record and sort by date descending
          const updatedAnthropometricData = [...p.anthropometricData, newRecord].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          return { ...p, anthropometricData: updatedAnthropometricData };
        }
        return p;
      })
    );
  };

  return (
    <PatientContext.Provider value={{ patients, addPatient, getPatientById, updatePatientAnthropometry, isLoading }}>
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
