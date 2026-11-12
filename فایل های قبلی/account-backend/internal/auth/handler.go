package auth

import (
	"encoding/json"
	"errors"
	"net/http"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
	}
}

func (h *Handler) Register(
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
			"auth service is unavailable",
		)
		return
	}

	var request RegistrationRequest

	if err := json.NewDecoder(
		r.Body,
	).Decode(&request); err != nil {
		writeJSONError(
			w,
			http.StatusBadRequest,
			"invalid request body",
		)
		return
	}

	result, err := h.service.Register(
		r.Context(),
		&request,
	)

	if err != nil {

		switch {
		case errors.Is(
			err,
			ErrNationalIDAlreadyRegistered,
		):
			writeJSONError(
				w,
				http.StatusConflict,
				err.Error(),
			)

		case errors.Is(
			err,
			ErrPhoneAlreadyRegistered,
		):
			writeJSONError(
				w,
				http.StatusConflict,
				err.Error(),
			)

		case errors.Is(
			err,
			ErrEmailAlreadyRegistered,
		):
			writeJSONError(
				w,
				http.StatusConflict,
				err.Error(),
			)

		default:
			writeJSONError(
				w,
				http.StatusBadRequest,
				err.Error(),
			)
		}

		return
	}

	writeJSON(
		w,
		http.StatusCreated,
		result,
	)
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

	_ = json.NewEncoder(
		w,
	).Encode(data)
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
