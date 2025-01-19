package pit

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/levi-discente/PIT/internal/database"
)

func GetPITs(c *gin.Context) {
	client, err := database.SupaBaseInit()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("cannot initialize client: %v", err)})
		return
	}

	response, _, err := client.From("pit").Select("*", "exact", false).Execute()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to fetch pit %v", err)})
		return
	}

	var pits []Pit
	if err := json.Unmarshal(response, &pits); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to parse response: %v", err)})
		return
	}
	c.JSON(http.StatusOK, pits)
}

func CreatePIT(c *gin.Context) {
	client, err := database.SupaBaseInit()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("cannot initialize client: %v", err)})
		return
	}
	var pit PitCreate
	if err := c.BindJSON(&pit); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if pit.Semester == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Pit semester is required"})
		return
	}
	if pit.UserID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Pit user id is required"})
		return
	}
	response, _, err := client.From("pit").Insert(pit, false, "", "representation", "exact").Execute()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to insert user: %v", err)})
		return
	}

	var createdPit []Pit
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

func UpdatePIT(c *gin.Context) {
	client, err := database.SupaBaseInit()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("cannot initialize client: %v", err)})
		return
	}

	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Pit ID is required"})
		return
	}

	var pit PitCreate
	if err := c.BindJSON(&pit); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("failed to parse request body: %v", err)})
		return
	}

	response, _, err := client.From("pit").
		Update(map[string]interface{}{
			"semester":    pit.Semester,
			"year":        pit.Year,
			"description": pit.Description,
		}, "representation", "exact").Filter("id", "eq", id).Execute()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to update pit: %v", err)})
		return
	}

	var updatedPit []Pit
	if err := json.Unmarshal(response, &updatedPit); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to parse response: %v", err)})
		return
	}

	if len(updatedPit) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pit not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Pit updated successfully", "data": updatedPit[0]})
}

func DeletePIT(c *gin.Context) {
	client, err := database.SupaBaseInit()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("cannot initialize client: %v", err)})
		return
	}

	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Pit ID is required"})
		return
	}

	_, _, err = client.From("pit").Delete("representation", "exact").Eq("id", id).Execute()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to delete pit: %v", err)})
		return
	}
	c.JSON(http.StatusNoContent, gin.H{})
}
