package activitytype

import (
	"net/http"
	"reflect"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/levi-discente/PIT/internal/database"
	"github.com/levi-discente/PIT/internal/helpers"
)

func GetActivityType(c *gin.Context) {
	client := database.FirebaseDB
	ref := client.NewRef("activities_types")
	var rawData interface{}

	// Recupera os dados como interface genérica
	if err := ref.Get(c, &rawData); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var activityTypes []ActivityType

	// Verifica o tipo do dado retornado
	if reflect.TypeOf(rawData).Kind() == reflect.Map {
		// Caso seja um mapa, percorra e converta os itens
		for _, v := range rawData.(map[string]interface{}) {
			var activityType ActivityType
			if err := helpers.MapToStruct(v, &activityType); err == nil {
				activityTypes = append(activityTypes, activityType)
			}
		}
	} else if reflect.TypeOf(rawData).Kind() == reflect.Slice {
		// Caso seja um array, percorra e converta os itens
		for _, v := range rawData.([]interface{}) {
			if v != nil {
				var activityType ActivityType
				if err := helpers.MapToStruct(v, &activityType); err == nil {
					activityTypes = append(activityTypes, activityType)
				}
			}
		}
	}

	c.JSON(http.StatusOK, activityTypes)
}

func CreateActivityType(c *gin.Context) {
	client := database.FirebaseDB
	ref := client.NewRef("activity_type")
	var activityType ActivityType
	if err := c.BindJSON(&activityType); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if activityType.Id == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "activity ID is required"})
		return
	}

	activityIDStr := strconv.Itoa(activityType.Id)
	if err := ref.Child(activityIDStr).Set(c, activityType); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, activityType)
}

func UpdateActivityType(c *gin.Context) {
	client := database.FirebaseDB
	ref := client.NewRef("activities")
	id := c.Param("id")
	var activityType ActivityType
	if err := c.BindJSON(&activityType); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := ref.Child(id).Update(c, map[string]interface{}{
		"Name": activityType.Name,
	}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, activityType)
}

func DeleteActivityType(c *gin.Context) {
	client := database.FirebaseDB
	ref := client.NewRef("activities")
	id := c.Param("id")

	if err := ref.Child(id).Delete(c); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusNoContent, gin.H{})
}
