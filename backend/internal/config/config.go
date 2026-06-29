package config

import (
	"log/slog"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Port                string
	Env                 string
	BaseURL             string
	FrontendURL         string
	MongoURI            string
	MongoDBName         string
	MongoTimeoutSeconds int
	JWTSecret           string
	JWTExpireHours      int
	ResendAPIKey        string
	ResendFromEmail     string
	PistonAPIURL        string
	PistonAPIKey        string
	FirebaseProjectID   string
	FirebaseClientEmail string
	FirebasePrivateKey  string
}

func LoadConfig() *Config {
	if err := godotenv.Load(); err != nil {
		slog.Info("No .env file found, using system environment variables")
	}

	return &Config {
		Port:                getEnv("PORT", "8080"),
		Env:                 getEnv("ENV", "development"),
		BaseURL:             getEnv("BASE_URL", "http://localhost:8080"),
		FrontendURL:         getEnv("FRONTEND_URL", "http://localhost:5173"),
		MongoURI:            getEnv("MONGO_URI", "mongodb://localhost:27017"),
		MongoDBName:         getEnv("MONGO_DB_NAME", "horizon"),
		MongoTimeoutSeconds: getEnvAsInt("MONGO_TIMEOUT_SECONDS", 10),
		JWTSecret:           getEnv("JWT_SECRET", "your-secret-key"),
		JWTExpireHours:      getEnvAsInt("JWT_EXPIRY_HOURS", 24),
		ResendAPIKey:        getEnv("RESEND_API_KEY", ""),
		ResendFromEmail:     getEnv("RESEND_FROM_EMAIL", "onboarding@resend.dev"),
		PistonAPIURL:        getEnv("PISTON_API_URL", "https://emkc.org/api/v2/piston"),
		PistonAPIKey:        getEnv("PISTON_API_KEY", ""),
		FirebaseProjectID:   getEnv("FIREBASE_PROJECT_ID", ""),
		FirebaseClientEmail: getEnv("FIREBASE_CLIENT_EMAIL", ""),
		FirebasePrivateKey:  getEnv("FIREBASE_PRIVATE_KEY", ""),
	}
}

func getEnv(key, defaultVal string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultVal
}

func getEnvAsInt(key string, defaultVal int) int {
	valueStr := getEnv(key, "")
	if value, err := strconv.Atoi(valueStr); err == nil {
		return value
	}
	return defaultVal
}