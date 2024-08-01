package signup

import (
	"database/sql"
	"log"
	"strings"
	"user-service-fast/datastore"
	"user-service-fast/models"
	"user-service-fast/pkg/utils"

	"github.com/gofiber/fiber/v2"
)

type UserDto struct {
	FirstName string `json:"firstName"`
	Email     string `json:"email"`
	LastName  string `json:"lastName"`
	Password  string `json:"password"`
}

func (u *UserDto) trimAll() {
	u.FirstName = strings.TrimSpace(u.FirstName)
	u.Email = strings.TrimSpace(u.Email)
	u.Password = strings.TrimSpace(u.Password)
	u.LastName = strings.TrimSpace(u.LastName)
}

func (u *UserDto) IsAnyBlank() bool {
	u.trimAll()
	return len(u.FirstName) == 0 || len(u.LastName) == 0 || len(u.Password) == 0 || len(u.Email) == 0
}

func SignupUser(c *fiber.Ctx, db *sql.DB) error {
	userData := new(UserDto)
	if err := c.BodyParser(userData); err != nil {
		return err
	}
	if userData.IsAnyBlank() {
		return c.Status(fiber.StatusBadRequest).JSON(&fiber.Map{
			"error": "All values not entered",
		})
	}

	if !utils.ValidateEmail(userData.Email) {
		return c.Status(fiber.StatusBadRequest).JSON(&fiber.Map{
			"error": "Email is Invalid",
		})
	}

	isSignedup, err := datastore.IsAlreadySignedup(userData.Email, db)

	if isSignedup {
		c.Status(409).Send([]byte("User already exists"))
	}

	hashedPass, err := utils.HashPassword(userData.Password)
	if err != nil {
		log.Fatal(err)
	}

	user := models.NewUser(userData.FirstName, userData.LastName, userData.Email, hashedPass)

	err_user := datastore.InsertUser(user, db)

	if err_user != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(&fiber.Map{
			"error": "I was unable to insert a user in users table :(",
		})
	}

	claim := map[string]interface{}{
		"id":    user.Id,
		"email": user.Email,
	}

	token, err := utils.GenerateToken(claim, []byte(utils.GetEnvVar("APP_SECRET")))
	if err != nil {
		log.Fatal(err)
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"token": token,
		"id":    user.Id,
		"email": user.Email,
	})
}
