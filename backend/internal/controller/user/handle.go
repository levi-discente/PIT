package user

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/levi-discente/PIT/internal/database"

	"github.com/gin-gonic/gin"
)

func GetUsers(c *gin.Context) {
	client, err := database.SupaBaseInit()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("cannot initialize client: %v", err)})
		return
	}

	response, _, err := client.From("user").Select("*", "exact", false).Execute()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to fetch users: %v", err)})
		return
	}

	var users []User
	if err := json.Unmarshal(response, &users); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to parse response: %v", err)})
		return
	}

	c.JSON(http.StatusOK, users)
}

func CreateUser(c *gin.Context) {
	client, err := database.SupaBaseInit()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("cannot initialize client: %v", err)})
		return
	}
	var user UserCreate
	if err := c.BindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if user.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User password is required"})
		return
	}

	response, _, err := client.From("user").Insert(user, false, "", "representation", "exact").Execute()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to insert user: %v", err)})
		return
	}

	var createdUsers []User
	if err := json.Unmarshal(response, &createdUsers); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to parse response: %v", err)})
		return
	}

	if len(createdUsers) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "no user created"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User created successfully", "data": createdUsers[0]})
}

func UpdateUser(c *gin.Context) {
	// Inicializa o cliente Supabase
	client, err := database.SupaBaseInit()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("cannot initialize client: %v", err)})
		return
	}

	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
		return
	}

	var user UserUpdate
	if err := c.BindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("failed to parse request body: %v", err)})
		return
	}

	response, _, err := client.From("user").
		Update(map[string]interface{}{
			"name":     user.Name,
			"email":    user.Email,
			"password": user.Password,
		}, "representation", "exact").Filter("id", "eq", id).Execute()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to update user: %v", err)})
		return
	}

	var updatedUser []User
	if err := json.Unmarshal(response, &updatedUser); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to parse response: %v", err)})
		return
	}

	if len(updatedUser) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User updated successfully", "data": updatedUser[0]})
}

func DeleteUser(c *gin.Context) {
	// Inicializa o cliente Supabase
	client, err := database.SupaBaseInit()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("cannot initialize client: %v", err)})
		return
	}

	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
		return
	}

	_, _, err = client.From("user").Delete("representation", "exact").Eq("id", id).Execute()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to update user: %v", err)})
		return
	}
	c.JSON(http.StatusNoContent, gin.H{})
}
