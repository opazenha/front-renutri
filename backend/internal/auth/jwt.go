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

// ValidateJWT parses and validates a JWT string. 
// It returns the claims if the token is valid, otherwise an error.
func ValidateJWT(tokenString string) (*Claims, error) {
	if config.AppConfig == nil || config.AppConfig.JWTSecretKey == "" {
		return nil, fmt.Errorf("JWT secret key not configured")
	}

	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		// Check the signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(config.AppConfig.JWTSecretKey), nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		// Check if token is expired (though ParseWithClaims usually handles this for 'exp' claim)
		if time.Unix(claims.ExpiresAt.Unix(), 0).Before(time.Now()) {
			return nil, fmt.Errorf("token is expired")
		}
		return claims, nil
	}

	return nil, fmt.Errorf("invalid token")
}
