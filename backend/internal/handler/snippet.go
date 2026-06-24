package handler

import (
	"context"
	"errors"
	"log/slog"
	"time"

	"github.com/Piyush-Singh-coder/horizon-golang/internal/config"
	"github.com/Piyush-Singh-coder/horizon-golang/internal/database"
	"github.com/Piyush-Singh-coder/horizon-golang/internal/model"
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type SnippetHandler struct {
	DB  *database.DBClient
	Cfg *config.Config
}

func NewSnippetHandler(db *database.DBClient, cfg *config.Config) *SnippetHandler {
	return &SnippetHandler{
		DB:  db,
		Cfg: cfg,
	}
}

// AddSnippet saves a new snippet.
func (h *SnippetHandler) AddSnippet(c *fiber.Ctx) error {
	user, ok := c.Locals("user").(model.User)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "Not authorized"})
	}

	type Request struct {
		Title    string `json:"title"`
		Code     string `json:"code"`
		Language string `json:"language"`
	}

	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Invalid request body"})
	}

	if req.Title == "" || req.Code == "" || req.Language == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "All fields are required"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	snippet := model.Snippet{
		ID:        bson.NewObjectID(),
		User:      user.ID,
		Title:     req.Title,
		Language:  req.Language,
		Code:      req.Code,
		Stars:     []bson.ObjectID{},
		Comments:  []model.Comment{},
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	_, err := h.DB.Collection("snippets").InsertOne(ctx, snippet)
	if err != nil {
		slog.Error("failed to add snippet", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Internal server error"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Snippet added successfully"})
}

// GetSnippets fetches all snippets and populates user info.
func (h *SnippetHandler) GetSnippets(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// 1. Fetch raw snippets sorted by createdAt descending
	findOpts := options.Find().SetSort(bson.M{"createdAt": -1})
	cursor, err := h.DB.Collection("snippets").Find(ctx, bson.M{}, findOpts)
	if err != nil {
		slog.Error("failed to find snippets", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Internal server error"})
	}
	defer cursor.Close(ctx)

	var rawSnippets []model.Snippet
	if err := cursor.All(ctx, &rawSnippets); err != nil {
		slog.Error("failed to decode snippets", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Internal server error"})
	}

	if len(rawSnippets) == 0 {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{"snippets": []model.SnippetResponse{}})
	}

	// 2. Collect unique User IDs to batch fetch
	userIdsMap := make(map[bson.ObjectID]bool)
	for _, s := range rawSnippets {
		userIdsMap[s.User] = true
		for _, cm := range s.Comments {
			userIdsMap[cm.User] = true
		}
	}

	var userIds []bson.ObjectID
	for uid := range userIdsMap {
		userIds = append(userIds, uid)
	}

	// 3. Batch fetch users
	var users []model.User
	usersCursor, err := h.DB.Collection("users").Find(ctx, bson.M{"_id": bson.M{"$in": userIds}})
	if err == nil {
		usersCursor.All(ctx, &users)
		usersCursor.Close(ctx)
	}

	userMap := make(map[bson.ObjectID]model.UserPopulated)
	for _, u := range users {
		userMap[u.ID] = model.UserPopulated{
			ID:       u.ID,
			FullName: u.FullName,
			Email:    u.Email,
		}
	}

	// 4. Construct populated SnippetResponse list
	responses := make([]model.SnippetResponse, len(rawSnippets))
	for i, s := range rawSnippets {
		commentsRes := make([]model.CommentResponse, len(s.Comments))
		for j, cm := range s.Comments {
			commentsRes[j] = model.CommentResponse{
				ID:        cm.ID,
				User:      userMap[cm.User],
				Text:      cm.Text,
				CreatedAt: cm.CreatedAt,
				UpdatedAt: cm.UpdatedAt,
			}
		}

		responses[i] = model.SnippetResponse{
			ID:        s.ID,
			User:      userMap[s.User],
			Title:     s.Title,
			Language:  s.Language,
			Code:      s.Code,
			Stars:     s.Stars,
			Comments:  commentsRes,
			CreatedAt: s.CreatedAt,
			UpdatedAt: s.UpdatedAt,
		}
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"snippets": responses})
}

// GetSnippetById fetches details of a snippet by ID and populates user info.
func (h *SnippetHandler) GetSnippetById(c *fiber.Ctx) error {
	snippetIDStr := c.Params("snippetId")
	snippetID, err := bson.ObjectIDFromHex(snippetIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Invalid snippet ID format"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// 1. Fetch raw snippet
	var s model.Snippet
	err = h.DB.Collection("snippets").FindOne(ctx, bson.M{"_id": snippetID}).Decode(&s)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": "Snippet not found"})
		}
		slog.Error("failed to find snippet by ID", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Internal server error"})
	}

	// 2. Collect unique User IDs (snippet owner + comment writers)
	userIdsMap := map[bson.ObjectID]bool{s.User: true}
	for _, cm := range s.Comments {
		userIdsMap[cm.User] = true
	}

	var userIds []bson.ObjectID
	for uid := range userIdsMap {
		userIds = append(userIds, uid)
	}

	// 3. Batch fetch users
	var users []model.User
	usersCursor, err := h.DB.Collection("users").Find(ctx, bson.M{"_id": bson.M{"$in": userIds}})
	if err == nil {
		usersCursor.All(ctx, &users)
		usersCursor.Close(ctx)
	}

	userMap := make(map[bson.ObjectID]model.UserPopulated)
	for _, u := range users {
		userMap[u.ID] = model.UserPopulated{
			ID:       u.ID,
			FullName: u.FullName,
			Email:    u.Email,
		}
	}

	// 4. Construct populated SnippetResponse
	commentsRes := make([]model.CommentResponse, len(s.Comments))
	for j, cm := range s.Comments {
		commentsRes[j] = model.CommentResponse{
			ID:        cm.ID,
			User:      userMap[cm.User],
			Text:      cm.Text,
			CreatedAt: cm.CreatedAt,
			UpdatedAt: cm.UpdatedAt,
		}
	}

	response := model.SnippetResponse{
		ID:        s.ID,
		User:      userMap[s.User],
		Title:     s.Title,
		Language:  s.Language,
		Code:      s.Code,
		Stars:     s.Stars,
		Comments:  commentsRes,
		CreatedAt: s.CreatedAt,
		UpdatedAt: s.UpdatedAt,
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"snippet": response})
}

