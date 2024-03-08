package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/your-org/incident-atlas/internal/config"
	"github.com/your-org/incident-atlas/internal/models"
	"gorm.io/gorm"
)

type IncidentHandler struct {
	DB  *gorm.DB
	Cfg *config.Config
}

type updateIncidentRequest struct {
	Title       *string                `json:"title"`
	Description *string                `json:"description"`
	Severity    *models.Severity       `json:"severity"`
	Status      *models.IncidentStatus `json:"status"`
	Category    *string                `json:"category"`
}

type analysisRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
}

type analysisResponse struct {
	Summary           string `json:"summary"`
	Category          string `json:"category"`
	SeverityScore     int    `json:"severity_score"`
	ProbableCause     string `json:"probable_cause"`
	RecommendedAction string `json:"recommended_action"`
}

func NewIncidentHandler(db *gorm.DB, cfg *config.Config) *IncidentHandler {
	return &IncidentHandler{DB: db, Cfg: cfg}
}

func (h *IncidentHandler) List(c *gin.Context) {
	var incidents []models.Incident
	if err := h.DB.Preload("Analysis").Find(&incidents).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, incidents)
}

func (h *IncidentHandler) Create(c *gin.Context) {
	var incident models.Incident
	if err := c.ShouldBindJSON(&incident); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	incident.Title = strings.TrimSpace(incident.Title)
	incident.Description = strings.TrimSpace(incident.Description)
	incident.Category = strings.TrimSpace(incident.Category)

	if incident.Title == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "title is required"})
		return
	}

	if incident.Severity == "" {
		incident.Severity = models.SeverityMedium
	} else {
		incident.Severity = models.Severity(strings.ToUpper(string(incident.Severity)))
	}

	if incident.Status == "" {
		incident.Status = models.StatusOpen
	} else {
		incident.Status = models.IncidentStatus(strings.ToUpper(string(incident.Status)))
	}

	if incident.Category == "" {
		incident.Category = "Triage"
	}

	if !isValidSeverity(incident.Severity) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid severity"})
		return
	}

	if !isValidStatus(incident.Status) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid status"})
		return
	}

	if err := h.DB.Create(&incident).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, incident)
}

func (h *IncidentHandler) Get(c *gin.Context) {
	id := c.Param("id")
	var incident models.Incident
	if err := h.DB.Preload("Analysis").First(&incident, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Incident not found"})
		return
	}
	c.JSON(http.StatusOK, incident)
}

func (h *IncidentHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid incident id"})
		return
	}

	var incident models.Incident
	if err := h.DB.First(&incident, uint(id)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Incident not found"})
		return
	}

	var req updateIncidentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Title != nil {
		incident.Title = strings.TrimSpace(*req.Title)
	}
	if req.Description != nil {
		incident.Description = strings.TrimSpace(*req.Description)
	}
	if req.Severity != nil {
		incident.Severity = models.Severity(strings.ToUpper(string(*req.Severity)))
	}
	if req.Status != nil {
		incident.Status = models.IncidentStatus(strings.ToUpper(string(*req.Status)))
	}
	if req.Category != nil {
		incident.Category = strings.TrimSpace(*req.Category)
	}

	if strings.TrimSpace(incident.Title) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "title is required"})
		return
	}

	if !isValidSeverity(incident.Severity) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid severity"})
		return
	}

	if !isValidStatus(incident.Status) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid status"})
		return
	}

	if err := h.DB.Save(&incident).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := h.DB.Preload("Analysis").First(&incident, incident.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, incident)
}

func (h *IncidentHandler) TriggerAnalysis(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid incident id"})
		return
	}

	var incident models.Incident
	if err := h.DB.Preload("Analysis").First(&incident, uint(id)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Incident not found"})
		return
	}

	payload, err := json.Marshal(analysisRequest{
		Title:       incident.Title,
		Description: incident.Description,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	endpoint := strings.TrimRight(h.Cfg.AIServiceURL, "/") + "/analyze"
	resp, err := http.Post(endpoint, "application/json", bytes.NewReader(payload))
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "failed to call AI service", "details": err.Error()})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode >= http.StatusBadRequest {
		c.JSON(http.StatusBadGateway, gin.H{"error": "AI service returned an error", "status_code": resp.StatusCode})
		return
	}

	var analysis analysisResponse
	if err := json.NewDecoder(resp.Body).Decode(&analysis); err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "invalid AI service response", "details": err.Error()})
		return
	}

	record := models.AIAnalysis{
		IncidentID:        incident.ID,
		Summary:           analysis.Summary,
		ProbableCause:     analysis.ProbableCause,
		RecommendedAction: analysis.RecommendedAction,
		SeverityScore:     analysis.SeverityScore,
		AnalyzedAt:        time.Now().UTC(),
	}

	if err := h.DB.Where(models.AIAnalysis{IncidentID: incident.ID}).Assign(record).FirstOrCreate(&record).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	incident.Category = strings.TrimSpace(analysis.Category)
	incident.Status = models.StatusAnalyzed

	if incident.Category == "" {
		incident.Category = "Uncategorized"
	}

	if err := h.DB.Save(&incident).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := h.DB.Preload("Analysis").First(&incident, incident.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, incident)
}

func HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

func isValidSeverity(severity models.Severity) bool {
	switch severity {
	case models.SeverityLow, models.SeverityMedium, models.SeverityHigh, models.SeverityCritical:
		return true
	default:
		return false
	}
}

func isValidStatus(status models.IncidentStatus) bool {
	switch status {
	case models.StatusOpen, models.StatusInvestigating, models.StatusAnalyzed, models.StatusResolved:
		return true
	default:
		return false
	}
}
