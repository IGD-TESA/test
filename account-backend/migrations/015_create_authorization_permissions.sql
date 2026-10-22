-- ============================================================
-- 015_create_authorization_permissions.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS authorization_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    code VARCHAR(150) NOT NULL UNIQUE,

    resource VARCHAR(100) NOT NULL,

    action VARCHAR(100) NOT NULL,

    name VARCHAR(150) NOT NULL,

    description TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT authorization_permissions_resource_action_unique
        UNIQUE (resource, action)
);

CREATE INDEX IF NOT EXISTS idx_authorization_permissions_resource
    ON authorization_permissions(resource);

CREATE INDEX IF NOT EXISTS idx_authorization_permissions_action
    ON authorization_permissions(action);

CREATE INDEX IF NOT EXISTS idx_authorization_permissions_active
    ON authorization_permissions(is_active);


-- ============================================================
-- Seed: Core Permissions
-- ============================================================

INSERT INTO authorization_permissions
(
    code,
    resource,
    action,
    name,
    description
)
VALUES

-- User
(
    'user.read',
    'user',
    'read',
    'Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ú©Ø§Ø±Ø¨Ø±',
    'Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ø§Ø·Ù„Ø§Ø¹Ø§Øª Ú©Ø§Ø±Ø¨Ø±'
),
(
    'user.update',
    'user',
    'update',
    'ÙˆÛŒØ±Ø§ÛŒØ´ Ú©Ø§Ø±Ø¨Ø±',
    'ÙˆÛŒØ±Ø§ÛŒØ´ Ø§Ø·Ù„Ø§Ø¹Ø§Øª Ú©Ø§Ø±Ø¨Ø±'
),

-- Profile
(
    'profile.read',
    'profile',
    'read',
    'Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ù…Ø´Ø®ØµØ§Øª',
    'Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ø§Ø·Ù„Ø§Ø¹Ø§Øª ØªÚ©Ù…ÛŒÙ„ÛŒ Ú©Ø§Ø±Ø¨Ø±'
),
(
    'profile.update',
    'profile',
    'update',
    'ÙˆÛŒØ±Ø§ÛŒØ´ Ù…Ø´Ø®ØµØ§Øª',
    'ÙˆÛŒØ±Ø§ÛŒØ´ Ø§Ø·Ù„Ø§Ø¹Ø§Øª ØªÚ©Ù…ÛŒÙ„ÛŒ Ú©Ø§Ø±Ø¨Ø±'
),

-- Legal Entity
(
    'legal_entity.read',
    'legal_entity',
    'read',
    'Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ø´Ø®Øµ Ø­Ù‚ÙˆÙ‚ÛŒ',
    'Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ø§Ø·Ù„Ø§Ø¹Ø§Øª Ø´Ø®Øµ Ø­Ù‚ÙˆÙ‚ÛŒ'
),
(
    'legal_entity.update',
    'legal_entity',
    'update',
    'ÙˆÛŒØ±Ø§ÛŒØ´ Ø´Ø®Øµ Ø­Ù‚ÙˆÙ‚ÛŒ',
    'ÙˆÛŒØ±Ø§ÛŒØ´ Ø§Ø·Ù„Ø§Ø¹Ø§Øª Ø´Ø®Øµ Ø­Ù‚ÙˆÙ‚ÛŒ'
),

-- Bank Account
(
    'bank_account.read',
    'bank_account',
    'read',
    'Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ø­Ø³Ø§Ø¨ Ø¨Ø§Ù†Ú©ÛŒ',
    'Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ø­Ø³Ø§Ø¨ Ø¨Ø§Ù†Ú©ÛŒ'
),
(
    'bank_account.add',
    'bank_account',
    'add',
    'Ø§ÙØ²ÙˆØ¯Ù† Ø­Ø³Ø§Ø¨ Ø¨Ø§Ù†Ú©ÛŒ',
    'Ø§ÙØ²ÙˆØ¯Ù† Ø­Ø³Ø§Ø¨ Ø¨Ø§Ù†Ú©ÛŒ'
),
(
    'bank_account.update',
    'bank_account',
    'update',
    'ÙˆÛŒØ±Ø§ÛŒØ´ Ø­Ø³Ø§Ø¨ Ø¨Ø§Ù†Ú©ÛŒ',
    'ÙˆÛŒØ±Ø§ÛŒØ´ Ø­Ø³Ø§Ø¨ Ø¨Ø§Ù†Ú©ÛŒ'
),
(
    'bank_account.verify',
    'bank_account',
    'verify',
    'ØªØ£ÛŒÛŒØ¯ Ø­Ø³Ø§Ø¨ Ø¨Ø§Ù†Ú©ÛŒ',
    'ØªØ£ÛŒÛŒØ¯ Ùˆ Ø§Ø¹ØªØ¨Ø§Ø±Ø³Ù†Ø¬ÛŒ Ø­Ø³Ø§Ø¨ Ø¨Ø§Ù†Ú©ÛŒ'
),

