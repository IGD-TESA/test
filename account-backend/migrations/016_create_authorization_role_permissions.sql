-- ============================================================
-- 016_create_authorization_role_permissions.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS authorization_role_permissions (
    role_id UUID NOT NULL
        REFERENCES authorization_roles(id)
        ON DELETE CASCADE,

    permission_id UUID NOT NULL
        REFERENCES authorization_permissions(id)
        ON DELETE CASCADE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (role_id, permission_id)
);

CREATE INDEX IF NOT EXISTS idx_authorization_role_permissions_permission
    ON authorization_role_permissions(permission_id);


-- ============================================================
-- Seed: User Role
-- ============================================================

INSERT INTO authorization_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM authorization_roles r
CROSS JOIN authorization_permissions p
WHERE r.code = 'user'
  AND p.code IN (
      'user.read',
      'user.update',
      'profile.read',
      'profile.update',
      'bank_account.read',
      'bank_account.add',
      'bank_account.update',
      'market.read',
      'offer.read',
      'order.read',
      'order.create',
      'order.cancel',
      'contract.read',
      'contract.sign',
      'contractual_right.read',
      'contractual_right.purchase',
      'contractual_right.transfer',
      'wallet.read',
      'payment.read',
      'payment.create',
      'transaction.read',
      'verification.read',
      'verification.request'
  )
ON CONFLICT DO NOTHING;


-- ============================================================
-- Seed: Project Manager
-- ============================================================

INSERT INTO authorization_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM authorization_roles r
CROSS JOIN authorization_permissions p
WHERE r.code = 'project_manager'
  AND p.code IN (
      'user.read',
      'profile.read',
      'market.read',

      'project.read',
      'project.create',
      'project.update',
      'project_member.read',
      'project_member.add',
      'project_member.update',
      'project_member.remove',

      'offer.read',
      'offer.create',
      'offer.update',
      'offer.activate',
      'offer.deactivate',

      'contract.read',
      'contractual_right.read',

      'transaction.read',
      'verification.read'
  )
ON CONFLICT DO NOTHING;


-- ============================================================
-- Seed: Financial Manager
-- ============================================================

INSERT INTO authorization_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM authorization_roles r
CROSS JOIN authorization_permissions p
WHERE r.code = 'financial_manager'
  AND p.code IN (
      'user.read',
      'profile.read',
      'bank_account.read',
      'bank_account.verify',
      'wallet.read',
      'payment.read',
      'payment.create',
      'transaction.read'
  )
ON CONFLICT DO NOTHING;


-- ============================================================
-- Seed: Financial Specialist
-- ============================================================

INSERT INTO authorization_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM authorization_roles r
CROSS JOIN authorization_permissions p
WHERE r.code = 'financial_specialist'
  AND p.code IN (
      'user.read',
      'profile.read',
      'bank_account.read',
      'wallet.read',
      'payment.read',
      'payment.create',
      'transaction.read'
  )
ON CONFLICT DO NOTHING;


-- ============================================================
-- Seed: Contract Manager
-- ============================================================

INSERT INTO authorization_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM authorization_roles r
CROSS JOIN authorization_permissions p
WHERE r.code = 'contract_manager'
  AND p.code IN (
      'user.read',
      'profile.read',
      'contract.read',
      'contract.sign',
      'contractual_right.read',
      'contractual_right.transfer',
      'transaction.read'
  )
ON CONFLICT DO NOTHING;


-- ============================================================
-- Seed: Contract Specialist
-- ============================================================

INSERT INTO authorization_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM authorization_roles r
CROSS JOIN authorization_permissions p
WHERE r.code = 'contract_specialist'
  AND p.code IN (
      'user.read',
      'profile.read',
      'contract.read',
      'contractual_right.read',
      'transaction.read'
  )
ON CONFLICT DO NOTHING;


-- ============================================================
-- Seed: Legal Supervisor
-- ============================================================

INSERT INTO authorization_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM authorization_roles r
CROSS JOIN authorization_permissions p
WHERE r.code = 'legal_supervisor'
  AND p.code IN (
      'project.read',
      'offer.read',
      'contract.read',
      'contractual_right.read',
      'transaction.read'
  )
