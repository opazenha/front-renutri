package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

// Nutritionist represents a nutritionist user in the system.
// BSON tags are for MongoDB mapping.
// Validate tags are for request body validation (e.g., using go-playground/validator)
type Nutritionist struct {
	ID                      primitive.ObjectID `bson:"_id,omitempty"`
	Name                    string             `bson:"name" validate:"required,min=2,max=100"`
	Email                   string             `bson:"email" validate:"required,email"`
	HashedPassword          string             `bson:"hashedPassword" validate:"required"` // Store only the hashed password
	ProfessionalRegistration string            `bson:"professionalRegistration,omitempty"` // e.g., CRN number
	CreatedAt               time.Time          `bson:"createdAt"`
	UpdatedAt               time.Time          `bson:"updatedAt"`
	// Consider adding roles if you plan for different access levels later
	// Role string `bson:"role,omitempty" validate:"omitempty,oneof=admin standard"`
}
