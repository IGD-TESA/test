import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { RUNTIME_CONFIG } from '../../../core/config/runtime-config';

/**
 * Account API access layer.
 *
 * Important:
 * - Uses the existing HttpClient provider.
 * - Uses the existing runtime API base URL.
 * - Does not implement token storage or authentication interceptors.
 * - Does not assume undocumented request or response DTOs.
 * - User identifiers are supplied by the caller.
 */
@Injectable({
  providedIn: 'root',
})
export class AccountApiService {
  private readonly http = inject(HttpClient);

  private readonly apiRoot =
    `${RUNTIME_CONFIG.apiBaseUrl.replace(/\/+$/, '')}/api/v1`;

  private endpoint(path: string): string {
    return `${this.apiRoot}${path}`;
  }

  /**
   * GET /api/v1/auth/authorization/me
   *
   * Returns the current authorization information.
   * The concrete response schema must be verified against the backend.
   */
  getCurrentAuthorization<T = unknown>(): Observable<T> {
    return this.http.get<T>(
      this.endpoint('/auth/authorization/me'),
    );
  }

  /**
   * GET /api/v1/auth/devices
   *
   * Lists registered devices.
   * The concrete response schema must be verified against the backend.
   */
  getDevices<T = unknown>(): Observable<T> {
    return this.http.get<T>(
      this.endpoint('/auth/devices'),
    );
  }

  /**
   * GET /api/v1/users/{id}
   */
  getUser<T = unknown>(userId: string): Observable<T> {
    return this.http.get<T>(
      this.endpoint(`/users/${encodeURIComponent(userId)}`),
    );
  }

  /**
   * GET /api/v1/users/{id}/profile
   */
  getUserProfile<T = unknown>(userId: string): Observable<T> {
    return this.http.get<T>(
      this.endpoint(
        `/users/${encodeURIComponent(userId)}/profile`,
      ),
    );
  }

  /**
   * GET /api/v1/users/{id}/phones
   */
  getUserPhones<T = unknown>(userId: string): Observable<T> {
    return this.http.get<T>(
      this.endpoint(
        `/users/${encodeURIComponent(userId)}/phones`,
      ),
    );
  }

  /**
   * GET /api/v1/users/{id}/emails
   */
  getUserEmails<T = unknown>(userId: string): Observable<T> {
    return this.http.get<T>(
      this.endpoint(
        `/users/${encodeURIComponent(userId)}/emails`,
      ),
    );
  }

  /**
   * GET /api/v1/users/{id}/legal-entity
   */
  getLegalEntity<T = unknown>(userId: string): Observable<T> {
    return this.http.get<T>(
      this.endpoint(
        `/users/${encodeURIComponent(userId)}/legal-entity`,
      ),
    );
  }

  /**
   * GET /api/v1/verifications/{id}
   */
  getVerification<T = unknown>(verificationId: string): Observable<T> {
    return this.http.get<T>(
      this.endpoint(
        `/verifications/${encodeURIComponent(verificationId)}`,
      ),
    );
  }
}