-- Project
(
    'project.read',
    'project',
    'read',
    'Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ù¾Ø±ÙˆÚ˜Ù‡',
    'Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ø§Ø·Ù„Ø§Ø¹Ø§Øª Ù¾Ø±ÙˆÚ˜Ù‡'
),
(
    'project.create',
    'project',
    'create',
    'Ø§ÛŒØ¬Ø§Ø¯ Ù¾Ø±ÙˆÚ˜Ù‡',
    'Ø§ÛŒØ¬Ø§Ø¯ Ù¾Ø±ÙˆÚ˜Ù‡ Ø¬Ø¯ÛŒØ¯'
),
(
    'project.update',
    'project',
    'update',
    'ÙˆÛŒØ±Ø§ÛŒØ´ Ù¾Ø±ÙˆÚ˜Ù‡',
    'ÙˆÛŒØ±Ø§ÛŒØ´ Ù¾Ø±ÙˆÚ˜Ù‡'
),
(
    'project.delete',
    'project',
    'delete',
    'Ø­Ø°Ù Ù¾Ø±ÙˆÚ˜Ù‡',
    'Ø­Ø°Ù Ù¾Ø±ÙˆÚ˜Ù‡'
),

-- Project Member
(
    'project_member.read',
    'project_member',
    'read',
    'Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ø§Ø¹Ø¶Ø§ÛŒ Ù¾Ø±ÙˆÚ˜Ù‡',
    'Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ø§Ø¹Ø¶Ø§ÛŒ Ù¾Ø±ÙˆÚ˜Ù‡'
),
(
    'project_member.add',
    'project_member',
    'add',
    'Ø§ÙØ²ÙˆØ¯Ù† Ø¹Ø¶Ùˆ Ù¾Ø±ÙˆÚ˜Ù‡',
    'Ø§ÙØ²ÙˆØ¯Ù† Ø¹Ø¶Ùˆ Ø¨Ù‡ Ù¾Ø±ÙˆÚ˜Ù‡'
),
(
    'project_member.update',
    'project_member',
    'update',
    'ÙˆÛŒØ±Ø§ÛŒØ´ Ø¹Ø¶Ùˆ Ù¾Ø±ÙˆÚ˜Ù‡',
    'ÙˆÛŒØ±Ø§ÛŒØ´ Ø¯Ø³ØªØ±Ø³ÛŒ ÛŒØ§ Ù…Ø´Ø®ØµØ§Øª Ø¹Ø¶Ùˆ Ù¾Ø±ÙˆÚ˜Ù‡'
),
(
    'project_member.remove',
    'project_member',
    'remove',
    'Ø­Ø°Ù Ø¹Ø¶Ùˆ Ù¾Ø±ÙˆÚ˜Ù‡',
    'Ø­Ø°Ù Ø¹Ø¶Ùˆ Ø§Ø² Ù¾Ø±ÙˆÚ˜Ù‡'
),

-- Market
(
    'market.read',
    'market',
    'read',
    'Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ø¨Ø§Ø²Ø§Ø±',
    'Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ø¨Ø§Ø²Ø§Ø± Ú©Ù„ÛŒ'
),

-- Offer
(
    'offer.read',
    'offer',
    'read',
    'Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ø¹Ø±Ø¶Ù‡',
    'Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ø§Ø·Ù„Ø§Ø¹Ø§Øª Ø¹Ø±Ø¶Ù‡'
),
(
    'offer.create',
    'offer',
    'create',
    'Ø§ÛŒØ¬Ø§Ø¯ Ø¹Ø±Ø¶Ù‡',
    'Ø§ÛŒØ¬Ø§Ø¯ Ø¹Ø±Ø¶Ù‡ Ø¬Ø¯ÛŒØ¯'
),
(
    'offer.update',
    'offer',
    'update',
    'ÙˆÛŒØ±Ø§ÛŒØ´ Ø¹Ø±Ø¶Ù‡',
    'ÙˆÛŒØ±Ø§ÛŒØ´ Ø¹Ø±Ø¶Ù‡'
),
(
    'offer.activate',
    'offer',
    'activate',
    'ÙØ¹Ø§Ù„â€ŒØ³Ø§Ø²ÛŒ Ø¹Ø±Ø¶Ù‡',
    'ÙØ¹Ø§Ù„ Ú©Ø±Ø¯Ù† Ø¹Ø±Ø¶Ù‡'
),
(
    'offer.deactivate',
    'offer',
    'deactivate',
    'ØºÛŒØ±ÙØ¹Ø§Ù„â€ŒØ³Ø§Ø²ÛŒ Ø¹Ø±Ø¶Ù‡',
    'ØºÛŒØ±ÙØ¹Ø§Ù„ Ú©Ø±Ø¯Ù† Ø¹Ø±Ø¶Ù‡'
),

