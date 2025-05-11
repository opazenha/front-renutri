package auth

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/zenha/front-renutri/backend/internal/config"
)

// Claims defines the JWT claims structure for a nutritionist.
// We embed jwt.RegisteredClaims for standard claims like Expiration, IssuedAt.
// Add any custom claims you need (e.g., nutritionistID, role).
type Claims struct {
	NutritionistID string `json:"nutritionistId"`
	jwt.RegisteredClaims
}

// GenerateJWT generates a new JWT for a given nutritionist ID.
func GenerateJWT(nutritionistID string) (string, error) {
	if config.AppConfig == nil || config.AppConfig.JWTSecretKey == "" {
		return "", fmt.Errorf("JWT secret key not configured")
	}

	// Set token expiration (e.g., 24 hours)
	expirationTime := time.Now().Add(24 * time.Hour)

	claims := &Claims{
		NutritionistID: nutritionistID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "renutri-platform", // Optional: identifies the issuer
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(config.AppConfig.JWTSecretKey))
	if err != nil {
		return "", fmt.Errorf("failed to sign token: %w", err)
	}

	return tokenString, nil
}

// TODO: Add ValidateJWT function later if needed by middleware or other services directly.
// For now, middleware will handle parsing and validation.
