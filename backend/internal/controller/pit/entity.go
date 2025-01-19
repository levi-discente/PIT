package pit

type Pit struct {
	ID          int    `json:"id"`
	UserID      int    `json:"user_id"`
	Semester    string `json:"semester"`
	Description string `json:"description"`
	Year        string `json:"year"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
}

type PitCreate struct {
	UserID      int    `json:"user_id"`
	Semester    string `json:"semester"`
	Description string `json:"description"`
	Year        string `json:"year"`
}

type PitUpdate struct {
	Semester    string `json:"semester"`
	Description string `json:"description"`
	Year        string `json:"year"`
	UpdatedAt   string `json:"updated_at"`
}
