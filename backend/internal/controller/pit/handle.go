package pit

import (
	"net/http"
	"reflect"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/levi-discente/PIT/internal/database"
	"github.com/levi-discente/PIT/internal/helpers"
)

func GetPITs(c *gin.Context) {
	client := database.FirebaseDB
	ref := client.NewRef("pits")
	var rawData interface{}

	// Recupera os dados como interface genérica
	if err := ref.Get(c, &rawData); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var pits []PIT

	// Verifica o tipo do dado retornado
	if reflect.TypeOf(rawData).Kind() == reflect.Map {
		// Caso seja um mapa, percorra e converta os itens
		for _, v := range rawData.(map[string]interface{}) {
			var pit PIT
			if err := helpers.MapToStruct(v, &pit); err == nil {
				pits = append(pits, pit)
			}
		}
	} else if reflect.TypeOf(rawData).Kind() == reflect.Slice {
		// Caso seja um array, percorra e converta os itens
		for _, v := range rawData.([]interface{}) {
			if v != nil {
				var pit PIT
				if err := helpers.MapToStruct(v, &pit); err == nil {
					pits = append(pits, pit)
				}
			}
		}
	}

	c.JSON(http.StatusOK, pits)
}

func CreatePIT(c *gin.Context) {
	client := database.FirebaseDB
	ref := client.NewRef("pits")
	var pit PIT
	if err := c.BindJSON(&pit); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if pit.ID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "PIT ID is required"})
		return
	}

	pitIDStr := strconv.Itoa(pit.ID)
	if err := ref.Child(pitIDStr).Set(c, pit); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, pit)
}

func UpdatePIT(c *gin.Context) {
	client := database.FirebaseDB
	ref := client.NewRef("pits")
	id := c.Param("id")
	var pit PIT
	if err := c.BindJSON(&pit); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := ref.Child(id).Update(c, map[string]interface{}{
		"semester": pit.Semester,
		"year":     pit.Year,
	}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, pit)
}

func DeletePIT(c *gin.Context) {
	client := database.FirebaseDB
	ref := client.NewRef("pits")
	id := c.Param("id")

	if err := ref.Child(id).Delete(c); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusNoContent, gin.H{})
}
