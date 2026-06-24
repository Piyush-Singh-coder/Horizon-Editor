package utils

import (
	"context"
	"encoding/json"
	"fmt"
	"net/smtp"
	"strings"
	"time"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"github.com/Piyush-Singh-coder/horizon-golang/internal/config"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"google.golang.org/api/option"
)

// GenerateToken signs a JWT token and sets it in an HTTP-only cookie.
func GenerateToken(c *fiber.Ctx, userID string, cfg *config.Config) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userId": userID,
		"exp":    time.Now().Add(time.Duration(cfg.JWTExpireHours) * time.Hour).Unix(),
	})

	tokenString, err := token.SignedString([]byte(cfg.JWTSecret))
	if err != nil {
		return "", err
	}

	sameSite := "Strict"
	if cfg.Env != "development" {
		sameSite = "None"
	}

	c.Cookie(&fiber.Cookie{
		Name:     "jwt",
		Value:    tokenString,
		Expires:  time.Now().Add(time.Duration(cfg.JWTExpireHours) * time.Hour),
		HTTPOnly: true,
		SameSite: sameSite,
		Secure:   cfg.Env != "development",
	})

	return tokenString, nil
}

// SendVerificationEmail sends an email to the user with a verification token.
func SendVerificationEmail(email, fullName, token string, cfg *config.Config) error {
	auth := smtp.PlainAuth("", cfg.SMTPUser, cfg.SMTPPass, cfg.SMTPHost)

	to := []string{email}
	msg := []byte("To: " + email + "\r\n" +
		"From: \"Horizon Editor\" <" + cfg.SMTPFrom + ">\r\n" +
		"Subject: Email Verification\r\n" +
		"MIME-version: 1.0;\r\n" +
		"Content-Type: text/html; charset=\"UTF-8\";\r\n\r\n" +
		"<h1>Welcome to Horizon Editor!</h1>\r\n" +
		"<p>Please verify your email by clicking the link below:</p>\r\n" +
		"<a href=\"" + cfg.FrontendURL + "/verify/" + token + "\">Verify Email</a>\r\n" +
		"<p>This link will expire in 48 hours.</p>\r\n" +
		"<h3>Thank you!</h3>\r\n")

	addr := fmt.Sprintf("%s:%d", cfg.SMTPHost, cfg.SMTPPort)
	err := smtp.SendMail(addr, auth, cfg.SMTPFrom, to, msg)
	if err != nil {
		return fmt.Errorf("failed to send verification email: %w", err)
	}
	return nil
}

// InitFirebase initializes the Firebase Admin SDK client.
func InitFirebase(cfg *config.Config) (*auth.Client, error) {
	if cfg.FirebaseProjectID == "" || cfg.FirebaseClientEmail == "" || cfg.FirebasePrivateKey == "" {
		return nil, fmt.Errorf("missing Firebase service account credentials in environment configuration")
	}

	// Clean private key string from escaped newlines, quotes and spaces
	privateKey := cfg.FirebasePrivateKey
	privateKey = strings.TrimSpace(privateKey)
	privateKey = strings.Trim(privateKey, "\"")
	privateKey = strings.Trim(privateKey, "'")
	privateKey = strings.ReplaceAll(privateKey, "\\n", "\n")

	credentialsMap := map[string]string{
		"type":         "service_account",
		"project_id":   cfg.FirebaseProjectID,
		"private_key":  privateKey,
		"client_email": cfg.FirebaseClientEmail,
	}

	jsonBytes, err := json.Marshal(credentialsMap)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal firebase credentials map: %w", err)
	}

	opt := option.WithCredentialsJSON(jsonBytes)
	app, err := firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		return nil, fmt.Errorf("error initializing firebase app: %w", err)
	}

	client, err := app.Auth(context.Background())
	if err != nil {
		return nil, fmt.Errorf("error getting firebase auth client: %w", err)
	}

	return client, nil
}
