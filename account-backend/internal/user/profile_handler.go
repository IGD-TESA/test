package user

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"
)

type ProfileHandler struct {
	service *ProfileService
}

func NewProfileHandler(service *ProfileService) *ProfileHandler {
	return &ProfileHandler{
		service: service,
	}
}

type createProfileRequest struct {
	UserID     string `json:"user_id"`
	FirstName  string `json:"first_name"`
	LastName   string `json:"last_name"`
	NationalID string `json:"national_id"`
	BirthDate  string `json:"birth_date"`
}

func (h *ProfileHandler) CreateProfile(
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

	var request createProfileRequest

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		writeJSON(
			w,
			http.StatusBadRequest,
			map[string]string{
				"error": "invalid request body",
			},
		)
		return
	}

	profile := &UserProfile{
		UserID:     request.UserID,
		FirstName:  request.FirstName,
		LastName:   request.LastName,
		NationalID: request.NationalID,
	}

	if request.BirthDate != "" {
		birthDate, err := time.Parse(
			"2006-01-02",
			request.BirthDate,
		)

		if err != nil {
			writeJSON(
				w,
				http.StatusBadRequest,
				map[string]string{
					"error": "birth_date must be in YYYY-MM-DD format",
				},
			)
			return
		}

		profile.BirthDate = &birthDate
	}

	result, err := h.service.CreateProfile(
		r.Context(),
		profile,
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

func (h *ProfileHandler) GetProfileByUserID(
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
		"/profile",
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

	profile, err := h.service.GetProfileByUserID(
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
		profile,
	)
}
