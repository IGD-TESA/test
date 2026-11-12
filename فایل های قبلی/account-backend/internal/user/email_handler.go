package user

import (
	"encoding/json"
	"net/http"
	"strings"
)

type EmailHandler struct {
	service *EmailService
}

func NewEmailHandler(
	service *EmailService,
) *EmailHandler {
	return &EmailHandler{
		service: service,
	}
}

type createEmailRequest struct {
	UserID    string `json:"user_id"`
	Email     string `json:"email"`
	IsPrimary bool   `json:"is_primary"`
}

func (h *EmailHandler) CreateEmail(
	w http.ResponseWriter,
	r *http.Request,
) {

	if r.Method != http.MethodPost {

		writeJSON(
			w,
			http.StatusMethodNotAllowed,
			map[string]string{
				"error": "method not allowed",
			},
		)

		return
	}

	var request createEmailRequest

	if err := json.NewDecoder(
		r.Body,
	).Decode(&request); err != nil {

		writeJSON(
			w,
			http.StatusBadRequest,
			map[string]string{
				"error": "invalid request body",
			},
		)

		return
	}

	email := &UserEmail{
		UserID:    request.UserID,
		Email:     request.Email,
		IsPrimary: request.IsPrimary,
	}

	result, err := h.service.CreateEmail(
		r.Context(),
		email,
	)

	if err != nil {

		writeJSON(
			w,
			http.StatusBadRequest,
			map[string]string{
				"error": err.Error(),
			},
		)

		return
	}

	writeJSON(
		w,
		http.StatusCreated,
		result,
	)
}

func (h *EmailHandler) GetEmailsByUserID(
	w http.ResponseWriter,
	r *http.Request,
) {

	if r.Method != http.MethodGet {

		writeJSON(
			w,
			http.StatusMethodNotAllowed,
			map[string]string{
				"error": "method not allowed",
			},
		)

		return
	}

	userID := strings.TrimPrefix(
		r.URL.Path,
		"/api/v1/users/",
	)

	userID = strings.TrimSuffix(
		userID,
		"/emails",
	)

	userID = strings.TrimSpace(
		userID,
	)

	if userID == "" {

		writeJSON(
			w,
			http.StatusBadRequest,
			map[string]string{
				"error": "user id is required",
			},
		)

		return
	}

	emails, err := h.service.GetEmailsByUserID(
		r.Context(),
		userID,
	)

	if err != nil {

		writeJSON(
			w,
			http.StatusNotFound,
			map[string]string{
				"error": err.Error(),
			},
		)

		return
	}

	writeJSON(
		w,
		http.StatusOK,
		emails,
	)
}
