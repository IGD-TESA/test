package main

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"syscall"
	"time"

	"account-backend/config"
	"account-backend/infrastructure/postgres"
	redisinfra "account-backend/infrastructure/redis"
	"account-backend/internal/auth"

	"account-backend/internal/authorization"
	"account-backend/internal/user"
	"account-backend/internal/verification"
)

type Application struct {
	Config   config.Config
	Postgres *postgres.Client
	Redis    *redisinfra.Client
}

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("configuration error: %v", err)
	}

	ctx := context.Background()

	// PostgreSQL
	postgresPool, err := postgres.NewPool(
		ctx,
		cfg.PostgreSQL,
	)
	if err != nil {
		log.Fatalf(
			"PostgreSQL initialization error: %v",
			err,
		)
	}

	postgresClient := postgres.NewClient(postgresPool)

	// Redis
	redisClient, err := redisinfra.NewClient(
		ctx,
		cfg.Redis,
	)
	if err != nil {
		postgresClient.Close()

		log.Fatalf(
			"Redis initialization error: %v",
			err,
		)
	}

	redisWrapper := redisinfra.NewClientWrapper(
		redisClient,
	)

	app := &Application{
		Config:   cfg,
		Postgres: postgresClient,
		Redis:    redisWrapper,
	}

	// =========================================================
	// User Module
	// =========================================================

	userRepository := user.NewRepository(
		postgresClient,
	)

	userService := user.NewService(
		userRepository,
	)

	userHandler := user.NewHandler(
		userService,
	)

	// =========================================================
	// User Profile Module
	// =========================================================

	profileRepository := user.NewProfileRepository(
		postgresClient,
	)

	profileService := user.NewProfileService(
		profileRepository,
	)

	profileHandler := user.NewProfileHandler(
		profileService,
	)

	// =========================================================
	// Legal Entity Module
	// =========================================================

	legalEntityRepository := user.NewLegalEntityRepository(
		postgresClient,
	)

	legalEntityService := user.NewLegalEntityService(
		legalEntityRepository,
	)

	legalEntityHandler := user.NewLegalEntityHandler(
		legalEntityService,
	)

	// =========================================================
	// User Phone Module
	// =========================================================

	phoneRepository := user.NewPhoneRepository(
		postgresClient,
	)

	phoneService := user.NewPhoneService(
		phoneRepository,
	)

	phoneHandler := user.NewPhoneHandler(
		phoneService,
	)
	// =========================================================
	// =========================================================
	// User Email Module
	// =========================================================

	emailRepository := user.NewEmailRepository(
		postgresClient,
	)

	emailService := user.NewEmailService(
		emailRepository,
	)

	emailHandler := user.NewEmailHandler(
		emailService,
	)
	// =========================================================
	// Auth Module
	// =========================================================

	authRepository := auth.NewRepository(
		postgresClient,
	)

	authService := auth.NewService(
		authRepository,
	)

	// Router
	// =========================================================
	// =========================================================
	// Verification Module
	// =========================================================

	verificationRepository := verification.NewRepository(
		postgresClient,
	)

	verificationAuditRepository := verification.NewAuditRepository(
		postgresClient,
	)

	verificationProviders := verification.NewProviderManager()
	testProvider := verification.NewTestProvider()

	if err := verificationProviders.Register(
		testProvider,
	); err != nil {
		log.Fatalf(
			"Verification test provider registration error: %v",
			err,
		)
	}

	verificationCache := verification.NewCache(
		redisWrapper,
	)

	verificationProtection := verification.NewProtection(
		verificationCache,
	)

	verificationService := verification.NewService(
		verificationRepository,
		verificationProviders,
		verificationCache,
	)

	// =========================================================
	// Auth Login
	// =========================================================

	loginRepository := auth.NewLoginRepository(
		postgresClient,
	)

	trustedDeviceRepository := auth.NewTrustedDeviceRepository(
		postgresClient,
	)

	sessionRepository := auth.NewSessionRepository(
		postgresClient,
	)

	sessionService := auth.NewSessionService(
		sessionRepository,
	)

	// =========================================================
	// Authorization Module
	// =========================================================

	authorizationRepository := authorization.NewRepository(
		postgresClient,
	)

	authorizationService := authorization.NewAuthorizationService(
		authorizationRepository,
		authorizationRepository,
		authorizationRepository,
		authorizationRepository,
		authorizationRepository,
	)

	authorizationMiddleware := authorization.NewMiddleware(
		sessionService,
		authorizationService,
	)

	authorizationHandler := authorization.NewHandler()

	sessionHandler := auth.NewSessionHandler(
		sessionService,
	)

	passwordRepository := auth.NewPasswordRepository(
		postgresClient,
	)

	passwordService := auth.NewPasswordService(
		passwordRepository,
		sessionService,
	)

	passwordHandler := auth.NewPasswordHandler(
		passwordService,
	)

	passwordResetRepository := auth.NewPasswordResetRepository(
		postgresClient,
	)

	passwordResetService := auth.NewPasswordResetService(
		passwordResetRepository,
		passwordRepository,
		sessionService,
		trustedDeviceRepository,
		verificationService,
		"test-provider",
	)

	passwordResetHandler := auth.NewPasswordResetHandler(
		passwordResetService,
	)

	trustedDeviceManagementService := auth.NewTrustedDeviceManagementService(
		trustedDeviceRepository,
		sessionService,
	)

	trustedDeviceManagementHandler := auth.NewTrustedDeviceManagementHandler(
		trustedDeviceManagementService,
	)

	authAuditRepository := auth.NewAuthAuditRepository(
		postgresClient,
	)

	loginService := auth.NewLoginService(
		loginRepository,
		verificationService,
		trustedDeviceRepository,
		sessionRepository,
		authAuditRepository,
		"test-provider",
	)

	authHandler := auth.NewHandler(
		authService,
		loginService,
	)

	verificationHandler := verification.NewHandler(
		verificationService,
		verificationProtection,
		verificationAuditRepository,
	)

	mux := http.NewServeMux()
	mux.HandleFunc(
		"/api/v1/auth/register",
		authHandler.Register,
	)

	mux.HandleFunc(
		"/api/v1/auth/login",
		authHandler.Login,
	)

	mux.HandleFunc(
		"/api/v1/auth/refresh",
		sessionHandler.Refresh,
	)

	mux.HandleFunc(
		"/api/v1/auth/logout",
		sessionHandler.Logout,
	)

	mux.HandleFunc(
		"/api/v1/auth/logout-all",
		sessionHandler.LogoutAllDevices,
	)

	mux.Handle(
		"/api/v1/auth/authorization/me",
		authorizationMiddleware.RequireSelf(
			authorization.PermissionUserRead,
			http.HandlerFunc(
				authorizationHandler.Me,
			),
		),
	)

	mux.HandleFunc(
		"/api/v1/auth/devices",
		trustedDeviceManagementHandler.List,
	)

	mux.HandleFunc(
		"/api/v1/auth/devices/revoke-all",
		trustedDeviceManagementHandler.RevokeAll,
	)

	mux.HandleFunc(
		"/api/v1/auth/devices/",
		trustedDeviceManagementHandler.HandleDevice,
	)

	mux.HandleFunc(
		"/api/v1/auth/password/change",
		passwordHandler.ChangePassword,
	)

	mux.HandleFunc(
		"/api/v1/auth/password/forgot",
		passwordResetHandler.ForgotPassword,
	)

	mux.HandleFunc(
		"/api/v1/auth/password/reset",
		passwordResetHandler.ResetPassword,
	)

	mux.HandleFunc(
		"/health",
		app.healthHandler,
	)

	mux.HandleFunc(
		"/ready",
		app.readyHandler,
	)

	// Create User
	// Verification
	mux.HandleFunc(
		"/api/v1/verifications",
		verificationHandler.CreateVerification,
	)

	// Execute Verification
	mux.HandleFunc(
		"/api/v1/verifications/execute",
		verificationHandler.ExecuteVerification,
	)

	mux.HandleFunc(
		"/api/v1/verifications/",
		verificationHandler.GetVerification,
	)
	mux.HandleFunc(
		"/api/v1/users",
		userHandler.CreateUser,
	)

	// Create User Profile
	mux.HandleFunc(
		"/api/v1/users/profile",
		profileHandler.CreateProfile,
	)

	// Create User Phone
	mux.HandleFunc(
		"/api/v1/users/phone",
		phoneHandler.CreatePhone,
	)

	// Create User Email
	mux.HandleFunc(
		"/api/v1/users/email",
		emailHandler.CreateEmail,
	)
	// Create Legal Entity
	mux.HandleFunc(
		"/api/v1/users/legal-entity",
		legalEntityHandler.CreateLegalEntity,
	)
	// User and User Profile
	mux.HandleFunc(
		"/api/v1/users/",
		func(w http.ResponseWriter, r *http.Request) {

			path := strings.TrimSuffix(
				r.URL.Path,
				"/",
			)

			if strings.HasSuffix(
				path,
				"/profile",
			) {
				profileHandler.GetProfileByUserID(
					w,
					r,
				)
				return
			}

			if strings.HasSuffix(
				path,
				"/legal-entity",
			) {
				legalEntityHandler.GetLegalEntityByUserID(
					w,
					r,
				)
				return
			}

			if strings.HasSuffix(
				path,
				"/phones",
			) {
				phoneHandler.GetPhonesByUserID(
					w,
					r,
				)
				return
			}

			if strings.HasSuffix(
				path,
				"/emails",
			) {
				emailHandler.GetEmailsByUserID(
					w,
					r,
				)
				return
			}
			userHandler.GetUserByID(
				w,
				r,
			)
		},
	)

	// =========================================================
	// HTTP Server
	// =========================================================

	server := &http.Server{
		Addr: cfg.Server.Host + ":" + strconv.Itoa(
			cfg.Server.Port,
		),

		Handler: mux,

		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	go func() {
		log.Printf(
			"Account Backend started on %s",
			server.Addr,
		)

		if err := server.ListenAndServe(); err != nil &&
			!errors.Is(err, http.ErrServerClosed) {

			log.Fatalf(
				"HTTP server error: %v",
				err,
			)
		}
	}()

	// =========================================================
	// Graceful Shutdown
	// =========================================================

	stop := make(chan os.Signal, 1)

	signal.Notify(
		stop,
		os.Interrupt,
		syscall.SIGTERM,
	)

	<-stop

	log.Println("Shutdown signal received")

	shutdownContext, cancel := context.WithTimeout(
		context.Background(),
		10*time.Second,
	)
	defer cancel()

	if err := server.Shutdown(shutdownContext); err != nil {
		log.Printf(
			"HTTP server shutdown error: %v",
			err,
		)
	}

	redisWrapper.Close()
	postgresClient.Close()

	log.Println("Account Backend stopped")
}

