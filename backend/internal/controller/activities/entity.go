package activities

import "time"

type Activities struct {
	Id               int       `json:"id"`
	Pit_id           int       `json:"pit_id"`
	Activity_type_id int       `json:"activity_type_id"`
	Name             string    `json:"name"`
	Description      string    `json:"description"`
	Hours            int       `json:"hours"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}
