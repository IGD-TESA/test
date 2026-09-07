CREATE TABLE IF NOT EXISTS auth_credentials (
    user_id UUID PRIMARY KEY
        REFERENCES users(id)
        ON DELETE CASCADE,

    password_hash TEXT NOT NULL,

    password_changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    failed_login_attempts INTEGER NOT NULL DEFAULT 0,

    locked_until TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_credentials_locked_until
    ON auth_credentials(locked_until);