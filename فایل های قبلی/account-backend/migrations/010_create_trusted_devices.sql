CREATE TABLE IF NOT EXISTS trusted_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    device_name VARCHAR(150),

    token_hash TEXT NOT NULL UNIQUE,

    expires_at TIMESTAMPTZ NOT NULL,

    last_used_at TIMESTAMPTZ,

    revoked_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trusted_devices_user_id
    ON trusted_devices(user_id);

CREATE INDEX IF NOT EXISTS idx_trusted_devices_expires_at
    ON trusted_devices(expires_at);

CREATE INDEX IF NOT EXISTS idx_trusted_devices_active
    ON trusted_devices(user_id, expires_at)
    WHERE revoked_at IS NULL;
