package verification

import (
	"encoding/json"
	"net"
	"net/http"
	"strings"
)

type Handler struct {
	service    *Service
	protection *Protection
	audit      *AuditRepository
}

func NewHandler(
	service *Service,
	protection *Protection,
	audit *AuditRepository,
) *Handler {
	return &Handler{
		service:    service,
		protection: protection,
		audit:      audit,
	}
}

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

	if h == nil || h.service == nil {
		writeJSONError(
			w,
			http.StatusInternalServerError,
			"verification service is unavailable",
		)
		return
	}

	id := strings.TrimPrefix(
		r.URL.Path,
		"/api/v1/verifications/",
	)

	if id == "" {
		writeJSONError(
			w,
			http.StatusBadRequest,
			"verification id is empty",
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

	_ = h.recordAudit(
		r,
		verification,
		"create",
		"",
		"",
	)

	writeJSON(
		w,
		http.StatusCreated,
		verification,
	)
}

type CreateVerificationRequest struct {
	UserID            string            `json:"user_id"`
	VerificationType  VerificationType  `json:"verification_type"`
	Provider          string            `json:"provider"`
	ReferenceID       string            `json:"reference_id,omitempty"`
	VerificationLevel VerificationLevel `json:"verification_level,omitempty"`
}

type ExecuteVerificationRequest struct {
	UserID           string            `json:"user_id"`
	VerificationType VerificationType  `json:"verification_type"`
	Provider         string            `json:"provider"`
	Data             map[string]string `json:"data,omitempty"`
}

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

	idempotencyKey := strings.TrimSpace(
		r.Header.Get("Idempotency-Key"),
	)

	ip := clientIP(r)

	// ========================================================
	// Rate limit
	// ========================================================

	if h.protection != nil {

		if err := h.protection.CheckRateLimit(
			r.Context(),
			request.UserID,
			ip,
		); err != nil {

			_ = h.recordAuditError(
				r,
				request,
				idempotencyKey,
				"rate_limit",
				err,
			)

			writeJSONError(
				w,
				http.StatusTooManyRequests,
				err.Error(),
			)

			return
		}
	}

	// ========================================================
	// Idempotency
	// ========================================================

	fingerprint := ""

	if h.protection != nil {

		var err error

		fingerprint, err = BuildRequestFingerprint(
			request.UserID,
			request.VerificationType,
			request.Provider,
			request.Data,
		)

		if err != nil {
			writeJSONError(
				w,
				http.StatusInternalServerError,
				"failed to build request fingerprint",
			)
			return
		}

		existing, found, err := h.protection.GetIdempotency(
			r.Context(),
			idempotencyKey,
			fingerprint,
		)

		if err != nil {
			writeJSONError(
				w,
				http.StatusConflict,
				err.Error(),
			)
			return
		}

		if found {

			_ = h.recordAudit(
				r,
				existing,
				"idempotency_replay",
				idempotencyKey,
				"",
			)

			writeJSON(
				w,
				http.StatusOK,
				existing,
			)

			return
		}

		if idempotencyKey != "" {

			reserved, err := h.protection.ReserveIdempotency(
				r.Context(),
				idempotencyKey,
				fingerprint,
			)

			if err != nil {
				writeJSONError(
					w,
					http.StatusInternalServerError,
					err.Error(),
				)
				return
			}

			if !reserved {
				writeJSONError(
					w,
					http.StatusConflict,
					"idempotency request is already being processed",
				)
				return
			}
		}
	}

	// ========================================================
	// Execute
	// ========================================================

	verification, err := h.service.ExecuteVerification(
		r.Context(),
		request.UserID,
		request.VerificationType,
		request.Provider,
		request.Data,
	)

	if err != nil {

		_ = h.recordAuditError(
			r,
			request,
			idempotencyKey,
			"execute_failed",
			err,
		)

		writeJSONError(
			w,
			http.StatusBadRequest,
			err.Error(),
		)

		return
	}

	// ========================================================
	// Store idempotency result
	// ========================================================

	if h.protection != nil && idempotencyKey != "" {

		_ = h.protection.StoreIdempotency(
			r.Context(),
			idempotencyKey,
			fingerprint,
			verification,
		)
	}

	// ========================================================
	// Audit
	// ========================================================

	_ = h.recordAudit(
		r,
		verification,
		"execute",
		idempotencyKey,
		"",
	)

	writeJSON(
		w,
		http.StatusOK,
		verification,
	)
}

func (h *Handler) recordAudit(
	r *http.Request,
	verification *Verification,
	operation string,
	idempotencyKey string,
	errorMessage string,
) error {
	if h == nil || h.audit == nil || verification == nil {
		return nil
	}

	return h.audit.Create(
		r.Context(),
		&VerificationAudit{
			UserID:           verification.UserID,
			VerificationID:   verification.ID,
			Operation:        operation,
			VerificationType: string(verification.VerificationType),
			Provider:         verification.Provider,
			Status:           string(verification.Status),
			IdempotencyKey:   idempotencyKey,
			IPAddress:        clientIP(r),
			UserAgent:        r.UserAgent(),
			ErrorMessage:     errorMessage,
		},
	)
}

func (h *Handler) recordAuditError(
	r *http.Request,
	request ExecuteVerificationRequest,
	idempotencyKey string,
	operation string,
	err error,
) error {
	if h == nil || h.audit == nil {
		return nil
	}

	errorMessage := ""

	if err != nil {
		errorMessage = err.Error()
	}

	return h.audit.Create(
		r.Context(),
		&VerificationAudit{
			UserID:           request.UserID,
			Operation:        operation,
			VerificationType: string(request.VerificationType),
			Provider:         request.Provider,
			IdempotencyKey:   idempotencyKey,
			IPAddress:        clientIP(r),
			UserAgent:        r.UserAgent(),
			ErrorMessage:     errorMessage,
		},
	)
}

func clientIP(r *http.Request) string {
	if r == nil {
		return ""
	}

	host, _, err := net.SplitHostPort(
		r.RemoteAddr,
	)

	if err == nil {
		return host
	}

	return r.RemoteAddr
}

func writeJSON(
	w http.ResponseWriter,
	statusCode int,
	data any,
) {
	w.Header().Set(
		"Content-Type",
		"application/json",
	)

	w.WriteHeader(statusCode)

	_ = json.NewEncoder(w).Encode(data)
}

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
