package activitytype

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/levi-discente/PIT/internal/database"
)

func GetActivityType(c *gin.Context) {
	client, err := database.SupaBaseInit()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("cannot initialize client: %v", err)})
		return
	}

	response, _, err := client.From("activity_type").Select("*", "exact", false).Execute()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to fetch activity_type %v", err)})
		return
	}

	var activity_type []ActivityType
	if err := json.Unmarshal(response, &activity_type); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to parse response: %v", err)})
		return
	}
	c.JSON(http.StatusOK, activity_type)
}

func CreateActivityType(c *gin.Context) {
	client, err := database.SupaBaseInit()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("cannot initialize client: %v", err)})
		return
	}
	var activity_type ActivityTypeCreate
	if err := c.BindJSON(&activity_type); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	response, _, err := client.From("activity_type").Insert(activity_type, false, "", "representation", "exact").Execute()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to insert activity_type: %v", err)})
		return
	}

	var createdActivityType []ActivityType
	if err := json.Unmarshal(response, &createdActivityType); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to parse response: %v", err)})
		return
	}

	if len(createdActivityType) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "no activity_type created"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Pit created successfully", "data": createdActivityType[0]})
}

func UpdateActivityType(c *gin.Context) {
	client, err := database.SupaBaseInit()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("cannot initialize client: %v", err)})
		return
	}
	id := c.Param("id")
	var activity_type ActivityTypeUpdate
	if err := c.BindJSON(&activity_type); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("failed to parse request body: %v", err)})
		return
	}

	response, _, err := client.From("activity_type").
		Update(map[string]interface{}{
			"name":        activity_type.Name,
			"description": activity_type.Description,
		}, "representation", "exact").Filter("id", "eq", id).Execute()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to update activity: %v", err)})
		return
	}

	var updatedActivityType []ActivityType
	if err := json.Unmarshal(response, &updatedActivityType); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to parse response: %v", err)})
		return
	}

	if len(updatedActivityType) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Activity type not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Activity type updated successfully", "data": updatedActivityType[0]})
}

func DeleteActivityType(c *gin.Context) {
	client, err := database.SupaBaseInit()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("cannot initialize client: %v", err)})
		return
	}

	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "activity_type ID is required"})
		return
	}

	_, _, err = client.From("activity_type").Delete("representation", "exact").Eq("id", id).Execute()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to delete activity_type: %v", err)})
		return
	}
	c.JSON(http.StatusNoContent, gin.H{})
}
