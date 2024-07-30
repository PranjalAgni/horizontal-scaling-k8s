package main

import (
	"user-service-fast/user-service-fast/api"
	"user-service-fast/user-service-fast/pkg/utils"
)

func main() {
	app := api.CreateApi()
	port := utils.GetEnvVar("PORT")
	if len(port) == 0 {
		port = "3001"
	}
	app.Listen(":" + port)
}
