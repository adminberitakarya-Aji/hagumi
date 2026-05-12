package payments

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/paymentintent"
	"github.com/stripe/stripe-go/v76/webhook"
)

// PaymentService handles Stripe interactions
type PaymentService struct {
	SecretKey      string
	WebhookSecret  string
	SuccessURL     string
	CancelURL      string
}

// NewPaymentService creates a new payment service
func NewPaymentService() *PaymentService {
	key := os.Getenv("STRIPE_SECRET_KEY")
	stripe.Key = key

	return &PaymentService{
		SecretKey:     key,
		WebhookSecret: os.Getenv("STRIPE_WEBHOOK_SECRET"),
		SuccessURL:    os.Getenv("PAYMENT_SUCCESS_URL"),
		CancelURL:     os.Getenv("PAYMENT_CANCEL_URL"),
	}
}

// CreatePaymentIntent creates a new Stripe PaymentIntent
func (s *PaymentService) CreatePaymentIntent(amount int64, currency string, metadata map[string]string) (*stripe.PaymentIntent, error) {
	params := &stripe.PaymentIntentParams{
		Amount:   stripe.Int64(amount),
		Currency: stripe.String(currency),
		AutomaticPaymentMethods: &stripe.PaymentIntentAutomaticPaymentMethodsParams{
			Enabled: stripe.Bool(true),
		},
	}

	for k, v := range metadata {
		params.AddMetadata(k, v)
	}

	return paymentintent.New(params)
}

// HandleWebhook processes Stripe webhook events
func (s *PaymentService) HandleWebhook(w http.ResponseWriter, r *http.Request) {
	const MaxBodyBytes = int64(65536)
	r.Body = http.MaxBytesReader(w, r.Body, MaxBodyBytes)
	payload, err := io.ReadAll(r.Body)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error reading request body: %v\n", err)
		w.WriteHeader(http.StatusServiceUnavailable)
		return
	}

	event, err := webhook.ConstructEvent(payload, r.Header.Get("Stripe-Signature"), s.WebhookSecret)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error verifying webhook signature: %v\n", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// Handle the event
	switch event.Type {
	case "payment_intent.succeeded":
		var pi stripe.PaymentIntent
		err := json.Unmarshal(event.Data.Raw, &pi)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error parsing webhook JSON: %v\n", err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		s.handlePaymentSucceeded(&pi)
	case "payment_intent.payment_failed":
		// Handle failed payment
	default:
		fmt.Fprintf(os.Stdout, "Unhandled event type: %s\n", event.Type)
	}

	w.WriteHeader(http.StatusOK)
}

func (s *PaymentService) handlePaymentSucceeded(pi *stripe.PaymentIntent) {
	fmt.Printf("Payment for %d succeeded (ID: %s)\n", pi.Amount, pi.ID)
	
	// TODO: Update user balance in database
	// userID := pi.Metadata["user_id"]
	// gems := pi.Metadata["gems"]
	// ... logic to update database ...
}
