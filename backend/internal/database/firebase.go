package database

import (
	"context"
	"fmt"
	"log"

	firebase "firebase.google.com/go"
	"firebase.google.com/go/db"
	"google.golang.org/api/option"
)

var FirebaseDB *db.Client

const firebaseDBURL = "https://projectpit-31432-default-rtdb.firebaseio.com"

func InitFirebase() (*db.Client, error) {
	ctx := context.Background()
	opt := option.WithCredentialsFile("firebase-credentials.json")
	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		log.Fatalf("Erro ao inicializar Firebase: %v", err)
		return nil, err
	}

	dbClient, err := app.DatabaseWithURL(ctx, firebaseDBURL)
	if err != nil {
		log.Fatalf("Erro ao inicializar o Realtime Database: %v", err)
		return nil, err
	}

	FirebaseDB = dbClient
	fmt.Println("Conexão com o Realtime Database bem-sucedida")
	return dbClient, nil
}