// DeleteSnippet deletes a snippet by ID if the requester is the owner.
func (h *SnippetHandler) DeleteSnippet(c *fiber.Ctx) error {
	user, ok := c.Locals("user").(model.User)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "Not authorized"})
	}

	snippetIDStr := c.Params("snippetId")
	snippetID, err := bson.ObjectIDFromHex(snippetIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Invalid snippet ID format"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var snippet model.Snippet
	err = h.DB.Collection("snippets").FindOne(ctx, bson.M{"_id": snippetID}).Decode(&snippet)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": "Snippet not found"})
		}
		slog.Error("failed to find snippet for deletion", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Internal server error"})
	}

	if snippet.User != user.ID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"message": "You are not authorized to delete this snippet"})
	}

	_, err = h.DB.Collection("snippets").DeleteOne(ctx, bson.M{"_id": snippetID})
	if err != nil {
		slog.Error("failed to delete snippet", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Internal server error"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Snippet deleted successfully"})
}

// AddComment appends a comment to a snippet.
func (h *SnippetHandler) AddComment(c *fiber.Ctx) error {
	user, ok := c.Locals("user").(model.User)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "Not authorized"})
	}

	snippetIDStr := c.Params("snippetId")
	snippetID, err := bson.ObjectIDFromHex(snippetIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Invalid snippet ID format"})
	}

	type Request struct {
		Text string `json:"text"`
	}

	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Invalid request body"})
	}

	if req.Text == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Comment text is required"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	newComment := model.Comment{
		ID:        bson.NewObjectID(),
		User:      user.ID,
		Text:      req.Text,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	res, err := h.DB.Collection("snippets").UpdateOne(
		ctx,
		bson.M{"_id": snippetID},
		bson.M{"$push": bson.M{"comments": newComment}},
	)
	if err != nil {
		slog.Error("failed to add comment", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Internal server error"})
	}

	if res.MatchedCount == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": "Snippet not found"})
	}

	// Fetch updated snippet and return populated comments
	var s model.Snippet
	err = h.DB.Collection("snippets").FindOne(ctx, bson.M{"_id": snippetID}).Decode(&s)
	if err != nil {
		slog.Error("failed to retrieve updated snippet", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Internal server error"})
	}

	// Collect unique User IDs from comments
	userIdsMap := make(map[bson.ObjectID]bool)
	for _, cm := range s.Comments {
		userIdsMap[cm.User] = true
	}

	var userIds []bson.ObjectID
	for uid := range userIdsMap {
		userIds = append(userIds, uid)
	}

	// Batch fetch users
	var users []model.User
	usersCursor, err := h.DB.Collection("users").Find(ctx, bson.M{"_id": bson.M{"$in": userIds}})
	if err == nil {
		usersCursor.All(ctx, &users)
		usersCursor.Close(ctx)
	}

	userMap := make(map[bson.ObjectID]model.UserPopulated)
	for _, u := range users {
		userMap[u.ID] = model.UserPopulated{
			ID:       u.ID,
			FullName: u.FullName,
			Email:    u.Email,
		}
	}

	commentsRes := make([]model.CommentResponse, len(s.Comments))
	for j, cm := range s.Comments {
		commentsRes[j] = model.CommentResponse{
			ID:        cm.ID,
			User:      userMap[cm.User],
			Text:      cm.Text,
			CreatedAt: cm.CreatedAt,
			UpdatedAt: cm.UpdatedAt,
		}
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":  "Comment added successfully",
		"comments": commentsRes,
	})
}

// StarSnippet toggles a star on a snippet for a user.
func (h *SnippetHandler) StarSnippet(c *fiber.Ctx) error {
	user, ok := c.Locals("user").(model.User)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "Not authorized"})
	}

	snippetIDStr := c.Params("snippetId")
	snippetID, err := bson.ObjectIDFromHex(snippetIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Invalid snippet ID format"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Verify snippet exists
	var snippet model.Snippet
	err = h.DB.Collection("snippets").FindOne(ctx, bson.M{"_id": snippetID}).Decode(&snippet)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": "Snippet not found"})
		}
		slog.Error("failed to find snippet for star", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Internal server error"})
	}

	// Check if already starred by user
	isStarred := false
	for _, starID := range snippet.Stars {
		if starID == user.ID {
			isStarred = true
			break
		}
	}

	if isStarred {
		// Pull star
		_, err = h.DB.Collection("snippets").UpdateOne(
			ctx,
			bson.M{"_id": snippetID},
			bson.M{"$pull": bson.M{"stars": user.ID}},
		)
		if err != nil {
			slog.Error("failed to pull star", "error", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Internal server error"})
		}
		return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Star removed"})
	} else {
		// Push star
		_, err = h.DB.Collection("snippets").UpdateOne(
			ctx,
			bson.M{"_id": snippetID},
			bson.M{"$addToSet": bson.M{"stars": user.ID}},
		)
		if err != nil {
			slog.Error("failed to add star", "error", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Internal server error"})
		}
		return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Star added"})
	}
}
