package activities

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/levi-discente/PIT/internal/database"
)

func GetActivities(c *gin.Context) {
	client, err := database.SupaBaseInit()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("cannot initialize client: %v", err)})
		return
	}

	response, _, err := client.From("activity").Select("*", "exact", false).Execute()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to fetch pit %v", err)})
		return
	}

	var activities []Activity
	if err := json.Unmarshal(response, &activities); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to parse response: %v", err)})
		return
	}
	c.JSON(http.StatusOK, activities)
}

func CreateActivity(c *gin.Context) {
	client, err := database.SupaBaseInit()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("cannot initialize client: %v", err)})
		return
	}
	var activity ActivityCreate
	if err := c.BindJSON(&activity); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if activity.Activity_type_id == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "activity type_id is required"})
		return
	}
	if activity.Pit_id == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Pit id is required"})
		return
	}
	response, _, err := client.From("activity").Insert(activity, false, "", "representation", "exact").Execute()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to insert user: %v", err)})
		return
	}

	var createdPit []Activity
	if err := json.Unmarshal(response, &createdPit); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to parse response: %v", err)})
		return
	}

	if len(createdPit) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "no user created"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Pit created successfully", "data": createdPit[0]})
}

func UpdateActivity(c *gin.Context) {
	client, err := database.SupaBaseInit()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("cannot initialize client: %v", err)})
		return
	}
	id := c.Param("id")
	var activity ActivityUpdate
	if err := c.BindJSON(&activity); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("failed to parse request body: %v", err)})
		return
	}

	response, _, err := client.From("activity").
		Update(map[string]interface{}{
			"activity_type_id": activity.Activity_type_id,
			"pit_id":           activity.Pit_id,
			"name":             activity.Name,
			"description":      activity.Description,
			"hours":            activity.Hours,
		}, "representation", "exact").Filter("id", "eq", id).Execute()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to update activity: %v", err)})
		return
	}

	var updatedActivity []Activity
	if err := json.Unmarshal(response, &updatedActivity); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to parse response: %v", err)})
		return
	}

	if len(updatedActivity) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Activity not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Activity updated successfully", "data": updatedActivity[0]})
}

func DeleteActivity(c *gin.Context) {
	client, err := database.SupaBaseInit()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("cannot initialize client: %v", err)})
		return
	}

	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Activity ID is required"})
		return
	}

	_, _, err = client.From("activity").Delete("representation", "exact").Eq("id", id).Execute()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to delete activity: %v", err)})
		return
	}
	c.JSON(http.StatusNoContent, gin.H{})
}
