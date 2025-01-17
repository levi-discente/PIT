package pit

type PIT struct {
	ID        int    `json:"id"`
	UserID    int    `json:"user_id"`
	Semester  string `json:"semester"`
	Year      string `json:"year"`
	CreatedAt string `json:"created_at"`
}
