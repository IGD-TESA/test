CREATE TABLE user_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    email VARCHAR(320) NOT NULL,

    is_primary BOOLEAN NOT NULL DEFAULT FALSE,

    is_verified BOOLEAN NOT NULL DEFAULT FALSE,

    verified_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT user_emails_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_user_emails_user_id
    ON user_emails(user_id);

CREATE UNIQUE INDEX idx_user_emails_unique_email
    ON user_emails(email);

CREATE UNIQUE INDEX idx_user_emails_primary
    ON user_emails(user_id)
    WHERE is_primary = TRUE;