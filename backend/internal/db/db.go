package db

import (
	"github.com/your-org/incident-atlas/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Init(url string) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(url), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	if err := db.AutoMigrate(&models.Incident{}, &models.AIAnalysis{}); err != nil {
		return nil, err
	}

	return db, nil
}
