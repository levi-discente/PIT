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

// Estrutura para eventos do Invoice
type InvoiceData struct {
	ID            string `json:"id"`
	Object        string `json:"object"`
	Status        string `json:"status"`
	Customer      string `json:"customer"`
	CustomerEmail string `json:"customer_email"`
	// Outros campos se necessário…
}

type StripeInvoiceEvent struct {
	ID     string `json:"id"`
	Object string `json:"object"`
	Type   string `json:"type"`
	Data   struct {
		Object InvoiceData `json:"object"`
	} `json:"data"`
}

// Estrutura para eventos de Subscription
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
	// Lê o corpo bruto da requisição
	body, err := c.GetRawData()
	if err != nil {
		log.Printf("Erro ao ler o corpo: %v", err)
		c.String(http.StatusInternalServerError, fmt.Sprintf("Erro ao ler o corpo: %v", err))
		return
	}
	log.Printf("Raw request body: %s", body)

	// Primeiro, decodifica apenas para identificar o tipo do evento
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
		// Extrai o email do campo customer_email
		email = event.Data.Object.CustomerEmail
		// Se o billing_reason for "subscription_create", define premium
		if event.Data.Object.Status == "draft" { // Aqui você pode adicionar outras validações, se necessário.
			role = "premium"
		} else {
			role = "free"
		}
	case "customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted":
		var event StripeSubscriptionEvent
		if err := json.Unmarshal(body, &event); err != nil {
			log.Printf("Erro ao decodificar evento de subscription: %v", err)
			c.String(http.StatusBadRequest, fmt.Sprintf("Erro ao decodificar evento de subscription: %v", err))
			return
		}
		log.Printf("Decoded subscription event: %+v", event)
		// Tenta extrair o email do metadata
		email = event.Data.Object.Metadata["email"]
		if email == "" {
			// Se não houver email no metadata, você pode utilizar o ID do cliente para buscar o email
			// Exemplo: email = buscarEmailNoBanco(event.Data.Object.Customer)
			log.Printf("Email não encontrado no metadata, buscar via customer id: %s", event.Data.Object.Customer)
			// Aqui, implemente a lógica para buscar o email com base no customer ID
		}
		// Define a role com base no status da assinatura
		switch genericEvent.Type {
		case "customer.subscription.created", "customer.subscription.updated":
			if event.Data.Object.Status == "active" {
				role = "premium"
			} else {
				role = "free"
			}
		case "customer.subscription.deleted":
			role = "free"
		}
	default:
		log.Printf("Evento ignorado: %s", genericEvent.Type)
		c.String(http.StatusOK, "Evento ignorado")
		return
	}

	if email == "" {
		log.Printf("Email não encontrado para atualização de role")
		c.String(http.StatusBadRequest, "Email não encontrado")
		return
	}
	log.Printf("Email encontrado: %s", email)
	log.Printf("Definindo role: %s para email: %s", role, email)

	// Atualiza o usuário no banco de dados (via SupaBase, no seu caso)
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
	log.Printf("Response do update: %s", response)

	var updatedUsers []user.User
	if err := json.Unmarshal(response, &updatedUsers); err != nil {
		log.Printf("Erro ao converter resposta: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to parse response: %v", err)})
		return
	}
	log.Printf("Usuários atualizados: %+v", updatedUsers)

	c.JSON(http.StatusOK, gin.H{
		"message": "User role updated successfully",
		"data":    updatedUsers,
	})
}
