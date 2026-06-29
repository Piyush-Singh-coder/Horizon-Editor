package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net/http"
	"time"

	"github.com/Piyush-Singh-coder/horizon-golang/internal/config"
	"github.com/Piyush-Singh-coder/horizon-golang/internal/database"
	"github.com/Piyush-Singh-coder/horizon-golang/internal/model"
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type ExecutionHandler struct {
	DB  *database.DBClient
	Cfg *config.Config
}

func NewExecutionHandler(db *database.DBClient, cfg *config.Config) *ExecutionHandler {
	return &ExecutionHandler{
		DB:  db,
		Cfg: cfg,
	}
}

// ExecuteCode runs the source code via the Piston API.
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
	if req.Language == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "language is required"})
	}

	type PistonFile struct {
		Content string `json:"content"`
	}

	// Prepare payload for Piston
	pistonReq := map[string]any{
		"language": req.Language,
		"version":  "*", // Selects the latest available version
		"files": []PistonFile{
			{Content: req.Code},
		},
		"stdin": req.Input,
	}

	payloadBytes, err := json.Marshal(pistonReq)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Internal server error"})
	}

	pistonURL := h.Cfg.PistonAPIURL + "/execute"
	if h.Cfg.PistonAPIURL == "" {
		pistonURL = "https://emkc.org/api/v2/piston/execute"
	}

	httpReq, err := http.NewRequest("POST", pistonURL, bytes.NewBuffer(payloadBytes))
	if err != nil {
		slog.Error("failed to create http request to piston", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Internal server error"})
	}

	httpReq.Header.Set("Content-Type", "application/json")
	if h.Cfg.PistonAPIKey != "" {
		httpReq.Header.Set("Authorization", "Bearer "+h.Cfg.PistonAPIKey) // Some self-hosted or provided keys might use this
	}

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		slog.Error("error communicating with piston", "error", err)
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
		slog.Error("piston API returned non-OK status", "status", resp.Status, "body", string(respBody))
		return c.Status(resp.StatusCode).JSON(fiber.Map{"message": "Execution server returned error"})
	}

	type PistonRun struct {
		Stdout string `json:"stdout"`
		Stderr string `json:"stderr"`
		Output string `json:"output"`
		Code   int    `json:"code"`
		Signal string `json:"signal"`
	}

	type PistonResponse struct {
		Language string    `json:"language"`
		Version  string    `json:"version"`
		Run      PistonRun `json:"run"`
		Message  string    `json:"message"`
	}

	var pistonRes PistonResponse
	if err := json.Unmarshal(respBody, &pistonRes); err != nil {
		slog.Error("failed to parse piston response", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Internal server error"})
	}

	output := pistonRes.Run.Stdout
	errStr := pistonRes.Run.Stderr

	statusDesc := "Accepted"
	if pistonRes.Run.Code != 0 {
		statusDesc = "Error"
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"output":   output,
		"error":    errStr,
		"status":   statusDesc,
		"exitCode": pistonRes.Run.Code,
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

	_, err := h.DB.Collection("executions").InsertOne(ctx, execution)
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

	// Sort by createdAt descending
	findOpts := options.Find().SetSort(bson.M{"createdAt": -1})
	cursor, err := h.DB.Collection("executions").Find(ctx, bson.M{"user": user.ID}, findOpts)
	if err != nil {
		slog.Error("failed to find executions", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Internal server error"})
	}
	defer cursor.Close(ctx)

	var executions []model.Execution
	if err := cursor.All(ctx, &executions); err != nil {
		slog.Error("failed to decode executions", "error", err)
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
	executionID, err := bson.ObjectIDFromHex(executionIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Invalid execution ID format"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var execution model.Execution
	err = h.DB.Collection("executions").FindOne(ctx, bson.M{"_id": executionID}).Decode(&execution)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": "Execution not found"})
		}
		slog.Error("failed to find execution by id", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Internal server error"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"execution": execution})
}

// DeleteExecution removes an execution record.
func (h *ExecutionHandler) DeleteExecution(c *fiber.Ctx) error {
	executionIDStr := c.Params("executionId")
	executionID, err := bson.ObjectIDFromHex(executionIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Invalid execution ID format"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	res, err := h.DB.Collection("executions").DeleteOne(ctx, bson.M{"_id": executionID})
	if err != nil {
		slog.Error("failed to delete execution", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Internal server error"})
	}

	if res.DeletedCount == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": "Execution not found"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Execution deleted successfully"})
}
