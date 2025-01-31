package controller

import (
	"github.com/gin-gonic/gin"
	"github.com/levi-discente/PIT/internal/controller/activities"
	"github.com/levi-discente/PIT/internal/controller/auth"
	"github.com/levi-discente/PIT/internal/controller/pit"
	"github.com/levi-discente/PIT/internal/controller/user"
)

func Controller() {
	r := gin.Default()

	// Rotas públicas
	r.POST("/Auth/login", auth.Login)
	r.POST("/users", user.CreateUser)

	// Grupo de rotas protegidas
	protected := r.Group("/")
	protected.Use(auth.AuthMiddleware())

	// users
	protected.GET("/users", user.GetUsers)
	protected.PUT("/users/:id", user.UpdateUser)
	protected.DELETE("/users/:id", user.DeleteUser)

	// pits
	protected.GET("/pits", pit.GetPITs)
	protected.POST("/pits", pit.CreatePIT)
	protected.PUT("/pits/:id", pit.UpdatePIT)
	protected.DELETE("/pits/:id", pit.DeletePIT)
	protected.GET("/ws/pits", pit.PITWebSocket)

	// activities
	protected.GET("/activities", activities.GetActivities)
	protected.POST("/activities", activities.CreateActivity)
	protected.PUT("/activities/:id", activities.UpdateActivity)
	protected.DELETE("/activities/:id", activities.DeleteActivity)

	r.Run(":8080")
}
