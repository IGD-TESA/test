/**
 * Shared technical types for the Account frontend feature.
 *
 * Backend response DTOs are intentionally not assumed here.
 * Add concrete response models only after verifying backend contracts.
 */

export type AccountIdentifier = string;

export type AccountRequestState =
  | 'idle'
  | 'loading'
  | 'success'
  | 'error';

export interface AccountLoadState {
  state: AccountRequestState;
  errorMessage?: string;
}

/**
 * Generic error shape for frontend presentation.
 * Actual backend error fields must be verified against the API contract.
 */
export interface AccountApiError {
  code?: string;
  message?: string;
  requestId?: string;
  details?: unknown;
}