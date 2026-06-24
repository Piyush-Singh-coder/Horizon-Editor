package router

import (
	"github.com/Piyush-Singh-coder/horizon-golang/internal/config"
	"github.com/Piyush-Singh-coder/horizon-golang/internal/database"
	"github.com/Piyush-Singh-coder/horizon-golang/internal/handler"
	"github.com/Piyush-Singh-coder/horizon-golang/internal/middleware"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

// SetupRoutes registers all route handlers in the Fiber application.
func SetupRoutes(
	app *fiber.App,
	db *database.DBClient,
	cfg *config.Config,
	authHandler *handler.AuthHandler,
	snippetHandler *handler.SnippetHandler,
	executionHandler *handler.ExecutionHandler,
) {
	// Enable CORS matching original Node.js config
	app.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.FrontendURL,
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization, Cookie",
		AllowMethods:     "GET, POST, HEAD, PUT, DELETE, PATCH, OPTIONS",
		AllowCredentials: true,
	}))

	protect := middleware.Protect(db, cfg)

	// Auth Routes
	auth := app.Group("/api/auth")
	auth.Post("/register", authHandler.Register)
	auth.Post("/verify", authHandler.Verify)
	auth.Post("/google-login", authHandler.GoogleAuth)
	auth.Post("/login", authHandler.Login)
	auth.Post("/logout", authHandler.Logout)
	auth.Get("/profile", protect, authHandler.GetProfile)

	// Execution Routes
	exec := app.Group("/api/execution")
	exec.Post("/execute", protect, middleware.UserRateLimiter(), executionHandler.ExecuteCode)
	exec.Post("/", protect, executionHandler.SaveExecution)
	exec.Get("/", protect, executionHandler.GetExecutions)
	exec.Get("/:executionId", protect, executionHandler.GetExecutionById)
	exec.Delete("/:executionId", protect, executionHandler.DeleteExecution)

	// Snippet Routes
	snippets := app.Group("/api/snippets")
	snippets.Post("/", protect, snippetHandler.AddSnippet)
	snippets.Get("/all", snippetHandler.GetSnippets)
	snippets.Get("/:snippetId", snippetHandler.GetSnippetById)
	snippets.Delete("/:snippetId", protect, snippetHandler.DeleteSnippet)
	snippets.Post("/comment/:snippetId", protect, snippetHandler.AddComment)
	snippets.Post("/star/:snippetId", protect, snippetHandler.StarSnippet)
}
