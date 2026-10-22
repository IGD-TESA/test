CREATE TABLE IF NOT EXISTS auth_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    access_token_hash TEXT NOT NULL UNIQUE,

    refresh_token_hash TEXT NOT NULL UNIQUE,

    access_expires_at TIMESTAMPTZ NOT NULL,

    refresh_expires_at TIMESTAMPTZ NOT NULL,

    revoked_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id
    ON auth_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_access_expires
    ON auth_sessions(access_expires_at);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_refresh_expires
    ON auth_sessions(refresh_expires_at);
