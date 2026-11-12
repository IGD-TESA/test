CREATE TABLE user_phones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    phone_number VARCHAR(20) NOT NULL,

    is_primary BOOLEAN NOT NULL DEFAULT FALSE,

    is_verified BOOLEAN NOT NULL DEFAULT FALSE,

    verified_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT user_phones_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_user_phones_user_id
    ON user_phones(user_id);

CREATE UNIQUE INDEX idx_user_phones_unique_number
    ON user_phones(phone_number);

CREATE UNIQUE INDEX idx_user_phones_primary
    ON user_phones(user_id)
    WHERE is_primary = TRUE;