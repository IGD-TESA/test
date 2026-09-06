CREATE TABLE legal_entities (
    user_id UUID PRIMARY KEY,

    legal_name VARCHAR(255) NOT NULL,

    national_id VARCHAR(20) NOT NULL UNIQUE,

    registration_number VARCHAR(50) UNIQUE,

    economic_code VARCHAR(50) UNIQUE,

    legal_type VARCHAR(50),

    registration_date DATE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT legal_entities_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);