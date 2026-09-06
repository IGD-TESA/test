package verification

import (
	"encoding/json"
	"net/http"
	"strings"
)

// Handler Ù…Ø³Ø¦ÙˆÙ„ Ø¯Ø±ÛŒØ§ÙØª Ùˆ Ù¾Ø§Ø³Ø®â€ŒØ¯Ù‡ÛŒ Ø¨Ù‡ Ø¯Ø±Ø®ÙˆØ§Ø³Øªâ€ŒÙ‡Ø§ÛŒ HTTP Ù…Ø±Ø¨ÙˆØ· Ø¨Ù‡ Verification Ø§Ø³Øª.
type Handler struct {
	service *Service
}

// NewHandler ÛŒÚ© Verification Handler Ø¬Ø¯ÛŒØ¯ Ø§ÛŒØ¬Ø§Ø¯ Ù…ÛŒâ€ŒÚ©Ù†Ø¯.
func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
	}
}

// GetVerification Ø§Ø·Ù„Ø§Ø¹Ø§Øª ÛŒÚ© Verification Ø±Ø§ Ø¨Ø± Ø§Ø³Ø§Ø³ ID Ø¨Ø±Ù…ÛŒâ€ŒÚ¯Ø±Ø¯Ø§Ù†Ø¯.
func (h *Handler) GetVerification(
	w http.ResponseWriter,
	r *http.Request,
) {
	if r.Method != http.MethodGet {
		writeJSONError(
			w,
			http.StatusMethodNotAllowed,
			"method not allowed",
		)
		return
	}

	id := strings.TrimPrefix(r.URL.Path, "/api/v1/verifications/")

	if id == "" {
		writeJSONError(
			w,
			http.StatusBadRequest,
			"verification id is required",
		)
		return
	}

	if h == nil || h.service == nil {
		writeJSONError(
			w,
			http.StatusInternalServerError,
			"verification service is unavailable",
		)
		return
	}

	verification, err := h.service.GetVerification(
		r.Context(),
		id,
	)

	if err != nil {
		if err.Error() == "verification not found" {
			writeJSONError(
				w,
				http.StatusNotFound,
				"verification not found",
			)
			return
		}

		writeJSONError(
			w,
			http.StatusInternalServerError,
			"failed to get verification",
		)
		return
	}

	writeJSON(
		w,
		http.StatusOK,
		verification,
	)
}

// CreateVerification ÛŒÚ© Verification Ø¬Ø¯ÛŒØ¯ Ø§ÛŒØ¬Ø§Ø¯ Ù…ÛŒâ€ŒÚ©Ù†Ø¯.
func (h *Handler) CreateVerification(
	w http.ResponseWriter,
	r *http.Request,
) {
	if r.Method != http.MethodPost {
		writeJSONError(
			w,
			http.StatusMethodNotAllowed,
			"method not allowed",
		)
		return
	}

	if h == nil || h.service == nil {
		writeJSONError(
			w,
			http.StatusInternalServerError,
			"verification service is unavailable",
		)
		return
	}

	var request CreateVerificationRequest

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		writeJSONError(
			w,
			http.StatusBadRequest,
			"invalid request body",
		)
		return
	}

	verification := &Verification{
		UserID:            request.UserID,
		VerificationType:  request.VerificationType,
		Provider:          request.Provider,
		Status:            VerificationStatusPending,
		ReferenceID:       request.ReferenceID,
		VerificationLevel: request.VerificationLevel,
	}

	if err := h.service.CreateVerification(
		r.Context(),
		verification,
	); err != nil {
		writeJSONError(
			w,
			http.StatusBadRequest,
			err.Error(),
		)
		return
	}

	writeJSON(
		w,
		http.StatusCreated,
		verification,
	)
}

// CreateVerificationRequest Ø¨Ø¯Ù†Ù‡ Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ø§ÛŒØ¬Ø§Ø¯ Verification Ø§Ø³Øª.
type CreateVerificationRequest struct {
	UserID            string            `json:"user_id"`
	VerificationType  VerificationType  `json:"verification_type"`
	Provider          string            `json:"provider"`
	ReferenceID       string            `json:"reference_id,omitempty"`
	VerificationLevel VerificationLevel `json:"verification_level,omitempty"`
}

// writeJSON Ù¾Ø§Ø³Ø® JSON Ø§Ø³ØªØ§Ù†Ø¯Ø§Ø±Ø¯ Ø§ÛŒØ¬Ø§Ø¯ Ù…ÛŒâ€ŒÚ©Ù†Ø¯.
func writeJSON(
	w http.ResponseWriter,
	statusCode int,
	data any,
) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)

	_ = json.NewEncoder(w).Encode(data)
}

// writeJSONError ÛŒÚ© Ù¾Ø§Ø³Ø® Ø®Ø·Ø§ÛŒ JSON Ø§ÛŒØ¬Ø§Ø¯ Ù…ÛŒâ€ŒÚ©Ù†Ø¯.
func writeJSONError(
	w http.ResponseWriter,
	statusCode int,
	message string,
) {
	writeJSON(
		w,
		statusCode,
		map[string]string{
			"error": message,
		},
	)
}

// ExecuteVerification ÛŒÚ© Ø¹Ù…Ù„ÛŒØ§Øª Verification Ø±Ø§ Ø§Ø¬Ø±Ø§ Ù…ÛŒâ€ŒÚ©Ù†Ø¯.
func (h *Handler) ExecuteVerification(
	w http.ResponseWriter,
	r *http.Request,
) {
	if r.Method != http.MethodPost {
		writeJSONError(
			w,
			http.StatusMethodNotAllowed,
			"method not allowed",
		)
		return
	}

	if h == nil || h.service == nil {
		writeJSONError(
			w,
			http.StatusInternalServerError,
			"verification service is unavailable",
		)
		return
	}

	var request ExecuteVerificationRequest

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		writeJSONError(
			w,
			http.StatusBadRequest,
			"invalid request body",
		)
		return
	}

	verification, err := h.service.ExecuteVerification(
		r.Context(),
		request.UserID,
		request.VerificationType,
		request.Provider,
		request.Data,
	)

	if err != nil {
		writeJSONError(
			w,
			http.StatusBadRequest,
			err.Error(),
		)
		return
	}

	writeJSON(
		w,
		http.StatusOK,
		verification,
	)
}

// ExecuteVerificationRequest Ø¨Ø¯Ù†Ù‡ Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ø§Ø¬Ø±Ø§ÛŒ Verification Ø§Ø³Øª.
type ExecuteVerificationRequest struct {
	UserID           string            `json:"user_id"`
	VerificationType VerificationType  `json:"verification_type"`
	Provider         string            `json:"provider"`
	Data             map[string]string `json:"data,omitempty"`
}