ON CONFLICT DO NOTHING;


-- ============================================================
-- Seed: Asset Manager
-- ============================================================

INSERT INTO authorization_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM authorization_roles r
CROSS JOIN authorization_permissions p
WHERE r.code = 'asset_manager'
  AND p.code IN (
      'project.read',
      'project.update',
      'offer.read',
      'offer.update',
      'contractual_right.read',
      'transaction.read'
  )
ON CONFLICT DO NOTHING;


-- ============================================================
-- Seed: Specialist
-- ============================================================

INSERT INTO authorization_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM authorization_roles r
CROSS JOIN authorization_permissions p
WHERE r.code = 'specialist'
  AND p.code IN (
      'user.read',
      'profile.read',
      'project.read',
      'offer.read',
      'contract.read',
      'contractual_right.read',
      'transaction.read',
      'verification.read'
  )
ON CONFLICT DO NOTHING;


-- ============================================================
-- Seed: Support
-- ============================================================

INSERT INTO authorization_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM authorization_roles r
CROSS JOIN authorization_permissions p
WHERE r.code = 'support'
  AND p.code IN (
      'user.read',
      'profile.read',
      'legal_entity.read',
      'bank_account.read',
      'verification.read',
      'contract.read',
      'order.read',
      'transaction.read'
  )
ON CONFLICT DO NOTHING;


-- ============================================================
-- Seed: System Supervisor
-- ============================================================

INSERT INTO authorization_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM authorization_roles r
CROSS JOIN authorization_permissions p
WHERE r.code = 'system_supervisor'
  AND p.code IN (
      'user.read',
      'profile.read',
      'legal_entity.read',
      'bank_account.read',
      'project.read',
      'project_member.read',
      'market.read',
      'offer.read',
      'order.read',
      'contract.read',
      'contractual_right.read',
      'wallet.read',
      'payment.read',
      'transaction.read',
      'verification.read'
  )
ON CONFLICT DO NOTHING;


-- ============================================================
-- Seed: Auditor
-- ============================================================

INSERT INTO authorization_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM authorization_roles r
CROSS JOIN authorization_permissions p
WHERE r.code = 'auditor'
  AND p.code IN (
      'bank_account.read',
      'wallet.read',
      'payment.read',
      'transaction.read',
      'contract.read',
      'contractual_right.read',
      'order.read'
  )
ON CONFLICT DO NOTHING;


-- ============================================================
-- Seed: Inspector
-- ============================================================

INSERT INTO authorization_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM authorization_roles r
CROSS JOIN authorization_permissions p
WHERE r.code = 'inspector'
  AND p.code IN (
      'user.read',
      'profile.read',
      'project.read',
      'project_member.read',
      'market.read',
      'offer.read',
      'order.read',
      'contract.read',
      'contractual_right.read',
      'wallet.read',
      'payment.read',
      'transaction.read',
      'verification.read'
  )
ON CONFLICT DO NOTHING;


-- ============================================================
-- Seed: System Admin
-- ============================================================
-- Ù…Ø¯ÛŒØ± Ø³Ø§Ù…Ø§Ù†Ù‡ Ù…Ø¬ÙˆØ²Ù‡Ø§ÛŒ ÙØ¹Ù„ÛŒ Ø±Ø§ Ø§Ø² Ù‡Ù…Ø§Ù† Ø³ÛŒØ³ØªÙ… Permission Ø¯Ø±ÛŒØ§ÙØª Ù…ÛŒâ€ŒÚ©Ù†Ø¯.
-- Ø¯Ø± Ø§ÛŒÙ† Ù…Ø±Ø­Ù„Ù‡ ØªÙ…Ø§Ù… PermissionÙ‡Ø§ÛŒ ÙØ¹Ø§Ù„ Ø¨Ù‡ Ø¢Ù† Ø§Ø®ØªØµØ§Øµ Ø¯Ø§Ø¯Ù‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯.

INSERT INTO authorization_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM authorization_roles r
CROSS JOIN authorization_permissions p
WHERE r.code = 'system_admin'
  AND p.is_active = TRUE
ON CONFLICT DO NOTHING;
