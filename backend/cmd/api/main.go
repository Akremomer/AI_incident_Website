package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/your-org/incident-atlas/internal/api"
	"github.com/your-org/incident-atlas/internal/config"
	"github.com/your-org/incident-atlas/internal/db"
)

func main() {
	_ = godotenv.Load()

	cfg := config.Load()
	database, err := db.Init(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	r := gin.Default()
	api.SetupRoutes(r, database, cfg)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("server starting on %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
