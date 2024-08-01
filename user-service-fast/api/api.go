package api

import (
	"user-service-fast/datastore"
	"user-service-fast/pkg/signup"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func CreateApi() *fiber.App {
	app := fiber.New()
	db := datastore.GetConnection()

	app.Use(cors.New())
	app.Post("/signup", func(c *fiber.Ctx) error { return signup.SignupUser(c, db) })

	// app.Post("/login", func(c *fiber.Ctx) error { return login.Login(c, db) })
	app.Get("/", func(ctx *fiber.Ctx) error { return ctx.Status(200).Send([]byte("Go server is running 🚀")) })
	return app
}
