package models

import (
	"log"
	"time"
)

type User struct {
	Id        int64     `db:"id"`
	Email     string    `db:"email"`
	Password  string    `db:"password"`
	FirstName string    `db:"firstName"`
	LastName  string    `db:"lastName"`
	CreatedAt time.Time `db:"created_at"`
	UpdatedAt time.Time `db:"updated_at"`
}

func failOnError(err error, msg string) {
	if err != nil {
		log.Fatalf("%s: %s", msg, err)
	}
}

func NewUser(firstName string, lastName string, email string, password string) *User {
	t := new(User)
	t.Password = password
	t.Email = email
	t.CreatedAt = time.Now()
	return t
}
