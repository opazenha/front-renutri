package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

// Config holds application configuration values
// For now, it only holds MONGODB_URI, but can be expanded
type Config struct {
	MongoURI string
	// Add other config fields here, e.g., JWTSecret, GinMode
}

var AppConfig *Config

// LoadConfig loads configuration from .env file and environment variables
func LoadConfig() {
	// Attempt to load .env file. If it doesn't exist, that's fine, 
	// environment variables might be set directly (e.g., in Docker).
	// The .env file should be in the same directory as the executable, 
	// or specify the path to godotenv.Load("../.env") if it's in project root relative to backend dir.
	// For Docker, this path might need adjustment or rely purely on env vars passed to container.
	// Assuming .env is in the backend directory for local dev if not using docker-compose's env_file.
	err := godotenv.Load() 
	if err != nil {
		log.Println("No .env file found or error loading it, relying on environment variables.")
	}

	mongoURI := os.Getenv("MONGODB_URI")
	if mongoURI == "" {
		log.Fatal("FATAL: MONGODB_URI environment variable is not set.")
	}

	AppConfig = &Config{
		MongoURI: mongoURI,
	}

	log.Println("Configuration loaded successfully. MONGODB_URI fetched.")
}
