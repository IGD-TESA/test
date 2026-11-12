export type AccountUserType = 'individual' | 'legal';

export type VerificationStatus =
  | 'pending'
  | 'verified'
  | 'rejected'
  | 'failed'
  | 'expired'
  | 'manual_review';

export interface AccountProfile {
  firstName: string;
  lastName: string;
  nationalId: string;
  birthDate: string;
  fatherName: string;
  address: string;
  postalCode: string;
}

export interface AccountLegalEntity {
  legalName: string;
  nationalId: string;
  registrationNumber: string;
  economicCode: string;
  legalType: string;
  registrationDate: string;
}

export interface AccountContact {
  id: string;
  value: string;
  primary: boolean;
  verified: boolean;
}

export interface AccountDevice {
  id: string;
  name: string;
  browser: string;
  lastSeen: string;
  active: boolean;
  trusted: boolean;
}

export interface AccountSession {
  id: string;
  device: string;
  location: string;
  createdAt: string;
  lastActivity: string;
  current: boolean;
  active: boolean;
}

export interface AccountPermission {
  code: string;
  name: string;
  description: string;
  category: string;
}

export interface LocalVerificationDocument {
  id: string;
  type: string;
  fileName: string;
  selectedAt: string;
  state: 'local_only';
}

export interface AccountNotice {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export type AccountSection =
  | 'overview'
  | 'profile'
  | 'legal-entity'
  | 'contacts'
  | 'verification'
  | 'security'
  | 'devices'
  | 'sessions'
  | 'permissions'
  | 'login'
  | 'register'
  | 'recover-password';