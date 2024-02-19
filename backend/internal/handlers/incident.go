package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/your-org/incident-atlas/internal/config"
	"github.com/your-org/incident-atlas/internal/models"
	"gorm.io/gorm"
)

type IncidentHandler struct {
	DB  *gorm.DB
	Cfg *config.Config
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
		c.JSON(http.StatusNotFound, gin.H{"error": "incident not found"})
		return
	}
	c.JSON(http.StatusOK, incident)
}

func (h *IncidentHandler) Update(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

func (h *IncidentHandler) TriggerAnalysis(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

func HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}
