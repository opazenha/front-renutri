package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/zenha/front-renutri/backend/internal/config"
	"github.com/zenha/front-renutri/backend/internal/database"
	"github.com/zenha/front-renutri/backend/internal/handlers"
)

// Logger is a middleware function to log requests
func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		t := time.Now()

		// Set request ID
		c.Set("RequestID", "some-request-id") // Replace with actual request ID generator if needed

		// Process request
		c.Next()

		// Log details
		latency := time.Since(t)
		log.Printf(
			"[REQUEST] %s %s - Status: %d, Latency: %s, RequestID: %s, ClientIP: %s",
			c.Request.Method,
			c.Request.RequestURI,
			c.Writer.Status(),
			latency,
			c.GetString("RequestID"),
			c.ClientIP(),
		)
	}
}

func init() {
	// Load configuration from .env file and environment variables
	config.LoadConfig()

	// Connect to MongoDB
	database.ConnectDB()
}

func main() {
	// Ensure MongoDB connection is closed when the application exits
	defer database.DisconnectDB()

	ginMode := os.Getenv("GIN_MODE")
	if ginMode == "release" {
		gin.SetMode(gin.ReleaseMode)
	} else {
		gin.SetMode(gin.DebugMode)
	}

	r := gin.New()       // Use gin.New() instead of gin.Default() to have more control over middleware
	r.Use(gin.Recovery()) // Add recovery middleware to catch panics
	r.Use(Logger())       // Add our custom logger

	r.GET("/healthz", func(c *gin.Context) {
		// Check DB connection as part of health check
		if err := database.DB.Ping(c.Request.Context(), nil); err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"status": "error", "message": "Database connection error"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "ok", "message": "Service is healthy"})
	})

	// API v1 routes
	apiV1 := r.Group("/api/v1")
	{
		authRoutes := apiV1.Group("/auth")
		{
			authRoutes.POST("/register", handlers.RegisterNutritionist)
			authRoutes.POST("/login", handlers.LoginNutritionist) // Add login route
			// Logout route will be added here later (POST /logout)
		}
		// Other v1 routes can be added here (e.g., for patients, assessments)
	}

	// Example of how to get a collection (will be used in handlers)
	// _ = database.GetCollection("nutritionists")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // Default port if not specified
	}

	log.Printf("Server starting on port %s in %s mode", port, gin.Mode())

	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
