package config

import "os"

type Config struct {
	DatabaseURL  string
	AIServiceURL string
}

func Load() *Config {
	aiServiceURL := os.Getenv("AI_SERVICE_URL")
	if aiServiceURL == "" {
		aiServiceURL = "http://localhost:8000"
	}

	return &Config{
		DatabaseURL:  os.Getenv("DATABASE_URL"),
		AIServiceURL: aiServiceURL,
	}
}
