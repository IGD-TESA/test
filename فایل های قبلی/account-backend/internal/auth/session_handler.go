package auth

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strings"
	"time"
)

type SessionHandler struct {
	service *SessionService
}

func NewSessionHandler(
	service *SessionService,
) *SessionHandler {
	return &SessionHandler{
		service: service,
	}
}

type RefreshRequest struct {
	RefreshToken string `json:"refresh_token"`
}

type RefreshResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
}

type SessionMessageResponse struct {
	Message string `json:"message"`
}

func (h *SessionHandler) Refresh(
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

	var request RefreshRequest

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		writeJSONError(
			w,
			http.StatusBadRequest,
			"invalid request body",
		)
		return
	}

	if request.RefreshToken == "" {
		writeJSONError(
			w,
			http.StatusBadRequest,
			"refresh_token is required",
		)
		return
	}

	accessToken,
		refreshToken,
		accessExpiresAt,
		err := h.service.Refresh(
		r.Context(),
		request.RefreshToken,
	)

	if err != nil {
		switch {
		case errors.Is(err, ErrEmptyRefreshToken):
			writeJSONError(
				w,
				http.StatusBadRequest,
				"refresh token is required",
			)

		case errors.Is(err, ErrSessionNotFound),
			errors.Is(err, ErrSessionRevoked),
			errors.Is(err, ErrSessionExpired),
			errors.Is(err, ErrInvalidToken):
			writeJSONError(
				w,
				http.StatusUnauthorized,
				"invalid refresh token",
			)

		default:
			log.Printf(
				"auth session refresh internal error: %v",
				err,
			)

			writeJSONError(
				w,
				http.StatusInternalServerError,
				"internal server error",
			)
		}

		return
	}

	expiresIn := int64(
		time.Until(accessExpiresAt).Seconds(),
	)

	if expiresIn < 0 {
		expiresIn = 0
	}

	writeJSON(
		w,
		http.StatusOK,
		RefreshResponse{
			AccessToken:  accessToken,
			RefreshToken: refreshToken,
			ExpiresIn:    expiresIn,
		},
	)
}

func (h *SessionHandler) Logout(
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

	accessToken := extractBearerToken(
		r.Header.Get("Authorization"),
	)

	if accessToken == "" {
		writeJSONError(
			w,
			http.StatusUnauthorized,
			"access token is required",
		)
		return
	}

	err := h.service.Logout(
		r.Context(),
		accessToken,
	)

	if err != nil {
		switch {
		case errors.Is(err, ErrEmptyAccessToken),
			errors.Is(err, ErrSessionNotFound),
			errors.Is(err, ErrSessionRevoked):
			writeJSONError(
				w,
				http.StatusUnauthorized,
				"invalid access token",
			)

		default:
			log.Printf(
				"auth session logout internal error: %v",
				err,
			)

			writeJSONError(
				w,
				http.StatusInternalServerError,
				"internal server error",
			)
		}

		return
	}

	writeJSON(
		w,
		http.StatusOK,
		SessionMessageResponse{
			Message: "logout successful",
		},
	)
}

func (h *SessionHandler) LogoutAllDevices(
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

	accessToken := extractBearerToken(
		r.Header.Get("Authorization"),
	)

	if accessToken == "" {
		writeJSONError(
			w,
			http.StatusUnauthorized,
			"access token is required",
		)
		return
	}

	result, err := h.service.ValidateAccessToken(
		r.Context(),
		accessToken,
	)

	if err != nil {
		switch {
		case errors.Is(err, ErrSessionNotFound),
			errors.Is(err, ErrSessionRevoked),
			errors.Is(err, ErrSessionExpired),
			errors.Is(err, ErrEmptyAccessToken):
			writeJSONError(
				w,
				http.StatusUnauthorized,
				"invalid access token",
			)

		default:
			log.Printf(
				"auth session validation internal error: %v",
				err,
			)

			writeJSONError(
				w,
				http.StatusInternalServerError,
				"internal server error",
			)
		}

		return
	}

	if result == nil ||
		result.Session == nil ||
		!result.Valid {
		writeJSONError(
			w,
			http.StatusUnauthorized,
			"invalid access token",
		)
		return
	}

	if err := h.service.LogoutAllDevices(
		r.Context(),
		result.Session.UserID,
	); err != nil {
		log.Printf(
			"auth logout all devices internal error: %v",
			err,
		)

		writeJSONError(
			w,
			http.StatusInternalServerError,
			"internal server error",
		)

		return
	}

	writeJSON(
		w,
		http.StatusOK,
		SessionMessageResponse{
			Message: "all devices logged out successfully",
		},
	)
}

func extractBearerToken(
	authorization string,
) string {
	authorization = strings.TrimSpace(authorization)

	if authorization == "" {
		return ""
	}

	const prefix = "Bearer "

	if !strings.HasPrefix(authorization, prefix) {
		return ""
	}

	return strings.TrimSpace(
		strings.TrimPrefix(authorization, prefix),
	)
}
