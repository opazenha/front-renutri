package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/zenha/front-renutri/backend/internal/auth"
)

const (
	authorizationHeaderKey  = "Authorization"
	authorizationTypeBearer = "bearer"
	userPayloadKey          = "currentUserClaims" // Key to store user claims in Gin context
)

// AuthMiddleware creates a gin.HandlerFunc for JWT authentication.
// It checks for a valid JWT in the Authorization header.
// If valid, it stores the claims in the Gin context.
// If invalid or missing, it aborts with a 401 Unauthorized error.
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader(authorizationHeaderKey)
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is missing"})
			return
		}

		parts := strings.Fields(authHeader)
		if len(parts) != 2 || strings.ToLower(parts[0]) != authorizationTypeBearer {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header format must be Bearer <token>"})
			return
		}

		tokenString := parts[1]
		claims, err := auth.ValidateJWT(tokenString)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token: " + err.Error()})
			return
		}

		// Set claims in context for downstream handlers to use
		c.Set(userPayloadKey, claims)
		c.Next()
	}
}
