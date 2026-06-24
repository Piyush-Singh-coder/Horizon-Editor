package handler

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"time"

	"firebase.google.com/go/v4/auth"
	"github.com/Piyush-Singh-coder/horizon-golang/internal/config"
	"github.com/Piyush-Singh-coder/horizon-golang/internal/database"
	"github.com/Piyush-Singh-coder/horizon-golang/internal/model"
	"github.com/Piyush-Singh-coder/horizon-golang/internal/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	DB           *database.DBClient
	Cfg          *config.Config
	FirebaseAuth *auth.Client
}

func NewAuthHandler(db *database.DBClient, cfg *config.Config, firebaseAuth *auth.Client) *AuthHandler {
	return &AuthHandler{
		DB:           db,
		Cfg:          cfg,
		FirebaseAuth: firebaseAuth,
	}
}

// Register handles user registration.
func (h *AuthHandler) Register(c *fiber.Ctx) error {
	type Request struct {
		FullName string `json:"fullName"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Invalid request body"})
	}

	if req.FullName == "" || req.Email == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "All fields are required"})
	}
	if len(req.Password) < 6 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Password must be at least 6 characters"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	usersCol := h.DB.Collection("users")

	// Check if user already exists
	var existingUser model.User
	err := usersCol.FindOne(ctx, bson.M{"email": req.Email}).Decode(&existingUser)
	if err == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "User already exists"})
	} else if !errors.Is(err, mongo.ErrNoDocuments) {
		slog.Error("error checking existing user", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Internal server error"})
	}

	// Hash password
	hashedPasswordBytes, err := bcrypt.GenerateFromPassword([]byte(req.Password), 10)
	if err != nil {
		slog.Error("error hashing password", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Internal server error"})
	}

	user := model.User{
		ID:           bson.NewObjectID(),
		FullName:     req.FullName,
		Email:        req.Email,
		Password:     string(hashedPasswordBytes),
		AuthProvider: "local",
		IsVerified:   false,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	_, err = usersCol.InsertOne(ctx, user)
	if err != nil {
		slog.Error("error creating user", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Internal server error"})
	}

	// Generate verification token and send verification email
	token, err := utils.GenerateToken(c, user.ID.Hex(), h.Cfg)
	if err != nil {
		slog.Error("error generating jwt", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Internal server error"})
	}

	go func() {
		if err := utils.SendVerificationEmail(user.Email, user.FullName, token, h.Cfg); err != nil {
			slog.Error("failed to send verification email", "email", user.Email, "error", err)
		}
	}()

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"_id":        user.ID,
		"fullName":   user.FullName,
		"email":      user.Email,
		"isVerified": user.IsVerified,
	})
}

// Verify verifies a user's email using the token in body.
func (h *AuthHandler) Verify(c *fiber.Ctx) error {
	type Request struct {
		Token string `json:"token"`
	}

	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Invalid request body"})
	}

	token, err := jwt.Parse(req.Token, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(h.Cfg.JWTSecret), nil
	})

	if err != nil || !token.Valid {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Invalid token"})
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Invalid token claims"})
	}

	userIDStr, ok := claims["userId"].(string)
	if !ok {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Invalid token claims"})
	}

	userObjectID, err := bson.ObjectIDFromHex(userIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Invalid user ID format"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	usersCol := h.DB.Collection("users")

	var user model.User
	err = usersCol.FindOne(ctx, bson.M{"_id": userObjectID}).Decode(&user)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": "User not found"})
		}
		slog.Error("error finding user for verification", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Internal server error"})
	}

	if user.IsVerified {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "User already verified"})
	}

	_, err = usersCol.UpdateOne(ctx, bson.M{"_id": userObjectID}, bson.M{"$set": bson.M{"isVerified": true, "updatedAt": time.Now()}})
	if err != nil {
		slog.Error("error verifying user in DB", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Internal server error"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "User verified successfully"})
}

// GoogleAuth handles authenticating with a Firebase ID token.
func (h *AuthHandler) GoogleAuth(c *fiber.Ctx) error {
	type Request struct {
		IDToken string `json:"idToken"`
	}

	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Invalid request body"})
	}

	if h.FirebaseAuth == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{"message": "Google Authentication is not configured"})
	}

	slog.Info("Starting Google Auth verification...")
	decodedToken, err := h.FirebaseAuth.VerifyIDToken(context.Background(), req.IDToken)
	if err != nil {
		slog.Error("Google Token verification failed", "error", err)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "Invalid Google token"})
	}

	email, _ := decodedToken.Claims["email"].(string)
	name, _ := decodedToken.Claims["name"].(string)

	if email == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Email not found in Google token"})
	}

	slog.Info("Google Token verified successfully for email:", "email", email)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	usersCol := h.DB.Collection("users")

	var user model.User
	err = usersCol.FindOne(ctx, bson.M{"email": email}).Decode(&user)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			slog.Info("User not found, creating new Google user...")
			if name == "" {
				name = "Google User"
			}
			user = model.User{
				ID:           bson.NewObjectID(),
				FullName:     name,
				Email:        email,
				Password:     "",
				AuthProvider: "google",
				IsVerified:   true,
				CreatedAt:    time.Now(),
				UpdatedAt:    time.Now(),
			}
			_, err = usersCol.InsertOne(ctx, user)
			if err != nil {
				slog.Error("failed to create new Google user", "error", err)
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Internal server error"})
			}
			slog.Info("New user created successfully via Google auth")
		} else {
			slog.Error("error querying user", "error", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Internal server error"})
		}
	} else {
		slog.Info("Existing user found via Google auth")
	}

	_, err = utils.GenerateToken(c, user.ID.Hex(), h.Cfg)
	if err != nil {
		slog.Error("failed to generate token for Google user", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Internal server error"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"_id":        user.ID,
		"fullName":   user.FullName,
		"email":      user.Email,
		"isVerified": user.IsVerified,
		"message":    "Google authentication successful",
	})
}

// Login handles traditional email/password login.
func (h *AuthHandler) Login(c *fiber.Ctx) error {
	type Request struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Invalid request body"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var user model.User
	err := h.DB.Collection("users").FindOne(ctx, bson.M{"email": req.Email}).Decode(&user)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Invalid credentials"})
		}
		slog.Error("error querying user on login", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Internal server error"})
	}

	if user.AuthProvider == "google" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "This account is registered via Google auth. Please login with Google."})
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Invalid credentials"})
	}

	if !user.IsVerified {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Please verify your email first"})
	}

	_, err = utils.GenerateToken(c, user.ID.Hex(), h.Cfg)
	if err != nil {
		slog.Error("failed to generate token on login", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Internal server error"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"_id":        user.ID,
		"fullName":   user.FullName,
		"email":      user.Email,
		"isVerified": user.IsVerified,
	})
}

// Logout signs out the user by clearing the JWT cookie.
func (h *AuthHandler) Logout(c *fiber.Ctx) error {
	sameSite := "Strict"
	if h.Cfg.Env != "development" {
		sameSite = "None"
	}

	c.Cookie(&fiber.Cookie{
		Name:     "jwt",
		Value:    "",
		Expires:  time.Unix(0, 0),
		HTTPOnly: true,
		SameSite: sameSite,
		Secure:   h.Cfg.Env != "development",
	})

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Logged out successfully"})
}

// GetProfile returns the profile of the logged-in user.
func (h *AuthHandler) GetProfile(c *fiber.Ctx) error {
	user, ok := c.Locals("user").(model.User)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "Not authorized"})
	}
	return c.Status(fiber.StatusOK).JSON(user)
}
