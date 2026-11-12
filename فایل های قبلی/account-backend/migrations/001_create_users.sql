CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_type VARCHAR(20) NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'active',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT users_user_type_check
        CHECK (user_type IN ('individual', 'legal')),

    CONSTRAINT users_status_check
        CHECK (status IN (
            'active',
            'limited',
            'suspended',
            'blocked',
            'closed'
        ))
);