// =============================================================
// Health
// =============================================================

func (app *Application) healthHandler(
	w http.ResponseWriter,
	r *http.Request,
) {
	writeJSON(
		w,
		http.StatusOK,
		map[string]string{
			"status":  "ok",
			"service": "account-backend",
		},
	)
}

// =============================================================
// Ready
// =============================================================

func (app *Application) readyHandler(
	w http.ResponseWriter,
	r *http.Request,
) {
	checkContext, cancel := context.WithTimeout(
		r.Context(),
		2*time.Second,
	)
	defer cancel()

	postgresStatus := "ok"
	redisStatus := "ok"

	if err := app.Postgres.Ping(checkContext); err != nil {
		postgresStatus = "error"
	}

	if err := app.Redis.Ping(checkContext); err != nil {
		redisStatus = "error"
	}

	if postgresStatus != "ok" ||
		redisStatus != "ok" {

		writeJSON(
			w,
			http.StatusServiceUnavailable,
			map[string]interface{}{
				"status":     "not_ready",
				"postgresql": postgresStatus,
				"redis":      redisStatus,
			},
		)

		return
	}

	writeJSON(
		w,
		http.StatusOK,
		map[string]interface{}{
			"status":     "ready",
			"postgresql": postgresStatus,
			"redis":      redisStatus,
		},
	)
}

// =============================================================
// JSON Response
// =============================================================

func writeJSON(
	w http.ResponseWriter,
	status int,
	data interface{},
) {
	w.Header().Set(
		"Content-Type",
		"application/json",
	)

	w.WriteHeader(status)

	if err := json.NewEncoder(w).Encode(data); err != nil {
		log.Printf(
			"failed to write JSON response: %v",
			err,
		)
	}
}
