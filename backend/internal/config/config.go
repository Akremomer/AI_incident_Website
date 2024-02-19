package config

import "os"

type Config struct {
	DatabaseURL  string
	AIServiceURL string
}

func Load() *Config {
	return &Config{
		DatabaseURL:  os.Getenv("DATABASE_URL"),
		AIServiceURL: os.Getenv("AI_SERVICE_URL"),
	}
}
