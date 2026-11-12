package user

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"
)

type LegalEntityHandler struct {
	service *LegalEntityService
}

func NewLegalEntityHandler(
	service *LegalEntityService,
) *LegalEntityHandler {
	return &LegalEntityHandler{
		service: service,
	}
}

type createLegalEntityRequest struct {
	UserID             string `json:"user_id"`
	LegalName          string `json:"legal_name"`
	NationalID         string `json:"national_id"`
	RegistrationNumber string `json:"registration_number"`
	EconomicCode       string `json:"economic_code"`
	LegalType          string `json:"legal_type"`
	RegistrationDate   string `json:"registration_date"`
}

func (h *LegalEntityHandler) CreateLegalEntity(
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

	var request createLegalEntityRequest

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

	entity := &LegalEntity{
		UserID:     request.UserID,
		LegalName:  request.LegalName,
		NationalID: request.NationalID,
	}

	if request.RegistrationNumber != "" {
		entity.RegistrationNumber =
			&request.RegistrationNumber
	}

	if request.EconomicCode != "" {
		entity.EconomicCode =
			&request.EconomicCode
	}

	if request.LegalType != "" {
		entity.LegalType =
			&request.LegalType
	}

	if request.RegistrationDate != "" {
		registrationDate, err := time.Parse(
			"2006-01-02",
			request.RegistrationDate,
		)

		if err != nil {
			writeJSON(
				w,
				http.StatusBadRequest,
				map[string]string{
					"error": "registration_date must be in YYYY-MM-DD format",
				},
			)
			return
		}

		entity.RegistrationDate = &registrationDate
	}

	result, err := h.service.CreateLegalEntity(
		r.Context(),
		entity,
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

func (h *LegalEntityHandler) GetLegalEntityByUserID(
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
		"/legal-entity",
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

	entity, err := h.service.GetLegalEntityByUserID(
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
		entity,
	)
}
