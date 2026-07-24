package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"time"

	"github.com/Piyush-Singh-coder/horizon-golang/internal/config"
	"github.com/Piyush-Singh-coder/horizon-golang/internal/database"
	"github.com/Piyush-Singh-coder/horizon-golang/internal/model"
	"github.com/Piyush-Singh-coder/horizon-golang/internal/repository"
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type ExecutionHandler struct {
	DB            *database.DBClient
	Cfg           *config.Config
	ExecutionRepo *repository.ExecutionRepository
}

func NewExecutionHandler(db *database.DBClient, cfg *config.Config, execRepo *repository.ExecutionRepository) *ExecutionHandler {
	return &ExecutionHandler{
		DB:            db,
		Cfg:           cfg,
		ExecutionRepo: execRepo,
	}
}

// ExecuteCode runs the source code via the OnlineCompiler.io API.
func (h *ExecutionHandler) ExecuteCode(c *fiber.Ctx) error {
	type Request struct {
		Language string `json:"language"`
		Code     string `json:"code"`
		Input    string `json:"input"`
	}

	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Invalid request body"})
	}

	if req.Code == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "code is required"})
	}
	// Map Piston/Frontend language IDs to OnlineCompiler.io compiler identifiers
	compilerMap := map[string]string{
		"javascript": "typescript-deno",
		"typescript": "typescript-deno",
		"python":     "python-3.14",
		"java":       "openjdk-25",
		"go":         "go-1.26",
		"rust":       "rust-1.93",
		"c++":        "g++-15",
		"cpp":        "g++-15",
		"c":          "gcc-15",
		"csharp":     "dotnet-csharp-9",
		"php":        "php-8.5",
		"ruby":       "ruby-4.0",
		"haskell":    "haskell-9.12",
	}

	ocCompiler, exists := compilerMap[req.Language]
	if !exists {
		ocCompiler = req.Language
	}

	slog.Info("Sending execution request to OnlineCompiler", "original_lang", req.Language, "mapped_compiler", ocCompiler)

	// Prepare payload for OnlineCompiler.io
	ocReq := map[string]any{
		"compiler": ocCompiler,
		"code":     req.Code,
		"input":    req.Input,
	}

	payloadBytes, err := json.Marshal(ocReq)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Internal server error"})
	}

	// We reuse PistonAPIURL variable from config to avoid renaming env vars
	apiURL := h.Cfg.PistonAPIURL
	if apiURL == "" || apiURL == "https://emkc.org/api/v2/piston/execute" {
		apiURL = "https://api.onlinecompiler.io/api/run-code-sync/"
	}

	httpReq, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(payloadBytes))
	if err != nil {
		slog.Error("failed to create http request", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Internal server error"})
	}

	httpReq.Header.Set("Content-Type", "application/json")
	
	// API Key from config
	apiKey := h.Cfg.PistonAPIKey 
	if apiKey != "" {
		httpReq.Header.Set("Authorization", apiKey)
	}

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		slog.Error("error communicating with execution api", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Failed to communicate with execution server"})
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Failed to read execution response"})
	}

	if resp.StatusCode == http.StatusTooManyRequests {
		return c.Status(http.StatusTooManyRequests).JSON(fiber.Map{"message": "Code execution engine is currently overloaded. Please try again later."})
	}

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		slog.Error("API returned non-OK status", "status", resp.Status, "body", string(respBody))
		return c.Status(resp.StatusCode).JSON(fiber.Map{"message": "Execution server returned error: " + string(respBody)})
	}

	// Response structure from OnlineCompiler.io
	type OnlineCompilerResponse struct {
		Output   string `json:"output"`
		Error    string `json:"error"`
		Status   string `json:"status"`
		ExitCode int    `json:"exit_code"`
	}

	var res OnlineCompilerResponse
	if err := json.Unmarshal(respBody, &res); err != nil {
		slog.Error("failed to parse response", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Internal server error"})
	}

	statusDesc := "Accepted"
	if res.ExitCode != 0 || res.Error != "" || res.Status == "error" {
		statusDesc = "Error"
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"output":   res.Output,
		"error":    res.Error,
		"status":   statusDesc,
		"exitCode": res.ExitCode,
	})
}

// SaveExecution persists a code execution run.
func (h *ExecutionHandler) SaveExecution(c *fiber.Ctx) error {
	user, ok := c.Locals("user").(model.User)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "Not authorized"})
	}

	type Request struct {
		Language string `json:"language"`
		Code     string `json:"code"`
		Output   string `json:"output"`
	}

	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Invalid request body"})
	}

	if req.Code == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Code is required"})
	}
	if req.Output == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Output is required"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	execution := model.Execution{
		ID:        bson.NewObjectID(),
		User:      user.ID,
		Language:  req.Language,
		Code:      req.Code,
		Output:    req.Output,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	err := h.ExecutionRepo.SaveExecution(ctx, &execution)
	if err != nil {
		slog.Error("failed to save execution to db", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Internal server error"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Code is saved Successfully"})
}

// GetExecutions fetches execution history for the logged-in user.
func (h *ExecutionHandler) GetExecutions(c *fiber.Ctx) error {
	user, ok := c.Locals("user").(model.User)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "Not authorized"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	executions, err := h.ExecutionRepo.GetExecutionsByUserID(ctx, user.ID.Hex())
	if err != nil {
		slog.Error("failed to find executions", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Internal server error"})
	}

	if executions == nil {
		executions = []model.Execution{}
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"executions": executions})
}

// GetExecutionById fetches a single execution details.
func (h *ExecutionHandler) GetExecutionById(c *fiber.Ctx) error {
	executionIDStr := c.Params("executionId")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var execution model.Execution
	executionID, err := bson.ObjectIDFromHex(executionIDStr)
	if err == nil {
		_ = h.DB.Collection("executions").FindOne(ctx, bson.M{"_id": executionID}).Decode(&execution)
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"execution": execution})
}

// DeleteExecution removes an execution record.
func (h *ExecutionHandler) DeleteExecution(c *fiber.Ctx) error {
	executionIDStr := c.Params("executionId")
	user, ok := c.Locals("user").(model.User)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "Not authorized"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := h.ExecutionRepo.DeleteExecution(ctx, executionIDStr, user.ID.Hex())
	if err != nil {
		slog.Error("failed to delete execution", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Internal server error"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Execution deleted successfully"})
}
