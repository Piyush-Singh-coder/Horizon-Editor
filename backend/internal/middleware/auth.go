package middleware

import (
	"context"
	"fmt"
	"time"

	"github.com/Piyush-Singh-coder/horizon-golang/internal/config"
	"github.com/Piyush-Singh-coder/horizon-golang/internal/repository"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// Protect is a middleware that secures endpoints requiring authentication.
func Protect(userRepo *repository.UserRepository, cfg *config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		tokenStr := c.Cookies("jwt")
		if tokenStr == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"message": "Not authorized, no token",
			})
		}

		token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(cfg.JWTSecret), nil
		})

		if err != nil || !token.Valid {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "Invalid token",
			})
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "Invalid token claims",
			})
		}

		userIDStr, ok := claims["userId"].(string)
		if !ok {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "Invalid token claims - missing user ID",
			})
		}

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		user, err := userRepo.GetUserByID(ctx, userIDStr)
		if err != nil || user == nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"message": "User not found or invalid session",
			})
		}

		// Strip password from context user for security
		user.Password = ""

		c.Locals("user", *user)
		return c.Next()
	}
}
