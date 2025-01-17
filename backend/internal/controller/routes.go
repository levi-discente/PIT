package contorller

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/levi-discente/PIT/internal/controller/activities"
	"github.com/levi-discente/PIT/internal/controller/pit"
	"github.com/levi-discente/PIT/internal/controller/user"
	"github.com/levi-discente/PIT/internal/database"
)

func Controller() {
	db, err := database.InitFirebase()
	if err != nil {
		log.Fatalf("Falha ao inicializar o Firebase: %v", err)
	}

	database.FirebaseDB = db

	r := gin.Default()

	// users
	r.GET("/users", user.GetUsers)
	r.POST("/users", user.CreateUser)
	r.PUT("/users/:id", user.UpdateUser)
	r.DELETE("/users/:id", user.DeleteUser)

	// pits
	r.GET("/pits", pit.GetPITs)
	r.POST("/pits", pit.CreatePIT)
	r.PUT("/pits/:id", pit.UpdatePIT)
	r.DELETE("/pits/:id", pit.DeletePIT)

	// activities
	r.GET("/activities", activities.GetActivities)
	r.POST("/activities", activities.CreateActivity)
	r.PUT("/activities/:id", activities.UpdateActivity)
	r.DELETE("/activities/:id", activities.DeleteActivity)

	r.Run(":8080")
}
