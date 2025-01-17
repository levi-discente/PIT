package activities

import (
	"net/http"
	"reflect"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/levi-discente/PIT/internal/database"
	"github.com/levi-discente/PIT/internal/helpers"
)

func GetActivities(c *gin.Context) {
	client := database.FirebaseDB
	ref := client.NewRef("activities")
	var rawData interface{}

	// Recupera os dados como interface genérica
	if err := ref.Get(c, &rawData); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var activities []Activities

	// Verifica o tipo do dado retornado
	if reflect.TypeOf(rawData).Kind() == reflect.Map {
		// Caso seja um mapa, percorra e converta os itens
		for _, v := range rawData.(map[string]interface{}) {
			var activity Activities
			if err := helpers.MapToStruct(v, &activity); err == nil {
				activities = append(activities, activity)
			}
		}
	} else if reflect.TypeOf(rawData).Kind() == reflect.Slice {
		// Caso seja um array, percorra e converta os itens
		for _, v := range rawData.([]interface{}) {
			if v != nil {
				var activity Activities
				if err := helpers.MapToStruct(v, &activity); err == nil {
					activities = append(activities, activity)
				}
			}
		}
	}

	c.JSON(http.StatusOK, activities)
}

func CreateActivity(c *gin.Context) {
	client := database.FirebaseDB
	ref := client.NewRef("activities")
	var activity Activities
	if err := c.BindJSON(&activity); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if activity.Id == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "activity ID is required"})
		return
	}

	activityIDStr := strconv.Itoa(activity.Id)
	if err := ref.Child(activityIDStr).Set(c, activity); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, activity)
}

func UpdateActivity(c *gin.Context) {
	client := database.FirebaseDB
	ref := client.NewRef("activities")
	id := c.Param("id")
	var activity Activities
	if err := c.BindJSON(&activity); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := ref.Child(id).Update(c, map[string]interface{}{
		"Description": activity.Description,
		"Hours":       activity.Hours,
		"PIT":         activity.Pit_id,
	}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, activity)
}

func DeleteActivity(c *gin.Context) {
	client := database.FirebaseDB
	ref := client.NewRef("activities")
	id := c.Param("id")

	if err := ref.Child(id).Delete(c); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusNoContent, gin.H{})
}
