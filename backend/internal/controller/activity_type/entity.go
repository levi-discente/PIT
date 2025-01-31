package activitytype

type ActivityType struct {
	Id          int    `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
}

type ActivityTypeCreate struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type ActivityTypeUpdate struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}
