
#requires -Version 5.1

<#
.SYNOPSIS
    Initializes the IGD Account Frontend feature.

.DESCRIPTION
    Creates the Account feature pages, models, API service and documentation.
    Updates only account.routes.ts inside the Account feature.

    Does NOT:
      - Modify the application shell.
      - Modify app.routes.ts or app.config.ts.
      - Modify runtime configuration.
      - Modify backend files.
      - Install packages.
      - Run Angular build.
      - Change dependencies.

    Safe behavior:
      - Preflights all target files before writing.
      - Never overwrites conflicting existing files.
      - Supports re-running when generated files are unchanged.
      - Backs up account.routes.ts before modifying it.
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ------------------------------------------------------------
# 1. Helpers
# ------------------------------------------------------------

function Write-Section {
    param([string]$Message)

    Write-Host ""
    Write-Host "==================================================" -ForegroundColor DarkGreen
    Write-Host " $Message" -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor DarkGreen
}

function Normalize-Text {
    param([AllowEmptyString()][string]$Text)

    if ($null -eq $Text) {
        return ''
    }

    return ($Text -replace "`r`n", "`n").Trim()
}

function Write-FeatureFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$RelativePath,

        [Parameter(Mandatory = $true)]
        [string]$Content
    )

    $FullPath = Join-Path $AccountRoot $RelativePath
    $Directory = Split-Path -Parent $FullPath

    if (-not (Test-Path -LiteralPath $Directory)) {
        [System.IO.Directory]::CreateDirectory($Directory) | Out-Null
    }

    [System.IO.File]::WriteAllText(
        $FullPath,
        $Content,
        $Utf8Encoding
    )

    Write-Host "[CREATED] $RelativePath" -ForegroundColor Green
}

# ------------------------------------------------------------
# 2. Resolve project paths
# ------------------------------------------------------------

$ScriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$FrontendRoot = Split-Path -Parent $ScriptDirectory
$AppRoot = Join-Path $FrontendRoot 'app'

$AccountRoot = Join-Path `
    $AppRoot `
    'src\app\features\account'

$RoutesPath = Join-Path $AccountRoot 'account.routes.ts'

$Utf8Encoding = New-Object System.Text.UTF8Encoding($true)

Write-Section "IGD Account Frontend Initialization"

Write-Host "Frontend : $FrontendRoot"
Write-Host "Angular  : $AppRoot"
Write-Host "Account  : $AccountRoot"

# ------------------------------------------------------------
# 3. Environment preflight
# ------------------------------------------------------------

if (-not (Test-Path -LiteralPath $AppRoot -PathType Container)) {
    throw "Angular application directory was not found: $AppRoot"
}

if (-not (Test-Path -LiteralPath $AccountRoot -PathType Container)) {
    throw "Account feature directory was not found: $AccountRoot"
}

if (-not (Test-Path -LiteralPath $RoutesPath -PathType Leaf)) {
    throw "Existing account.routes.ts was not found. No files were changed."
}

# ------------------------------------------------------------
# 4. Existing route file: known baseline
# ------------------------------------------------------------

$ExpectedOriginalRoutes = @'
import type { Routes } from '@angular/router';
import { featurePageRoute } from '../../shared/routing/feature-route.factory';

export const ACCOUNT_ROUTES: Routes = [
  featurePageRoute(
    '',
    'حساب من',
    'مدیریت اطلاعات و تنظیمات حساب کاربری.',
  ),
  featurePageRoute(
    'profile',
    'اطلاعات حساب',
    'مشاهده و مدیریت اطلاعات پایه حساب.',
  ),
  featurePageRoute(
    'verification',
    'احراز هویت',
    'پیگیری وضعیت احراز هویت.',
  ),
  featurePageRoute(
    'security',
    'امنیت حساب',
    'مدیریت تنظیمات امنیتی حساب.',
  ),
  featurePageRoute(
    'login',
    'ورود',
    'مسیر ورود به حساب کاربری.',
  ),
  featurePageRoute(
    'register',
    'ثبت‌نام',
    'مسیر ایجاد حساب کاربری.',
  ),
  featurePageRoute(
    'recover-password',
    'بازیابی رمز عبور',
    'مسیر بازیابی دسترسی به حساب.',
  ),
];
'@

