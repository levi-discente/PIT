package auth

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/levi-discente/PIT/internal/database"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token não fornecido"})
			c.Abort()
			return
		}

		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Formato de token inválido"})
			c.Abort()
			return
		}

		// Inicializar Supabase
		client, err := database.SupaBaseInit()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao conectar ao Supabase"})
			c.Abort()
			return
		}

		// Buscar usuário autenticado
		user, err := client.Auth.GetUser()
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido ou expirado"})
			c.Abort()
			return
		}

		// Armazenar usuário na requisição
		c.Set("user", user)
		c.Next()
	}
}
