package user

import (
	"net/http"
	"strconv"

	"github.com/levi-discente/PIT/internal/database"
	"github.com/levi-discente/PIT/internal/helpers"

	"github.com/gin-gonic/gin"
)

func GetUsers(c *gin.Context) {
	client := database.FirebaseDB
	ref := client.NewRef("user")
	var rawData interface{}

	if err := ref.Get(c, &rawData); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var users []User
	switch rawData := rawData.(type) {
	case map[string]interface{}:
		for _, v := range rawData {
			var user User
			if err := helpers.MapToStruct(v, &user); err == nil {
				users = append(users, user)
			}
		}
	case []interface{}:
		for _, v := range rawData {
			if v != nil {
				var user User
				if err := helpers.MapToStruct(v, &user); err == nil {
					users = append(users, user)
				}
			}
		}
	default:
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unexpected data format"})
		return
	}

	c.JSON(http.StatusOK, users)
}

func CreateUser(c *gin.Context) {
	client := database.FirebaseDB
	ref := client.NewRef("user")
	var user User
	if err := c.BindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if user.ID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
		return
	}
	userIDStr := strconv.Itoa(user.ID)
	if err := ref.Child(userIDStr).Set(c, user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, user)
}

func UpdateUser(c *gin.Context) {
	client := database.FirebaseDB
	ref := client.NewRef("user")
	id := c.Param("id")
	var user User
	if err := c.BindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := ref.Child(id).Update(c, map[string]interface{}{
		"name":  user.Name,
		"email": user.Email,
		"role":  user.Role,
	}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, user)
}

func DeleteUser(c *gin.Context) {
	client := database.FirebaseDB
	ref := client.NewRef("user")
	id := c.Param("id")
	if err := ref.Child(id).Delete(c); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusNoContent, gin.H{})
}
