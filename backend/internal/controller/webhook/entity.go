package webhook

type InvoiceData struct {
	ID            string `json:"id"`
	Object        string `json:"object"`
	Status        string `json:"status"`
	Customer      string `json:"customer"`
	CustomerEmail string `json:"customer_email"`
}

type StripeInvoiceEvent struct {
	ID     string `json:"id"`
	Object string `json:"object"`
	Type   string `json:"type"`
	Data   struct {
		Object InvoiceData `json:"object"`
	} `json:"data"`
}

type SubscriptionEvent struct {
	ID       string            `json:"id"`
	Object   string            `json:"object"`
	Status   string            `json:"status"`
	Customer string            `json:"customer"`
	Metadata map[string]string `json:"metadata"`
}

type StripeSubscriptionEvent struct {
	ID     string `json:"id"`
	Object string `json:"object"`
	Type   string `json:"type"`
	Data   struct {
		Object SubscriptionEvent `json:"object"`
	} `json:"data"`
}
