-- ============================================================
-- 014_create_authorization_roles.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS authorization_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    code VARCHAR(100) NOT NULL UNIQUE,

    name VARCHAR(150) NOT NULL,

    role_type VARCHAR(50) NOT NULL,

    default_scope_type VARCHAR(50) NOT NULL,

    description TEXT,

    is_system_role BOOLEAN NOT NULL DEFAULT FALSE,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT authorization_roles_role_type_check
        CHECK (
            role_type IN (
                'management',
                'operational',
                'base',
                'specialized',
                'general',
                'supervisory'
            )
        ),

    CONSTRAINT authorization_roles_scope_type_check
        CHECK (
            default_scope_type IN (
                'global',
                'self',
                'organization',
                'project',
                'asset',
                'contract',
                'custom'
            )
        )
);

CREATE INDEX IF NOT EXISTS idx_authorization_roles_role_type
    ON authorization_roles(role_type);

CREATE INDEX IF NOT EXISTS idx_authorization_roles_scope_type
    ON authorization_roles(default_scope_type);

CREATE INDEX IF NOT EXISTS idx_authorization_roles_active
    ON authorization_roles(is_active);


-- ============================================================
-- Seed: System Roles
-- ============================================================

INSERT INTO authorization_roles
(
    code,
    name,
    role_type,
    default_scope_type,
    description,
    is_system_role
)
VALUES
(
    'system_admin',
    'Ù…Ø¯ÛŒØ± Ø³Ø§Ù…Ø§Ù†Ù‡',
    'management',
    'global',
    'Ù…Ø¯ÛŒØ±ÛŒØª Ú©Ù„ Ø³Ø§Ù…Ø§Ù†Ù‡ Ùˆ Ú©Ù†ØªØ±Ù„ Ø¯Ø³ØªØ±Ø³ÛŒâ€ŒÙ‡Ø§',
    TRUE
),
(
    'project_manager',
    'Ù…Ø¯ÛŒØ± Ù¾Ø±ÙˆÚ˜Ù‡',
    'operational',
    'project',
    'Ù…Ø¯ÛŒØ±ÛŒØª Ù¾Ø±ÙˆÚ˜Ù‡ Ø¯Ø± Ù…Ø­Ø¯ÙˆØ¯Ù‡ Ù¾Ø±ÙˆÚ˜Ù‡â€ŒÙ‡Ø§ÛŒ ØªØ¹ÛŒÛŒÙ†â€ŒØ´Ø¯Ù‡',
    TRUE
),
(
    'user',
    'Ú©Ø§Ø±Ø¨Ø±',
    'base',
    'self',
    'Ú©Ø§Ø±Ø¨Ø± Ø§ØµÙ„ÛŒ Ø³Ø§Ù…Ø§Ù†Ù‡ Ùˆ Ø¯Ø§Ø±Ù†Ø¯Ù‡ Ø­Ù‚ÙˆÙ‚ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ÛŒ',
    TRUE
),
(
    'financial_manager',
    'Ù…Ø¯ÛŒØ± Ù…Ø§Ù„ÛŒ',
    'specialized',
    'organization',
    'Ù…Ø¯ÛŒØ±ÛŒØª Ø§Ù…ÙˆØ± Ù…Ø§Ù„ÛŒØŒ Ù…ÙˆØ¬ÙˆØ¯ÛŒØŒ Ù¾Ø±Ø¯Ø§Ø®Øª Ùˆ ØªØ³ÙˆÛŒÙ‡',
    TRUE
),
(
    'financial_specialist',
    'Ú©Ø§Ø±Ø´Ù†Ø§Ø³ Ù…Ø§Ù„ÛŒ',
    'specialized',
    'custom',
    'Ø§Ù†Ø¬Ø§Ù… Ø¹Ù…Ù„ÛŒØ§Øª Ø±ÙˆØ²Ù…Ø±Ù‡ Ù…Ø§Ù„ÛŒ Ø¯Ø± Ù…Ø­Ø¯ÙˆØ¯Ù‡ ØªØ¹ÛŒÛŒÙ†â€ŒØ´Ø¯Ù‡',
    TRUE
),
(
    'contract_manager',
    'Ù…Ø¯ÛŒØ± Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯Ù‡Ø§',
    'specialized',
    'organization',
    'Ù…Ø¯ÛŒØ±ÛŒØª Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯Ù‡Ø§ Ùˆ Ø­Ù‚ÙˆÙ‚ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ÛŒ',
    TRUE
),
(
    'contract_specialist',
    'Ú©Ø§Ø±Ø´Ù†Ø§Ø³ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯Ù‡Ø§',
    'specialized',
    'custom',
    'Ø«Ø¨Øª Ùˆ Ø¨Ø±Ø±Ø³ÛŒ Ø¹Ù…Ù„ÛŒØ§Øª Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ÛŒ Ø¯Ø± Ù…Ø­Ø¯ÙˆØ¯Ù‡ ØªØ¹ÛŒÛŒÙ†â€ŒØ´Ø¯Ù‡',
    TRUE
),
(
    'legal_supervisor',
    'Ù†Ø§Ø¸Ø± Ø­Ù‚ÙˆÙ‚ÛŒ',
    'supervisory',
    'custom',
    'Ù†Ø¸Ø§Ø±Øª Ø­Ù‚ÙˆÙ‚ÛŒ Ø¨Ø± Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯Ù‡Ø§ Ùˆ Ù¾Ø±ÙˆÚ˜Ù‡â€ŒÙ‡Ø§',
    TRUE
),
(
    'asset_manager',
    'Ù…Ø¯ÛŒØ± Ø¯Ø§Ø±Ø§ÛŒÛŒ',
    'specialized',
    'asset',
    'Ù…Ø¯ÛŒØ±ÛŒØª Ø¹Ù…Ù„ÛŒØ§ØªÛŒ Ø¯Ø§Ø±Ø§ÛŒÛŒâ€ŒÙ‡Ø§ Ø¯Ø± Ù…Ø­Ø¯ÙˆØ¯Ù‡ ØªØ¹ÛŒÛŒÙ†â€ŒØ´Ø¯Ù‡',
    TRUE
),
(
    'specialist',
    'Ú©Ø§Ø±Ø´Ù†Ø§Ø³',
    'general',
    'custom',
    'Ù†Ù‚Ø´ Ø¹Ù…ÙˆÙ…ÛŒ ØªØ®ØµØµÛŒ Ø¨Ø§ Ø¯Ø³ØªØ±Ø³ÛŒ ØªØ¹Ø±ÛŒÙâ€ŒØ´Ø¯Ù‡',
    TRUE
),
(
    'support',
    'Ù¾Ø´ØªÛŒØ¨Ø§Ù†',
    'operational',
    'self',
    'Ù¾Ø´ØªÛŒØ¨Ø§Ù†ÛŒ Ùˆ Ø±Ø³ÛŒØ¯Ú¯ÛŒ Ø¨Ù‡ Ø­Ø³Ø§Ø¨ Ú©Ø§Ø±Ø¨Ø±Ø§Ù†',
    TRUE
),
(
    'system_supervisor',
    'Ù†Ø§Ø¸Ø± Ø³Ø§Ù…Ø§Ù†Ù‡',
    'supervisory',
    'global',
    'Ù†Ø¸Ø§Ø±Øª Ø¹Ù…Ø¯ØªØ§Ù‹ Ù…Ø´Ø§Ù‡Ø¯Ù‡â€ŒØ§ÛŒ Ø¨Ø± Ø³Ø§Ù…Ø§Ù†Ù‡',
    TRUE
),
(
    'auditor',
    'Ø­Ø³Ø§Ø¨Ø±Ø³',
    'supervisory',
    'custom',
    'Ø¯Ø³ØªØ±Ø³ÛŒ Ù…Ø´Ø§Ù‡Ø¯Ù‡â€ŒØ§ÛŒ Ø¨Ù‡ Ø³ÙˆØ§Ø¨Ù‚ Ù…Ø§Ù„ÛŒ Ùˆ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ÛŒ',
    TRUE
),
(
    'inspector',
    'Ø¨Ø§Ø²Ø±Ø³',
    'supervisory',
    'custom',
    'Ù†Ø¸Ø§Ø±Øª Ùˆ Ø¨Ø§Ø²Ø±Ø³ÛŒ Ø¯Ø± Ù…Ø­Ø¯ÙˆØ¯Ù‡ ØªØ¹ÛŒÛŒÙ†â€ŒØ´Ø¯Ù‡',
    TRUE
)
ON CONFLICT (code) DO NOTHING;
