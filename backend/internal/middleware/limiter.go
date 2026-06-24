package middleware

import (
	"time"

	"github.com/Piyush-Singh-coder/horizon-golang/internal/model"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/limiter"
)

// UserRateLimiter limits authenticated users to 10 code executions per minute.
func UserRateLimiter() fiber.Handler {
	return limiter.New(limiter.Config{
		Max:        10,
		Expiration: 60 * time.Second,
		KeyGenerator: func(c *fiber.Ctx) string {
			user, ok := c.Locals("user").(model.User)
			if !ok {
				return c.IP() // Fallback to IP if not authenticated
			}
			return user.ID.Hex()
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"message": "Too many executions, please slow down",
			})
		},
	})
}
