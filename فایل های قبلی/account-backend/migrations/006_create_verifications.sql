CREATE TABLE IF NOT EXISTS verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    verification_type VARCHAR(50) NOT NULL,

    provider VARCHAR(100) NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'pending',

    reference_id VARCHAR(255),

    verification_level VARCHAR(30),

    verified_at TIMESTAMPTZ,

    expires_at TIMESTAMPTZ,

    rejection_reason TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT verifications_type_check
        CHECK (
            verification_type IN (
                'identity',
                'contact',
                'bank',
                'document',
                'biometric',
                'legal_entity',
                'official_document'
            )
        ),

    CONSTRAINT verifications_status_check
        CHECK (
            status IN (
                'pending',
                'verified',
                'rejected',
                'failed',
                'expired',
                'manual_review'
            )
        ),

    CONSTRAINT verifications_level_check
        CHECK (
            verification_level IS NULL
            OR verification_level IN (
                'basic',
                'standard',
                'strong'
            )
        )
);

CREATE INDEX IF NOT EXISTS idx_verifications_user_id
    ON verifications(user_id);

CREATE INDEX IF NOT EXISTS idx_verifications_user_type
    ON verifications(user_id, verification_type);

CREATE INDEX IF NOT EXISTS idx_verifications_status
    ON verifications(status);

CREATE INDEX IF NOT EXISTS idx_verifications_reference_id
    ON verifications(reference_id);