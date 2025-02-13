package webhook

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/levi-discente/PIT/internal/controller/user"
	"github.com/levi-discente/PIT/internal/database"
)

func Webhook(c *gin.Context) {
	body, err := c.GetRawData()
	if err != nil {
		log.Printf("Erro ao ler o corpo: %v", err)
		c.String(http.StatusInternalServerError, fmt.Sprintf("Erro ao ler o corpo: %v", err))
		return
	}
	log.Printf("Raw request body: %s", body)

	var genericEvent struct {
		Type string `json:"type"`
	}
	if err := json.Unmarshal(body, &genericEvent); err != nil {
		log.Printf("Erro ao decodificar JSON genérico: %v", err)
		c.String(http.StatusBadRequest, fmt.Sprintf("Erro ao decodificar JSON genérico: %v", err))
		return
	}

	var email string
	var role string

	switch genericEvent.Type {
	case "invoice.created":
		var event StripeInvoiceEvent
		if err := json.Unmarshal(body, &event); err != nil {
			log.Printf("Erro ao decodificar evento de invoice: %v", err)
			c.String(http.StatusBadRequest, fmt.Sprintf("Erro ao decodificar evento de invoice: %v", err))
			return
		}
		log.Printf("Decoded invoice event: %+v", event)
		email = event.Data.Object.CustomerEmail
		role = "premium"

	case "invoice.updated":
		var event StripeInvoiceEvent
		if err := json.Unmarshal(body, &event); err != nil {
			log.Printf("Erro ao decodificar evento de invoice.updated: %v", err)
			c.String(http.StatusBadRequest, fmt.Sprintf("Erro ao decodificar evento de invoice.updated: %v", err))
			return
		}
		log.Printf("Decoded invoice.updated event: %+v", event)
		email = event.Data.Object.CustomerEmail
		if email == "" {
			log.Printf("Email não encontrado no invoice.updated")
			c.String(http.StatusOK, "Evento ignorado: email não encontrado")
			return
		}
		role = "free"

	case "customer.subscription.created":
		var event StripeSubscriptionEvent
		if err := json.Unmarshal(body, &event); err != nil {
			log.Printf("Erro ao decodificar evento de subscription (created): %v", err)
			c.String(http.StatusBadRequest, fmt.Sprintf("Erro ao decodificar evento de subscription (created): %v", err))
			return
		}
		log.Printf("Decoded subscription.created event: %+v", event)
		email = event.Data.Object.Metadata["email"]
		if email == "" {
			log.Printf("Email não encontrado no metadata para customer: %s", event.Data.Object.Customer)
			c.String(http.StatusBadRequest, "Email não encontrado")
			return
		}
		role = "premium"

	case "customer.subscription.updated", "customer.subscription.deleted":
		var event StripeSubscriptionEvent
		if err := json.Unmarshal(body, &event); err != nil {
			log.Printf("Erro ao decodificar evento de subscription (updated/deleted): %v", err)
			c.String(http.StatusBadRequest, fmt.Sprintf("Erro ao decodificar evento de subscription (updated/deleted): %v", err))
			return
		}
		log.Printf("Decoded subscription updated/deleted event: %+v", event)
		email = event.Data.Object.Metadata["email"]
		if email == "" {
			log.Printf("Email não encontrado no metadata para customer: %s. Ignorando o evento.", event.Data.Object.Customer)
			c.String(http.StatusOK, "Evento ignorado: email não encontrado")
			return
		}
		role = "free"

	default:
		log.Printf("Evento ignorado: %s", genericEvent.Type)
		c.String(http.StatusOK, "Evento ignorado")
		return
	}

	log.Printf("Email encontrado: %s", email)
	log.Printf("Definindo role: %s para email: %s", role, email)

	client, err := database.SupaBaseInit()
	if err != nil {
		log.Printf("Erro ao inicializar cliente: %v", err)
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
		log.Printf("Erro ao atualizar usuário: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to update user: %v", err)})
		return
	}

	var updatedUsers []user.User
	if err := json.Unmarshal(response, &updatedUsers); err != nil {
		log.Printf("Erro ao converter resposta: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to parse response: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "User role updated successfully",
		"data":    updatedUsers,
	})
}
