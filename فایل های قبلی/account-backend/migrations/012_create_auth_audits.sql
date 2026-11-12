CREATE TABLE IF NOT EXISTS auth_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    operation VARCHAR(100) NOT NULL,

    status VARCHAR(50) NOT NULL,

    ip_address INET,

    user_agent TEXT,

    error_code VARCHAR(100),

    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_audits_user_id
    ON auth_audits(user_id);

CREATE INDEX IF NOT EXISTS idx_auth_audits_operation
    ON auth_audits(operation);

CREATE INDEX IF NOT EXISTS idx_auth_audits_created_at
    ON auth_audits(created_at);
