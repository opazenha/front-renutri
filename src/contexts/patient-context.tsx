"use client";

import type { Patient, AnthropometricRecord, FoodAssessment, MacronutrientRecommendation, MacronutrientAiInput } from "@/types";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs

interface PatientContextType {
  patients: Patient[];
  addPatient: (patientData: Omit<Patient, "id" | "registrationDate" | "anthropometricData" | "foodAssessment" | "recommendations">) => Patient;
  getPatientById: (id: string) => Patient | undefined;
  updatePatientAnthropometry: (patientId: string, data: Omit<AnthropometricRecord, "id" | "bmi">) => void;
  updatePatientFoodAssessment: (patientId: string, data: FoodAssessment) => void;
  addMacronutrientRecommendation: (patientId: string, input: MacronutrientAiInput, output: Omit<MacronutrientRecommendation, keyof MacronutrientAiInput | "id" | "dateGenerated">) => void;
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

  const addPatient = (patientData: Omit<Patient, "id" | "registrationDate" | "anthropometricData" | "foodAssessment" | "recommendations">) => {
    const newPatient: Patient = {
      ...patientData,
      id: uuidv4(),
      registrationDate: new Date().toISOString(),
      anthropometricData: [],
      foodAssessment: { dietaryPreferences: "", foodRestrictions: "", typicalMealPatterns: "", lastUpdated: new Date().toISOString() },
      recommendations: [],
    };
    setPatients((prevPatients) => [...prevPatients, newPatient]);
    return newPatient;
  };

  const getPatientById = (id: string) => {
    return patients.find((p) => p.id === id);
  };

  const updatePatientAnthropometry = (patientId: string, data: Omit<AnthropometricRecord, "id" | "bmi">) => {
    setPatients((prevPatients) =>
      prevPatients.map((p) => {
        if (p.id === patientId) {
          const bmi = data.weightKg / ((data.heightCm / 100) ** 2);
          const newRecord: AnthropometricRecord = { ...data, id: uuidv4(), bmi: parseFloat(bmi.toFixed(2)) };
          return { ...p, anthropometricData: [...p.anthropometricData, newRecord].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()) };
        }
        return p;
      })
    );
  };
  
  const updatePatientFoodAssessment = (patientId: string, data: Omit<FoodAssessment, 'lastUpdated'>) => {
    setPatients((prevPatients) =>
      prevPatients.map((p) => {
        if (p.id === patientId) {
          return { ...p, foodAssessment: { ...data, lastUpdated: new Date().toISOString() } };
        }
        return p;
      })
    );
  };

  const addMacronutrientRecommendation = (patientId: string, input: MacronutrientAiInput, output: Omit<MacronutrientRecommendation, keyof MacronutrientAiInput | "id" | "dateGenerated">) => {
    setPatients((prevPatients) =>
      prevPatients.map((p) => {
        if (p.id === patientId) {
          const newRecommendation: MacronutrientRecommendation = {
            ...input,
            ...output,
            id: uuidv4(),
            dateGenerated: new Date().toISOString(),
          };
          return { ...p, recommendations: [...p.recommendations, newRecommendation].sort((a,b) => new Date(b.dateGenerated).getTime() - new Date(a.dateGenerated).getTime()) };
        }
        return p;
      })
    );
  };


  return (
    <PatientContext.Provider value={{ patients, addPatient, getPatientById, updatePatientAnthropometry, updatePatientFoodAssessment, addMacronutrientRecommendation, isLoading }}>
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
