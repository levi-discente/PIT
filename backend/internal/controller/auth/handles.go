package auth

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/levi-discente/PIT/internal/database"
)

// Estrutura para receber as credenciais de login
type Credentials struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type Role string

const (
	Docente  Role = "docente"
	Discente Role = "discente"
)

type User struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	Role      Role   `json:"role"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

// Login autentica um usuário e retorna um JWT
func Login(c *gin.Context) {
	var credentials Credentials
	if err := c.ShouldBindJSON(&credentials); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Inicializar conexão com o Supabase
	client, err := database.SupaBaseInit()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection error"})
		return
	}

	// Buscar usuário no banco de dados pelo email
	response, _, err := client.From("user").Select("*", "exact", false).Eq("email", credentials.Email).Single().Execute()
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials Email"})
		return
	}

	// Converter a resposta JSON para struct User
	var dbUser User
	if err := json.Unmarshal(response, &dbUser); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parsing user"})
		return
	}

	// Verificar senha (deve estar usando bcrypt)
	if err := CheckPassword(dbUser.Password, credentials.Password); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials senha"})
		return
	}

	// Gerar Token JWT
	token, err := GenerateToken(dbUser.ID, string(dbUser.Role))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error generating token"})
		return
	}

	// Retornar token JWT para o cliente
	c.JSON(http.StatusOK, gin.H{"message": "Login successful", "id": dbUser.ID, "role": dbUser.Role, "token": token})
}
