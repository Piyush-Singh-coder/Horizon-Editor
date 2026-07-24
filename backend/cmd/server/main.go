package main

import (
	"log/slog"
	"os"

	"github.com/Piyush-Singh-coder/horizon-golang/internal/config"
	"github.com/Piyush-Singh-coder/horizon-golang/internal/database"
	"github.com/Piyush-Singh-coder/horizon-golang/internal/handler"
	"github.com/Piyush-Singh-coder/horizon-golang/internal/repository"
	"github.com/Piyush-Singh-coder/horizon-golang/internal/router"
	"github.com/Piyush-Singh-coder/horizon-golang/internal/service"
	"github.com/Piyush-Singh-coder/horizon-golang/internal/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
	// Initialize structured logger
	slog.SetDefault(slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo})))

	slog.Info("Loading configuration...")
	cfg := config.LoadConfig()

	// Connect to MongoDB
	dbClient, err := database.ConnectDB(cfg)
	if err != nil {
		slog.Error("Failed to connect to MongoDB", "error", err)
		os.Exit(1)
	}
	defer func() {
		if err := dbClient.Disconnect(); err != nil {
			slog.Error("Failed to disconnect database client", "error", err)
		}
	}()

	// Connect to AWS DynamoDB (if DB_TYPE=dynamodb or AWS credentials exist)
	isDynamo := os.Getenv("DB_TYPE") == "dynamodb"
	dynamoClient, err := database.ConnectDynamoDB(cfg)
	if err != nil {
		slog.Warn("DynamoDB connection skipped/failed. Defaulting to MongoDB", "error", err)
		isDynamo = false
	} else if isDynamo {
		slog.Info("DB_TYPE=dynamodb detected. Primary database switched to AWS DynamoDB!")
	}

	// Initialize Repositories
	userRepo := repository.NewUserRepository(dbClient, dynamoClient, isDynamo)
	execRepo := repository.NewExecutionRepository(dbClient, dynamoClient, isDynamo)

	// Initialize Firebase Auth Client
	firebaseAuth, err := utils.InitFirebase(cfg)
	if err != nil {
		slog.Warn("Firebase Admin Client initialization skipped/failed. Google Authentication will be disabled", "error", err)
	} else {
		slog.Info("Firebase Admin Client initialized successfully")
	}

	// Initialize AWS S3 Service
	s3Service := service.NewS3Service(cfg)

	// Initialize Fiber App
	app := fiber.New(fiber.Config{
		AppName: "Horizon Code Editor Go API",
	})

	// Register generic middlewares
	app.Use(logger.New())
	app.Use(recover.New())

	// Initialize Route Handlers
	authHandler := handler.NewAuthHandler(dbClient, cfg, firebaseAuth, s3Service, userRepo)
	snippetHandler := handler.NewSnippetHandler(dbClient, cfg)
	executionHandler := handler.NewExecutionHandler(dbClient, cfg, execRepo)

	// Set up routing
	router.SetupRoutes(app, dbClient, cfg, userRepo, authHandler, snippetHandler, executionHandler)

	// Start Listening
	addr := ":" + cfg.Port
	slog.Info("Starting server...", "address", addr)
	if err := app.Listen(addr); err != nil {
		slog.Error("Server stopped with error", "error", err)
		os.Exit(1)
	}
}