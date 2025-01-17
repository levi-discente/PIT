package activities

type Activities struct {
	Activity_type_id int    `json:"activity_type_id"`
	Description      string `json:"description"`
	Hours            int    `json:"hours"`
	Id               int    `json:"id"`
	Pit_id           int    `json:"pit_id"`
}
