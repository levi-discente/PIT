package pit

import "time"

type PIT struct {
	ID          int       `json:"id"`
	UserID      int       `json:"user_id"`
	Semester    string    `json:"semester"`
	Description string    `json:"description"`
	Year        string    `json:"year"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
