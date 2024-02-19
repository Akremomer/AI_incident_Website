package api

import (
	"github.com/gin-gonic/gin"
	"github.com/your-org/incident-atlas/internal/config"
	"github.com/your-org/incident-atlas/internal/handlers"
	"gorm.io/gorm"
)

func SetupRoutes(r *gin.Engine, db *gorm.DB, cfg *config.Config) {
	incidentHandler := handlers.NewIncidentHandler(db, cfg)

	api := r.Group("/api")
	{
		incidents := api.Group("/incidents")
		{
			incidents.GET("", incidentHandler.List)
			incidents.POST("", incidentHandler.Create)
			incidents.GET("/:id", incidentHandler.Get)
			incidents.PUT("/:id", incidentHandler.Update)
			incidents.POST("/:id/analyze", incidentHandler.TriggerAnalysis)
		}

		api.GET("/health", handlers.HealthCheck)
	}
}
