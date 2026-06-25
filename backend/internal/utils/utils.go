package utils

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
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

// SendVerificationEmail sends an email to the user with a verification token using the Resend API.
func SendVerificationEmail(email, fullName, token string, cfg *config.Config) error {
	if cfg.ResendAPIKey == "" {
		return fmt.Errorf("resend API key is not configured")
	}

	htmlContent := fmt.Sprintf(
		"<h1>Welcome to Horizon Editor!</h1>\r\n"+
			"<p>Hello %s,</p>\r\n"+
			"<p>Please verify your email by clicking the link below:</p>\r\n"+
			"<a href=\"%s/verify/%s\">Verify Email</a>\r\n"+
			"<p>This link will expire in 48 hours.</p>\r\n"+
			"<h3>Thank you!</h3>\r\n",
		fullName, cfg.FrontendURL, token,
	)

	payload := struct {
		From    string   `json:"from"`
		To      []string `json:"to"`
		Subject string   `json:"subject"`
		HTML    string   `json:"html"`
	}{
		From:    cfg.ResendFromEmail,
		To:      []string{email},
		Subject: "Email Verification - Horizon Editor",
		HTML:    htmlContent,
	}

	jsonBytes, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal resend payload: %w", err)
	}

	req, err := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewBuffer(jsonBytes))
	if err != nil {
		return fmt.Errorf("failed to create http request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+cfg.ResendAPIKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to execute HTTP request to Resend API: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		var responseErr map[string]interface{}
		if err := json.NewDecoder(resp.Body).Decode(&responseErr); err == nil {
			return fmt.Errorf("resend API error (status %d): %v", resp.StatusCode, responseErr)
		}
		return fmt.Errorf("resend API returned status code %d", resp.StatusCode)
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
