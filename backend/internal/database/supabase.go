package database

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
	"github.com/supabase-community/supabase-go"
)

func SupaBaseInit() (*supabase.Client, error) {
	godotenv.Load(".env")

	var (
		API_URL       = os.Getenv("PROJECT_URL")
		API_KEY       = os.Getenv("API_KEY")
		USER_EMAIL    = os.Getenv("USER_EMAIL")
		USER_PASSWORD = os.Getenv("USER_PASSWORD")
	)
	client, err := supabase.NewClient(API_URL, API_KEY, &supabase.ClientOptions{})
	if err != nil {
		return nil, fmt.Errorf("cannot initialize client: %w", err)
	}
	client.SignInWithEmailPassword(USER_EMAIL, USER_PASSWORD)
	return client, nil
}
