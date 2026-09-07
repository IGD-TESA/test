ALTER TABLE user_profiles
    ADD COLUMN IF NOT EXISTS father_name VARCHAR(100);

ALTER TABLE user_profiles
    ADD COLUMN IF NOT EXISTS address TEXT;

ALTER TABLE user_profiles
    ADD COLUMN IF NOT EXISTS postal_code VARCHAR(10);

CREATE INDEX IF NOT EXISTS idx_user_profiles_national_id
    ON user_profiles(national_id);

ALTER TABLE user_profiles
    ADD CONSTRAINT user_profiles_postal_code_check
    CHECK (
        postal_code IS NULL
        OR postal_code ~ '^[0-9]{10}$'
    );