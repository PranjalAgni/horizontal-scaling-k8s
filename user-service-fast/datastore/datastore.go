package datastore

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"user-service-fast/user-service-fast/models"
	"user-service-fast/user-service-fast/pkg/utils"

	_ "github.com/lib/pq"
)

func failOnError(err error, msg string) {
	if err != nil {
		log.Printf("ERROR : %s: %s", msg, err)
	}
}

func fatalOnError(err error, msg string) {
	if err != nil {
		log.Fatalf("ERROR : %s: %s", msg, err)
	}
}

func GetConnection() *sql.DB {
	dbHost := utils.GetEnvVar("DB_HOST")
	dbPassword := utils.GetEnvVar("DB_PASSWORD")
	dbPort := utils.GetEnvVar("DB_PORT")
	dbName := utils.GetEnvVar("DB_NAME")
	dbUserName := utils.GetEnvVar("DB_USERNAME")

	dbSQLInfo := fmt.Sprintf("host=%s port=%s user=%s "+"password=%s dbname=%s sslmode=disable", dbHost, dbPort, dbUserName, dbPassword, dbName)
	fmt.Println(dbSQLInfo)
	db, err := sql.Open("postgres", dbSQLInfo)
	fatalOnError(err, "Error Opening Database")
	return db
}

func ExecuteSQL(sqlString string, db *sql.DB) error {
	_, err := db.Exec(sqlString)
	failOnError(err, "Error Executing SQL")
	return err
}

func GetUser(email string, db *sql.DB) (*models.User, error) {
	user := models.User{}
	sqlString := "SELECT id, email, created_at, updated_at from users WHERE email=$1"
	row := db.QueryRow(sqlString, email)
	switch err := row.Scan(&user.Id, &user.Email, &user.CreatedAt, &user.UpdatedAt); err {
	case sql.ErrNoRows:
		failOnError(err, "No Such User Exist")
		return nil, err
	case nil:
		return &user, nil
	default:
		failOnError(err, "Error Reading users")
		return nil, err
	}
}

func InsertUser(user *models.User, db *sql.DB) error {
	sqlString := "INSERT INTO users(email, password, created_at, updated_at) VALUES ($1, $2, $3, $4)"
	_, err := db.Exec(sqlString, user.Email, user.Password, utils.GenerateTimestamp(), utils.GenerateTimestamp())
	failOnError(err, "Error inserting user")
	return err
}

func IsAlreadySignedup(email string, db *sql.DB) (bool, error) {
	sqlString := "SELECT exists (SELECT 1 FROM users WHERE email = $1 LIMIT 1)"
	var doesExist bool
	row := db.QueryRow(sqlString, email)
	switch err := row.Scan(&doesExist); err {
	case sql.ErrNoRows:
		return doesExist, errors.New("error in searching DB")
	case nil:
		return doesExist, nil
	default:
		failOnError(err, "Error Reading Users")
		return false, err
	}
}
