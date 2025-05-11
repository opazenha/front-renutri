package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/zenha/front-renutri/backend/internal/auth"
	"github.com/zenha/front-renutri/backend/internal/database"
	"github.com/zenha/front-renutri/backend/internal/models"
)

var validate = validator.New()

// RegisterRequest defines the structure for the registration request body
type RegisterRequest struct {
	Name                    string `json:"name" validate:"required,min=2,max=100"`
	Email                   string `json:"email" validate:"required,email"`
	Password                string `json:"password" validate:"required,min=8,max=72"` // bcrypt has a max password length of 72 bytes
	ProfessionalRegistration string `json:"professionalRegistration,omitempty"`
}

// RegisterNutritionist handles the creation of a new nutritionist user.
func RegisterNutritionist(c *gin.Context) {
	var req RegisterRequest

	// Bind JSON request to RegisterRequest struct
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload: " + err.Error()})
		return
	}

	// Validate the request struct
	if err := validate.Struct(req); err != nil {
		errors := make(map[string]string)
		for _, err := range err.(validator.ValidationErrors) {
			errors[err.Field()] = err.Tag() // Provides the field and the validation rule that failed
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validation failed", "details": errors})
		return
	}

	// Check if nutritionist already exists with the given email
	collection := database.NutritionistCollection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var existingNutritionist models.Nutritionist
	err := collection.FindOne(ctx, bson.M{"email": req.Email}).Decode(&existingNutritionist)
	if err == nil {
		// Found an existing nutritionist with this email
		c.JSON(http.StatusConflict, gin.H{"error": "Nutritionist with this email already exists"})
		return
	}
	if err != mongo.ErrNoDocuments {
		// Some other error occurred during DB lookup
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error checking for existing user: " + err.Error()})
		return
	}

	// Hash the password
	hashedPassword, err := auth.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password: " + err.Error()})
		return
	}

	// Create new nutritionist model
	newNutritionist := models.Nutritionist{
		ID:                      primitive.NewObjectID(),
		Name:                    req.Name,
		Email:                   req.Email,
		HashedPassword:          hashedPassword,
		ProfessionalRegistration: req.ProfessionalRegistration,
		CreatedAt:               time.Now(),
		UpdatedAt:               time.Now(),
	}

	// Insert into database
	_, err = collection.InsertOne(ctx, newNutritionist)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to register nutritionist: " + err.Error()})
		return
	}

	// Return success response (omitting password)
	c.JSON(http.StatusCreated, gin.H{
		"message": "Nutritionist registered successfully",
		"nutritionist": gin.H{
			"id":                        newNutritionist.ID.Hex(),
			"name":                      newNutritionist.Name,
			"email":                     newNutritionist.Email,
			"professionalRegistration": newNutritionist.ProfessionalRegistration,
			"createdAt":                 newNutritionist.CreatedAt,
		},
	})
}
