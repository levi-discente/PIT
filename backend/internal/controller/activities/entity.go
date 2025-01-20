package activities

type Activity struct {
	Id               int    `json:"id"`
	Pit_id           int    `json:"pit_id"`
	Activity_type_id int    `json:"activity_type_id"`
	Name             string `json:"name"`
	Description      string `json:"description"`
	Hours            int    `json:"hours"`
	CreatedAt        string `json:"created_at"`
	UpdatedAt        string `json:"updated_at"`
}

type ActivityCreate struct {
	Pit_id           int    `json:"pit_id"`
	Activity_type_id int    `json:"activity_type_id"`
	Name             string `json:"name"`
	Description      string `json:"description"`
	Hours            int    `json:"hours"`
}

type ActivityUpdate struct {
	Pit_id           int    `json:"pit_id"`
	Activity_type_id int    `json:"activity_type_id"`
	Name             string `json:"name"`
	Description      string `json:"description"`
	Hours            int    `json:"hours"`
}
