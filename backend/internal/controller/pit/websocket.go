package pit

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/joho/godotenv"
	"github.com/supabase-community/supabase-go"
)

// WebSocket client para ouvir mudanças em tempo real
func PITWebSocket(c *gin.Context) {
	// Conectar ao WebSocket do Supabase
	godotenv.Load(".env")

	var (
		API_URL = os.Getenv("PROJECT_URL")
		API_KEY = os.Getenv("API_KEY")

		PUBLIC_SUPABASE_URL      = "ptpdfhnnyjedvkudxivt.supabase.co"
		PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0cGRmaG5ueWplZHZrdWR4aXZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcxODQ3ODcsImV4cCI6MjA1Mjc2MDc4N30.YqOTiQR4AHCLwo3XQ8sI1f0038HXtDAgtS4zCNNYtxA"
	)

	client, err := supabase.NewClient(API_URL, API_KEY, nil)
	if err != nil {
		log.Printf("Erro ao criar cliente Supabase: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("cannot initialize client: %v", err)})
		return
	}

	fmt.Println("cliente: ", client)
	// A URL de WebSocket do Supabase
	wsURL := fmt.Sprintf("wss://%s/realtime/v1/websocket?apikey=%s&log_level=info&vsn=1.0.0", PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY)

	// Estabelecendo conexão com o WebSocket
	conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		log.Printf("Erro ao conectar ao WebSocket: %v", err, wsURL)
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("cannot initialize client: %v", err)})
		return
	}
	defer conn.Close()

	// Defina o canal para a tabela "pit" para escutar mudanças em tempo real
	// Configurações específicas podem variar dependendo do seu projeto no Supabase
	subscribeMsg := `{"topic": "realtime:public:pit", "event": "phx_join", "payload": {}, "ref": "1"}`

	err = conn.WriteMessage(websocket.TextMessage, []byte(subscribeMsg))
	if err != nil {
		log.Printf("Erro ao enviar mensagem de inscrição: %v", err)
		return
	}

	// Escutar por mensagens
	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			log.Printf("Erro ao ler mensagem do WebSocket: %v", err)
			break
		}

		// Aqui você pode tratar os dados recebidos
		log.Printf("Mensagem recebida: %s", message)
	}
}
