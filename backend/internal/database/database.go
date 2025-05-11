package database

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"

	"github.com/zenha/front-renutri/backend/internal/config"
)

var DB *mongo.Client
var NutritionistCollection *mongo.Collection

// ConnectDB initializes connection to MongoDB
func ConnectDB() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if config.AppConfig == nil || config.AppConfig.MongoURI == "" {
		log.Fatal("MongoDB URI not configured. Ensure LoadConfig() is called before ConnectDB().")
	}

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(config.AppConfig.MongoURI))
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}

	// Ping the primary
	if err := client.Ping(ctx, readpref.Primary()); err != nil {
		log.Fatalf("Failed to ping MongoDB: %v", err)
	}

	DB = client
	// Assuming your database name is part of the MONGODB_URI or you can hardcode/env var it.
	// For now, let's assume a DB name 'renutri_platform'. This should ideally come from config too.
	// Or, if your MONGODB_URI includes the DB name, you can parse it.
	// Example: mongodb://user:pass@host:port/renutri_platform?authSource=admin
	// If no DB name in URI, mongo-driver connects to a default 'test' db, or you need to specify.
	// For robust setup, parse DB name from URI or add DB_NAME to .env
	
	// Let's define a default database name for now. This should be configurable.
	dbName := "renutri_dev" // TODO: Make this configurable
	NutritionistCollection = DB.Database(dbName).Collection("nutritionists")

	log.Println("Successfully connected to MongoDB and database initialized!")
}

// GetCollection returns a handle to the specified collection
func GetCollection(collectionName string) *mongo.Collection {
	if DB == nil {
		log.Fatal("Database not connected. Call ConnectDB() first.")
	}
	// This needs the database name, as above.
	dbName := "renutri_dev" // TODO: Make this configurable
	return DB.Database(dbName).Collection(collectionName)
}

// DisconnectDB closes the MongoDB connection
func DisconnectDB() {
	if DB != nil {
		if err := DB.Disconnect(context.Background()); err != nil {
			log.Fatalf("Failed to disconnect from MongoDB: %v", err)
		}
		log.Println("Disconnected from MongoDB.")
	}
}
