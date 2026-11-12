CREATE TABLE IF NOT EXISTS verification_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    verification_id UUID
        REFERENCES verifications(id)
        ON DELETE SET NULL,

    operation VARCHAR(50) NOT NULL,

    verification_type VARCHAR(50),

    provider VARCHAR(100),

    status VARCHAR(30),

    idempotency_key VARCHAR(255),

    ip_address INET,

    user_agent TEXT,

    error_message TEXT,

    metadata JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_audits_user_id
    ON verification_audits(user_id);

CREATE INDEX IF NOT EXISTS idx_verification_audits_verification_id
    ON verification_audits(verification_id);

CREATE INDEX IF NOT EXISTS idx_verification_audits_operation
    ON verification_audits(operation);

CREATE INDEX IF NOT EXISTS idx_verification_audits_created_at
    ON verification_audits(created_at);

CREATE INDEX IF NOT EXISTS idx_verification_audits_idempotency_key
    ON verification_audits(idempotency_key);