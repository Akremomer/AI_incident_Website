package models

import (
	"time"

	"gorm.io/gorm"
)

type IncidentStatus string
type Severity string

const (
	StatusOpen          IncidentStatus = "OPEN"
	StatusInvestigating IncidentStatus = "INVESTIGATING"
	StatusAnalyzed      IncidentStatus = "ANALYZED"
	StatusResolved      IncidentStatus = "RESOLVED"

	SeverityLow      Severity = "LOW"
	SeverityMedium   Severity = "MEDIUM"
	SeverityHigh     Severity = "HIGH"
	SeverityCritical Severity = "CRITICAL"
)

type Incident struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Title       string         `gorm:"not null" json:"title"`
	Description string         `gorm:"type:text" json:"description"`
	Severity    Severity       `gorm:"default:'MEDIUM'" json:"severity"`
	Status      IncidentStatus `gorm:"default:'OPEN'" json:"status"`
	Category    string         `json:"category"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	Analysis    *AIAnalysis    `gorm:"foreignKey:IncidentID" json:"analysis,omitempty"`
}

type AIAnalysis struct {
	ID                uint      `gorm:"primaryKey" json:"id"`
	IncidentID        uint      `gorm:"uniqueIndex" json:"incident_id"`
	Summary           string    `gorm:"type:text" json:"summary"`
	ProbableCause     string    `gorm:"type:text" json:"probable_cause"`
	RecommendedAction string    `gorm:"type:text" json:"recommended_action"`
	SeverityScore     int       `json:"severity_score"`
	AnalyzedAt        time.Time `json:"analyzed_at"`
}