# ------------------------------------------------------------
# 5. New account route definition
# ------------------------------------------------------------

$NewRouteContent = @'
import type { Routes } from '@angular/router';
import { featurePageRoute } from '../../shared/routing/feature-route.factory';

export const ACCOUNT_ROUTES: Routes = [
  {
    path: '',
    title: 'حساب من | IGD',
    loadComponent: () =>
      import('./pages/overview/account-overview.page').then(
        (module) => module.AccountOverviewPage,
      ),
  },
  {
    path: 'profile',
    title: 'اطلاعات حساب | IGD',
    loadComponent: () =>
      import('./pages/profile/account-profile.page').then(
        (module) => module.AccountProfilePage,
      ),
  },
  {
    path: 'legal-entity',
    title: 'اطلاعات حقوقی | IGD',
    loadComponent: () =>
      import('./pages/legal-entity/account-legal-entity.page').then(
        (module) => module.AccountLegalEntityPage,
      ),
  },
  {
    path: 'contacts',
    title: 'راه‌های ارتباطی | IGD',
    loadComponent: () =>
      import('./pages/contacts/account-contacts.page').then(
        (module) => module.AccountContactsPage,
      ),
  },
  {
    path: 'verification',
    title: 'احراز هویت | IGD',
    loadComponent: () =>
      import('./pages/verification/account-verification.page').then(
        (module) => module.AccountVerificationPage,
      ),
  },
  {
    path: 'security',
    title: 'امنیت حساب | IGD',
    loadComponent: () =>
      import('./pages/security/account-security.page').then(
        (module) => module.AccountSecurityPage,
      ),
  },
  {
    path: 'devices',
    title: 'دستگاه‌های متصل | IGD',
    loadComponent: () =>
      import('./pages/devices/account-devices.page').then(
        (module) => module.AccountDevicesPage,
      ),
  },
  {
    path: 'sessions',
    title: 'نشست‌های کاربری | IGD',
    loadComponent: () =>
      import('./pages/sessions/account-sessions.page').then(
        (module) => module.AccountSessionsPage,
      ),
  },
  {
    path: 'permissions',
    title: 'مجوزهای دسترسی | IGD',
    loadComponent: () =>
      import('./pages/permissions/account-permissions.page').then(
        (module) => module.AccountPermissionsPage,
      ),
  },

  featurePageRoute(
    'login',
    'ورود',
    'مسیر ورود به حساب کاربری.',
  ),
  featurePageRoute(
    'register',
    'ثبت‌نام',
    'مسیر ایجاد حساب کاربری.',
  ),
  featurePageRoute(
    'recover-password',
    'بازیابی رمز عبور',
    'مسیر بازیابی دسترسی به حساب.',
  ),
];
'@

# ------------------------------------------------------------
# 6. Verify existing routes before any changes
# ------------------------------------------------------------

$CurrentRoutes = [System.IO.File]::ReadAllText($RoutesPath)

$NormalizedCurrentRoutes = Normalize-Text $CurrentRoutes
$NormalizedOriginalRoutes = Normalize-Text $ExpectedOriginalRoutes
$NormalizedNewRoutes = Normalize-Text $NewRouteContent

$RouteNeedsUpdate = $false

if ($NormalizedCurrentRoutes -eq $NormalizedNewRoutes) {
    Write-Host "[OK] Account routes are already initialized." -ForegroundColor Green
}
elseif ($NormalizedCurrentRoutes -eq $NormalizedOriginalRoutes) {
    $RouteNeedsUpdate = $true
    Write-Host "[OK] Existing account routes match the expected baseline." -ForegroundColor Green
}
else {
    throw @"
The current account.routes.ts does not match the known baseline.

For safety, the script has stopped before making changes.
No files have been created or overwritten.

File:
$RoutesPath
"@
}

