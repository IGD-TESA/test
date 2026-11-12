package user

import (
	"encoding/json"
	"net/http"
	"strings"
)

type PhoneHandler struct {
	service *PhoneService
}

func NewPhoneHandler(
	service *PhoneService,
) *PhoneHandler {
	return &PhoneHandler{
		service: service,
	}
}

type createPhoneRequest struct {
	UserID      string `json:"user_id"`
	PhoneNumber string `json:"phone_number"`
	IsPrimary   bool   `json:"is_primary"`
}

func (h *PhoneHandler) CreatePhone(
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

	var request createPhoneRequest

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

	phone := &UserPhone{
		UserID:      request.UserID,
		PhoneNumber: request.PhoneNumber,
		IsPrimary:   request.IsPrimary,
	}

	result, err := h.service.CreatePhone(
		r.Context(),
		phone,
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

func (h *PhoneHandler) GetPhonesByUserID(
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
		"/phones",
	)

	userID = strings.TrimSpace(userID)

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

	phones, err := h.service.GetPhonesByUserID(
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
		phones,
	)
}
