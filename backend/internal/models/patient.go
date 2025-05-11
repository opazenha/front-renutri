package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// ContactInfo holds contact details for a patient.
type ContactInfo struct {
	Phone string `json:"phone,omitempty" bson:"phone,omitempty"`
	Email string `json:"email,omitempty" bson:"email,omitempty"`
}

// Address holds address details for a patient.
type Address struct {
	Street   string `json:"street,omitempty" bson:"street,omitempty"`
	City     string `json:"city,omitempty" bson:"city,omitempty"`
	State    string `json:"state,omitempty" bson:"state,omitempty"`
	ZipCode  string `json:"zipCode,omitempty" bson:"zipCode,omitempty"`
	Country  string `json:"country,omitempty" bson:"country,omitempty"`
}

// MedicalHistory holds medical history details for a patient.
type MedicalHistory struct {
	PersonalDiseases  string `json:"personalDiseases,omitempty" bson:"personalDiseases,omitempty"` // Could be []string for multiple
	FamilyDiseases    string `json:"familyDiseases,omitempty" bson:"familyDiseases,omitempty"`   // Could be []string
	Medications       string `json:"medications,omitempty" bson:"medications,omitempty"`         // Could be []string
	Allergies         string `json:"allergies,omitempty" bson:"allergies,omitempty"`             // Could be []string
	PreviousSurgeries string `json:"previousSurgeries,omitempty" bson:"previousSurgeries,omitempty"` // Could be []string
}

// Lifestyle holds lifestyle details for a patient.
type Lifestyle struct {
	PhysicalActivityLevel string `json:"physicalActivityLevel,omitempty" bson:"physicalActivityLevel,omitempty"` // e.g., Sedentary, Light, Moderate, Intense
	PhysicalActivityType  string `json:"physicalActivityType,omitempty" bson:"physicalActivityType,omitempty"`
	Smoking              string `json:"smoking,omitempty" bson:"smoking,omitempty"`                      // e.g., No, Yes (X cigarettes/day), Former
	AlcoholConsumption   string `json:"alcoholConsumption,omitempty" bson:"alcoholConsumption,omitempty"` // e.g., No, Socially, Moderate, Heavy
	SleepQuality         string `json:"sleepQuality,omitempty" bson:"sleepQuality,omitempty"`             // e.g., Good, Fair, Poor
}

// DietaryHistory holds dietary history details for a patient.
type DietaryHistory struct {
	PreviousDiets   string `json:"previousDiets,omitempty" bson:"previousDiets,omitempty"`
	FoodPreferences string `json:"foodPreferences,omitempty" bson:"foodPreferences,omitempty"`
	FoodAversions   string `json:"foodAversions,omitempty" bson:"foodAversions,omitempty"`
	EatingHabits    string `json:"eatingHabits,omitempty" bson:"eatingHabits,omitempty"` // e.g., Regular meals, Skips breakfast, Late-night snacking
}

// Patient represents a patient in the system.
type Patient struct {
	ID                     primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	NutritionistID         primitive.ObjectID `json:"nutritionistId" bson:"nutritionistId" validate:"required"`
	Name                   string             `json:"name" bson:"name" validate:"required,min=2,max=100"`
	DateOfBirth            time.Time          `json:"dateOfBirth" bson:"dateOfBirth" validate:"required"`
	Gender                 string             `json:"gender,omitempty" bson:"gender,omitempty"` // e.g., Male, Female, Other, Prefer not to say
	ContactInfo            ContactInfo        `json:"contactInfo,omitempty" bson:"contactInfo,omitempty"`
	Address                Address            `json:"address,omitempty" bson:"address,omitempty"`
	Occupation             string             `json:"occupation,omitempty" bson:"occupation,omitempty"`
	ReasonForConsultation  string             `json:"reasonForConsultation" bson:"reasonForConsultation" validate:"required"`
	MedicalHistory         MedicalHistory     `json:"medicalHistory,omitempty" bson:"medicalHistory,omitempty"`
	Lifestyle              Lifestyle          `json:"lifestyle,omitempty" bson:"lifestyle,omitempty"`
	DietaryHistory         DietaryHistory     `json:"dietaryHistory,omitempty" bson:"dietaryHistory,omitempty"`
	AnthropometricDataIDs  []primitive.ObjectID `json:"anthropometricDataIds,omitempty" bson:"anthropometricDataIds,omitempty"` // Links to AnthropometricAssessment records
	BiochemicalDataIDs     []primitive.ObjectID `json:"biochemicalDataIds,omitempty" bson:"biochemicalDataIds,omitempty"`       // Links to BiochemicalAssessment records
	FoodDataIDs            []primitive.ObjectID `json:"foodDataIds,omitempty" bson:"foodDataIds,omitempty"`                   // Links to FoodAssessment records
	ClinicalDataIDs        []primitive.ObjectID `json:"clinicalDataIds,omitempty" bson:"clinicalDataIds,omitempty"`             // Links to ClinicalAssessment records
	CreatedAt              time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt              time.Time          `json:"updatedAt" bson:"updatedAt"`
}
