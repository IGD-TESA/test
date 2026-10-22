-- ============================================================
-- 019_create_authorization_scopes.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS authorization_scopes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    scope_type VARCHAR(50) NOT NULL,

    resource_type VARCHAR(100),

    resource_id UUID,

    parent_scope_id UUID
        REFERENCES authorization_scopes(id)
        ON DELETE CASCADE,

    name VARCHAR(200),

    description TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT authorization_scopes_scope_type_check
        CHECK (
            scope_type IN (
                'global',
                'organization',
                'project',
                'asset',
                'contract',
                'self',
                'custom'
            )
        ),

    CONSTRAINT authorization_scopes_resource_pair_check
        CHECK (
            (
                scope_type IN ('global', 'self')
                AND resource_type IS NULL
                AND resource_id IS NULL
            )
            OR
            (
                scope_type IN (
                    'organization',
                    'project',
                    'asset',
                    'contract',
                    'custom'
                )
            )
        )
);

CREATE INDEX IF NOT EXISTS idx_authorization_scopes_scope_type
    ON authorization_scopes(scope_type);

CREATE INDEX IF NOT EXISTS idx_authorization_scopes_resource
    ON authorization_scopes(resource_type, resource_id);

CREATE INDEX IF NOT EXISTS idx_authorization_scopes_parent
    ON authorization_scopes(parent_scope_id);

CREATE INDEX IF NOT EXISTS idx_authorization_scopes_active
    ON authorization_scopes(is_active);


-- ============================================================
-- Foreign-key links to scopes
-- ============================================================

ALTER TABLE authorization_user_roles
    ADD CONSTRAINT fk_authorization_user_roles_scope
    FOREIGN KEY (scope_id)
    REFERENCES authorization_scopes(id)
    ON DELETE SET NULL;

ALTER TABLE authorization_user_permission_overrides
    ADD CONSTRAINT fk_authorization_user_permission_overrides_scope
    FOREIGN KEY (scope_id)
    REFERENCES authorization_scopes(id)
    ON DELETE SET NULL;


-- ============================================================
-- Global Scope
-- ============================================================

INSERT INTO authorization_scopes
(
    scope_type,
    name,
    description
)
SELECT
    'global',
    'Ú©Ù„ Ø³Ø§Ù…Ø§Ù†Ù‡',
    'Ù…Ø­Ø¯ÙˆØ¯Ù‡ Ú©Ø§Ù…Ù„ Ø³Ø§Ù…Ø§Ù†Ù‡'
WHERE NOT EXISTS (
    SELECT 1
    FROM authorization_scopes
    WHERE scope_type = 'global'
);


-- ============================================================
-- Self Scope
-- ============================================================

INSERT INTO authorization_scopes
(
    scope_type,
    name,
    description
)
SELECT
    'self',
    'Ù…Ù†Ø§Ø¨Ø¹ Ø®ÙˆØ¯ Ú©Ø§Ø±Ø¨Ø±',
    'Ù…Ù†Ø§Ø¨Ø¹ Ù…ØªØ¹Ù„Ù‚ Ø¨Ù‡ Ø®ÙˆØ¯ Ú©Ø§Ø±Ø¨Ø±'
WHERE NOT EXISTS (
    SELECT 1
    FROM authorization_scopes
    WHERE scope_type = 'self'
);
