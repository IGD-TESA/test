-- ============================================================
-- 018_create_authorization_user_permission_overrides.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS authorization_user_permission_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    permission_id UUID NOT NULL
        REFERENCES authorization_permissions(id)
        ON DELETE CASCADE,

    effect VARCHAR(10) NOT NULL,

    scope_id UUID,

    assigned_by UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    expires_at TIMESTAMPTZ,

    reason TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT authorization_user_permission_overrides_effect_check
        CHECK (
            effect IN (
                'allow',
                'deny'
            )
        ),

    CONSTRAINT authorization_user_permission_overrides_dates_check
        CHECK (
            expires_at IS NULL
            OR expires_at > starts_at
        )
);

CREATE INDEX IF NOT EXISTS idx_authorization_user_permission_overrides_user
    ON authorization_user_permission_overrides(user_id);

CREATE INDEX IF NOT EXISTS idx_authorization_user_permission_overrides_permission
    ON authorization_user_permission_overrides(permission_id);

CREATE INDEX IF NOT EXISTS idx_authorization_user_permission_overrides_scope
    ON authorization_user_permission_overrides(scope_id);

CREATE INDEX IF NOT EXISTS idx_authorization_user_permission_overrides_effect
    ON authorization_user_permission_overrides(effect);

CREATE INDEX IF NOT EXISTS idx_authorization_user_permission_overrides_active
    ON authorization_user_permission_overrides(is_active);

CREATE INDEX IF NOT EXISTS idx_authorization_user_permission_overrides_expires
    ON authorization_user_permission_overrides(expires_at);