-- Order
(
    'order.read',
    'order',
    'read',
    'Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ø³ÙØ§Ø±Ø´',
    'Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ø³ÙØ§Ø±Ø´'
),
(
    'order.create',
    'order',
    'create',
    'Ø§ÛŒØ¬Ø§Ø¯ Ø³ÙØ§Ø±Ø´',
    'Ø§ÛŒØ¬Ø§Ø¯ Ø³ÙØ§Ø±Ø´ Ø®Ø±ÛŒØ¯ ÛŒØ§ ÙØ±ÙˆØ´'
),
(
    'order.cancel',
    'order',
    'cancel',
    'Ù„ØºÙˆ Ø³ÙØ§Ø±Ø´',
    'Ù„ØºÙˆ Ø³ÙØ§Ø±Ø´'
),

-- Contract
(
    'contract.read',
    'contract',
    'read',
    'Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯',
    'Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯'
),
(
    'contract.sign',
    'contract',
    'sign',
    'Ø§Ù…Ø¶Ø§ÛŒ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯',
    'Ø§Ù…Ø¶Ø§ÛŒ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯'
),

-- Contractual Right
(
    'contractual_right.read',
    'contractual_right',
    'read',
    'Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ø­Ù‚ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ÛŒ',
    'Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ø­Ù‚ÙˆÙ‚ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ÛŒ'
),
(
    'contractual_right.purchase',
    'contractual_right',
    'purchase',
    'Ø®Ø±ÛŒØ¯ Ø­Ù‚ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ÛŒ',
    'Ø®Ø±ÛŒØ¯ Ø­Ù‚ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ÛŒ'
),
(
    'contractual_right.transfer',
    'contractual_right',
    'transfer',
    'Ø§Ù†ØªÙ‚Ø§Ù„ Ø­Ù‚ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ÛŒ',
    'Ø§Ù†ØªÙ‚Ø§Ù„ Ø­Ù‚ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ÛŒ'
),

-- Wallet
(
    'wallet.read',
    'wallet',
    'read',
    'Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ú©ÛŒÙ Ù¾ÙˆÙ„',
    'Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ù…ÙˆØ¬ÙˆØ¯ÛŒ Ùˆ ÙˆØ¶Ø¹ÛŒØª Ú©ÛŒÙ Ù¾ÙˆÙ„'
),

-- Payment
(
    'payment.read',
    'payment',
    'read',
    'Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ù¾Ø±Ø¯Ø§Ø®Øª',
    'Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ù¾Ø±Ø¯Ø§Ø®Øªâ€ŒÙ‡Ø§'
),
(
    'payment.create',
    'payment',
    'create',
    'Ø§ÛŒØ¬Ø§Ø¯ Ù¾Ø±Ø¯Ø§Ø®Øª',
    'Ø§ÛŒØ¬Ø§Ø¯ Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ù¾Ø±Ø¯Ø§Ø®Øª'
),

-- Transaction
(
    'transaction.read',
    'transaction',
    'read',
    'Ù…Ø´Ø§Ù‡Ø¯Ù‡ ØªØ±Ø§Ú©Ù†Ø´',
    'Ù…Ø´Ø§Ù‡Ø¯Ù‡ ØªØ±Ø§Ú©Ù†Ø´'
),

-- Verification
(
    'verification.read',
    'verification',
    'read',
    'Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ø§Ø­Ø±Ø§Ø²',
    'Ù…Ø´Ø§Ù‡Ø¯Ù‡ ÙˆØ¶Ø¹ÛŒØª Ø§Ø­Ø±Ø§Ø²'
),
(
    'verification.request',
    'verification',
    'request',
    'Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ø§Ø­Ø±Ø§Ø²',
    'Ø§ÛŒØ¬Ø§Ø¯ Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ø§Ø­Ø±Ø§Ø²'
)

ON CONFLICT (code) DO NOTHING;