# ------------------------------------------------------------
# 7. Files to create
# ------------------------------------------------------------

$Files = [ordered]@{}

# ------------------------------------------------------------
# 7.1 Account models
# ------------------------------------------------------------

$Files['models\account.models.ts'] = @'
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
'@

# ------------------------------------------------------------
# 7.2 Account API service
# ------------------------------------------------------------

$Files['services\account-api.service.ts'] = @'
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
'@

# ------------------------------------------------------------
# 7.3 Account feature documentation
# ------------------------------------------------------------

$Files['README.md'] = @'
# IGD Account Frontend

This directory contains the Account frontend feature.

## Structure

- `account.routes.ts`: Account feature routes.
- `models/`: Shared technical types.
- `services/`: Account API communication.
- `pages/overview/`: Account overview.
- `pages/profile/`: Basic account profile.
- `pages/legal-entity/`: Legal entity information.
- `pages/contacts/`: Phone and email information.
- `pages/verification/`: Verification status.
- `pages/security/`: Security settings.
- `pages/devices/`: Registered devices.
- `pages/sessions/`: User session interface.
- `pages/permissions/`: Authorization information.

## API integration

The API service uses the existing runtime configuration and Angular HttpClient.

The service currently contains GET operations for routes observed in the
Account backend server routing.

The existence of a route does not prove its complete request/response
contract or authorization behavior. Concrete DTOs, user identity resolution,
session behavior and authorization requirements must be verified before
connecting pages to live data.

No mock backend data is included.

## Deliberately not implemented

- Token storage.
- Authentication interceptor.
- Automatic current-user ID resolution.
- Password and authentication request payloads.
- Verification submission payloads.
- Device revocation commands.
- Session listing or revocation operations.
- Profile, phone, email or legal-entity mutation commands.

These require verified backend contracts and a confirmed authentication flow.
'@

# ------------------------------------------------------------
# 8. Page definitions
# ------------------------------------------------------------

$PageDefinitions = @(
    @{
        Folder = 'overview'
        Class = 'AccountOverviewPage'
        Selector = 'igd-account-overview-page'
        Title = 'حساب من'
        Description = 'نمای کلی اطلاعات و وضعیت حساب کاربری.'
    },
    @{
        Folder = 'profile'
        Class = 'AccountProfilePage'
        Selector = 'igd-account-profile-page'
        Title = 'اطلاعات حساب'
        Description = 'مشاهده و مدیریت اطلاعات پایه حساب کاربری.'
    },
    @{
        Folder = 'legal-entity'
        Class = 'AccountLegalEntityPage'
        Selector = 'igd-account-legal-entity-page'
        Title = 'اطلاعات حقوقی'
        Description = 'اطلاعات مربوط به شخصیت حقوقی و مشخصات ثبتی.'
    },
    @{
        Folder = 'contacts'
        Class = 'AccountContactsPage'
        Selector = 'igd-account-contacts-page'
        Title = 'راه‌های ارتباطی'
        Description = 'مدیریت اطلاعات تماس و راه‌های ارتباطی حساب.'
    },
    @{
        Folder = 'verification'
        Class = 'AccountVerificationPage'
        Selector = 'igd-account-verification-page'
        Title = 'احراز هویت'
        Description = 'مشاهده وضعیت و پیگیری فرایندهای احراز هویت.'
    },
    @{
        Folder = 'security'
        Class = 'AccountSecurityPage'
        Selector = 'igd-account-security-page'
        Title = 'امنیت حساب'
        Description = 'مدیریت تنظیمات و وضعیت امنیت حساب کاربری.'
    },
    @{
        Folder = 'devices'
        Class = 'AccountDevicesPage'
        Selector = 'igd-account-devices-page'
        Title = 'دستگاه‌های متصل'
        Description = 'مشاهده دستگاه‌های ثبت‌شده برای حساب کاربری.'
    },
    @{
        Folder = 'sessions'
        Class = 'AccountSessionsPage'
        Selector = 'igd-account-sessions-page'
        Title = 'نشست‌های کاربری'
        Description = 'فضای مدیریت نشست‌ها و ورودهای حساب کاربری.'
    },
    @{
        Folder = 'permissions'
        Class = 'AccountPermissionsPage'
        Selector = 'igd-account-permissions-page'
        Title = 'مجوزهای دسترسی'
        Description = 'مشاهده اطلاعات مجوزها و سطح دسترسی حساب.'
    }
)

