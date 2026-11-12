-- ============================================================
-- 017_create_authorization_user_roles.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS authorization_user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    role_id UUID NOT NULL
        REFERENCES authorization_roles(id)
        ON DELETE CASCADE,

    scope_id UUID,

    assigned_by UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    expires_at TIMESTAMPTZ,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT authorization_user_roles_dates_check
        CHECK (
            expires_at IS NULL
            OR expires_at > starts_at
        )
);

CREATE INDEX IF NOT EXISTS idx_authorization_user_roles_user
    ON authorization_user_roles(user_id);

CREATE INDEX IF NOT EXISTS idx_authorization_user_roles_role
    ON authorization_user_roles(role_id);

CREATE INDEX IF NOT EXISTS idx_authorization_user_roles_scope
    ON authorization_user_roles(scope_id);

CREATE INDEX IF NOT EXISTS idx_authorization_user_roles_active
    ON authorization_user_roles(is_active);

CREATE INDEX IF NOT EXISTS idx_authorization_user_roles_expires
    ON authorization_user_roles(expires_at);
