package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
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

// ExecuteCode runs the source code via the Judge0 API.
func (h *ExecutionHandler) ExecuteCode(c *fiber.Ctx) error {
	type Request struct {
		LanguageID any    `json:"languageId"`
		Code       string `json:"code"`
		Input      string `json:"input"`
	}

	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Invalid request body"})
	}

	if req.Code == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "code is required"})
	}
	if req.LanguageID == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "languageId is required"})
	}

	var langID int
	switch v := req.LanguageID.(type) {
	case float64:
		langID = int(v)
	case int:
		langID = v
	case string:
		if _, err := fmt.Sscanf(v, "%d", &langID); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Invalid languageId format"})
		}
	default:
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Invalid languageId type"})
	}

	// Prepare payload for Judge0
	judge0Req := map[string]any{
		"source_code": req.Code,
		"language_id": langID,
		"stdin":       req.Input,
	}

	payloadBytes, err := json.Marshal(judge0Req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Internal server error"})
	}

	judge0URL := "https://" + h.Cfg.Judge0APIHost + "/submissions?base64_encoded=false&wait=true&fields=stdout,stderr,compile_output,status,exit_code"

	httpReq, err := http.NewRequest("POST", judge0URL, bytes.NewBuffer(payloadBytes))
	if err != nil {
		slog.Error("failed to create http request to judge0", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Internal server error"})
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("x-rapidapi-key", h.Cfg.Judge0APIKey)
	httpReq.Header.Set("x-rapidapi-host", h.Cfg.Judge0APIHost)

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		slog.Error("error communicating with judge0", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Failed to communicate with execution server"})
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Failed to read execution response"})
	}

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		slog.Error("judge0 API returned non-OK status", "status", resp.Status, "body", string(respBody))
		return c.Status(resp.StatusCode).JSON(fiber.Map{"message": "Execution server returned error"})
	}

	type Judge0Status struct {
		Description string `json:"description"`
	}
	type Judge0Response struct {
		Stdout        string       `json:"stdout"`
		Stderr        string       `json:"stderr"`
		CompileOutput string       `json:"compile_output"`
		Status        Judge0Status `json:"status"`
		ExitCode      any          `json:"exit_code"`
	}

	var judge0Res Judge0Response
	if err := json.Unmarshal(respBody, &judge0Res); err != nil {
		slog.Error("failed to parse judge0 response", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Internal server error"})
	}

	output := judge0Res.Stdout
	errStr := judge0Res.CompileOutput
	if errStr == "" {
		errStr = judge0Res.Stderr
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"output":   output,
		"error":    errStr,
		"status":   judge0Res.Status.Description,
		"exitCode": judge0Res.ExitCode,
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