# ------------------------------------------------------------
# 9. Page file templates
# ------------------------------------------------------------

$ComponentTemplate = @'
import { Component } from '@angular/core';

@Component({
  selector: '__SELECTOR__',
  standalone: true,
  templateUrl: './account-page.html',
  styleUrl: './account-page.css',
})
export class __CLASS__ {}
'@

$HtmlTemplate = @'
<main class="account-page">
  <header class="account-page__header">
    <div>
      <h1>__TITLE__</h1>
      <p>__DESCRIPTION__</p>
    </div>
  </header>

  <section
    class="account-page__content"
    aria-label="محتوای صفحه"
  >
    <p>
      اطلاعات این بخش پس از اتصال به سرویس مربوط و تأیید قرارداد API
      نمایش داده خواهد شد.
    </p>
  </section>
</main>
'@

$CssTemplate = @'
:host {
  display: block;
  min-width: 0;
  width: 100%;
}

.account-page {
  width: 100%;
  min-width: 0;
  padding: 1.25rem;
  box-sizing: border-box;
  color: inherit;
}

.account-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.account-page__header h1 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.8;
}

.account-page__header p {
  margin: 0.35rem 0 0;
  color: var(--muted-foreground, #777);
  font-size: 0.875rem;
  line-height: 1.8;
}

.account-page__content {
  min-height: 8rem;
  padding: 1rem;
  border: 1px solid var(--border, #e5e5e5);
  border-radius: 0.75rem;
  background: var(--card, transparent);
  box-sizing: border-box;
}

.account-page__content p {
  margin: 0;
  color: var(--muted-foreground, #777);
  font-size: 0.875rem;
  line-height: 2;
}
'@

foreach ($Page in $PageDefinitions) {
    $ComponentContent = $ComponentTemplate.
        Replace('__SELECTOR__', $Page.Selector).
        Replace('__CLASS__', $Page.Class)

    $HtmlContent = $HtmlTemplate.
        Replace('__TITLE__', $Page.Title).
        Replace('__DESCRIPTION__', $Page.Description)

    $CssContent = $CssTemplate

    $PageBase = "pages\$($Page.Folder)"

    $Files["$PageBase\$($Page.Folder -replace '-', '-')"] = $null

    $Files["$PageBase\account-page.component.ts"] = $ComponentContent
    $Files["$PageBase\account-page.html"] = $HtmlContent
    $Files["$PageBase\account-page.css"] = $CssContent
}

# ------------------------------------------------------------
# 10. Correct page component filenames
# ------------------------------------------------------------

# Route imports use explicit filenames.
# Rename the generated component files in the content map.

$ComponentFileNames = @{
    'overview' = 'account-overview.page.ts'
    'profile' = 'account-profile.page.ts'
    'legal-entity' = 'account-legal-entity.page.ts'
    'contacts' = 'account-contacts.page.ts'
    'verification' = 'account-verification.page.ts'
    'security' = 'account-security.page.ts'
    'devices' = 'account-devices.page.ts'
    'sessions' = 'account-sessions.page.ts'
    'permissions' = 'account-permissions.page.ts'
}

foreach ($Page in $PageDefinitions) {
    $PageBase = "pages\$($Page.Folder)"
    $OldComponentPath = "$PageBase\account-page.component.ts"
    $NewComponentPath = "$PageBase\$($ComponentFileNames[$Page.Folder])"

    $Files[$NewComponentPath] = $Files[$OldComponentPath]
    $Files.Remove($OldComponentPath)
}

# Remove accidental non-file keys, if any.
foreach ($Key in @($Files.Keys)) {
    if ($null -eq $Files[$Key]) {
        $Files.Remove($Key)
    }
}

# ------------------------------------------------------------
# 11. Preflight all generated files
# ------------------------------------------------------------

Write-Section "Preflight: checking existing files"

$Conflicts = @()

foreach ($RelativePath in $Files.Keys) {
    $FullPath = Join-Path $AccountRoot $RelativePath

    if (Test-Path -LiteralPath $FullPath -PathType Leaf) {
        $ExistingContent = [System.IO.File]::ReadAllText($FullPath)
        $ExpectedContent = [string]$Files[$RelativePath]

        if ((Normalize-Text $ExistingContent) -ne (Normalize-Text $ExpectedContent)) {
            $Conflicts += $RelativePath
        }
        else {
            Write-Host "[EXISTS - MATCH] $RelativePath" -ForegroundColor DarkGray
        }
    }
}

if ($Conflicts.Count -gt 0) {
    Write-Host ""
    Write-Host "Conflicting files were found:" -ForegroundColor Red

    foreach ($Conflict in $Conflicts) {
        Write-Host " - $Conflict" -ForegroundColor Red
    }

    throw "Preflight failed. No files have been created or overwritten."
}

Write-Host "[OK] No conflicting generated files." -ForegroundColor Green

# ------------------------------------------------------------
# 12. Create feature files
# ------------------------------------------------------------

Write-Section "Creating Account feature files"

$CreatedCount = 0
$ExistingCount = 0

foreach ($RelativePath in $Files.Keys) {
    $FullPath = Join-Path $AccountRoot $RelativePath

    if (Test-Path -LiteralPath $FullPath -PathType Leaf) {
        $ExistingCount++
        continue
    }

    Write-FeatureFile `
        -RelativePath $RelativePath `
        -Content ([string]$Files[$RelativePath])

    $CreatedCount++
}

# ------------------------------------------------------------
# 13. Update account routes last
# ------------------------------------------------------------

Write-Section "Updating Account routes"

$CurrentRoutes = [System.IO.File]::ReadAllText($RoutesPath)
$NormalizedCurrentRoutes = Normalize-Text $CurrentRoutes

if ($NormalizedCurrentRoutes -eq $NormalizedNewRoutes) {
    Write-Host "[OK] Routes already match the generated version." -ForegroundColor Green
}
elseif ($NormalizedCurrentRoutes -eq $NormalizedOriginalRoutes) {
    $Timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $BackupPath = "$RoutesPath.backup-$Timestamp"

    Copy-Item `
        -LiteralPath $RoutesPath `
        -Destination $BackupPath `
        -ErrorAction Stop

    Write-Host "[BACKUP] $BackupPath" -ForegroundColor Yellow

    [System.IO.File]::WriteAllText(
        $RoutesPath,
        $NewRouteContent,
        $Utf8Encoding
    )

    Write-Host "[UPDATED] account.routes.ts" -ForegroundColor Green
}
else {
    throw "Route file changed during execution. Route update was cancelled."
}

# ------------------------------------------------------------
# 14. Final report
# ------------------------------------------------------------

Write-Section "Initialization completed"

Write-Host "Account feature root:"
Write-Host $AccountRoot

Write-Host ""
Write-Host "New files : $CreatedCount" -ForegroundColor Green
Write-Host "Unchanged : $ExistingCount" -ForegroundColor DarkGray

Write-Host ""
Write-Host "Created page groups:"
foreach ($Page in $PageDefinitions) {
    Write-Host " - $($Page.Folder)"
}

Write-Host ""
Write-Host "Protected files:"
Write-Host " - app.routes.ts"
Write-Host " - app.config.ts"
Write-Host " - runtime-config.ts"
Write-Host " - application shell"
Write-Host " - backend source files"
Write-Host " - package.json and dependencies"

Write-Host ""
Write-Host "No package installation or Angular build was executed."

Write-Host ""
Write-Host "Account Frontend initialization finished." -ForegroundColor Green
