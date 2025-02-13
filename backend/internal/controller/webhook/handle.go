package webhook

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/levi-discente/PIT/internal/controller/user"
	"github.com/levi-discente/PIT/internal/database"
)

type SubscriptionEvent struct {
	ID       string            `json:"id"`
	Object   string            `json:"object"`
	Status   string            `json:"status"`
	Customer string            `json:"customer"`
	Metadata map[string]string `json:"metadata"`
}

type StripeSubscriptionEvent struct {
	ID     string `json:"id"`
	Object string `json:"object"`
	Type   string `json:"type"`
	Data   struct {
		Object SubscriptionEvent `json:"object"`
	} `json:"data"`
}

func Webhook(c *gin.Context) {
	body, err := c.GetRawData()
	if err != nil {
		c.String(http.StatusInternalServerError, fmt.Sprintf("Erro ao ler o corpo: %v", err))
		return
	}

	var event StripeSubscriptionEvent
	if err := json.Unmarshal(body, &event); err != nil {
		c.String(http.StatusBadRequest, fmt.Sprintf("Erro ao decodificar JSON: %v", err))
		return
	}

	if event.Type != "customer.subscription.created" &&
		event.Type != "customer.subscription.updated" &&
		event.Type != "customer.subscription.deleted" {
		c.String(http.StatusOK, "Evento ignorado")
		return
	}

	sub := event.Data.Object

	email, ok := sub.Metadata["email"]
	if !ok || email == "" {
		c.String(http.StatusBadRequest, "Email não encontrado no metadata da assinatura")
		return
	}

	var role string
	switch event.Type {
	case "customer.subscription.created", "customer.subscription.updated":
		if sub.Status == "active" {
			role = "premium"
		} else {
			role = "free"
		}
	case "customer.subscription.deleted":
		role = "free"
	}

	client, err := database.SupaBaseInit()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("cannot initialize client: %v", err)})
		return
	}

	response, _, err := client.From("user").
		Update(map[string]interface{}{
			"role": role,
		}, "representation", "exact").
		Filter("email", "eq", email).
		Execute()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to update user: %v", err)})
		return
	}

	var updatedUsers []user.User
	if err := json.Unmarshal(response, &updatedUsers); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to parse response: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "User role updated successfully",
		"data":    updatedUsers,
	})
}
