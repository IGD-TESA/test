#requires -Version 5.1

<#
.SYNOPSIS
    Hardens General Market Application Layer - Package 01.

.DESCRIPTION
    Stabilizes Application contracts and existing use cases.

    Scope:
      - internal/application/ports.go
      - internal/application/services.go
      - internal/application/services_hardening_test.go

    Safety:
      - Runs baseline tests before modifications.
      - Creates timestamped backups.
      - Uses atomic file replacement.
      - Applies guarded source transformations.
      - Runs gofmt, package tests, full tests and go vet.
      - Verifies protected database/infrastructure files.
      - Rolls back application changes if validation fails.

    Explicitly does NOT modify:
      - PostgreSQL schema
      - migrations
      - internal/database
      - Docker files
      - go.mod / go.sum
      - external infrastructure
#>

param(
    [Parameter(Mandatory = $false)]
    [string]$ProjectRoot = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Script:PackageMarker = "APPLICATION_PACKAGE_01_HARDENING_V1"
$Script:ChangesStarted = $false
$Script:Root = $null
$Script:BackupRoot = $null
$Script:OriginalFiles = @{}
$Script:NewFiles = @()

# ---------------------------------------------------------------------
# 01. GENERAL UTILITIES
# ---------------------------------------------------------------------

function Write-Section {
    param([string]$Message)

    Write-Host ""
    Write-Host ("=" * 78) -ForegroundColor DarkCyan
    Write-Host $Message -ForegroundColor Cyan
    Write-Host ("=" * 78) -ForegroundColor DarkCyan
}

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Gray
}

function Write-Success {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-WarningMessage {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Stop-Script {
    param([string]$Message)
    throw $Message
}

function Read-Utf8Text {
    param([string]$Path)

    $text = [System.IO.File]::ReadAllText($Path)

    return $text.Replace("`r`n", "`n").Replace("`r", "`n")
}

function Write-AtomicUtf8 {
    param(
        [string]$Path,
        [string]$Content
    )

    $directory = Split-Path -Parent $Path

    if (-not (Test-Path -LiteralPath $directory -PathType Container)) {
        New-Item -ItemType Directory -Path $directory -Force |
            Out-Null
    }

    $temporaryPath = Join-Path $directory (
        "." + [System.IO.Path]::GetFileName($Path) +
        "." + [guid]::NewGuid().ToString("N") +
        ".tmp"
    )

    $encoding = New-Object System.Text.UTF8Encoding($false)

    try {
        [System.IO.File]::WriteAllText(
            $temporaryPath,
            $Content,
            $encoding
        )

        Move-Item -LiteralPath $temporaryPath `
            -Destination $Path -Force
    }
    finally {
        if (Test-Path -LiteralPath $temporaryPath) {
            Remove-Item -LiteralPath $temporaryPath -Force
        }
    }
}

function Write-AtomicBytes {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [byte[]]$Bytes
    )

    $directory = Split-Path -Parent $Path

    if (-not (Test-Path -LiteralPath $directory -PathType Container)) {
        New-Item -ItemType Directory -Path $directory -Force |
            Out-Null
    }

    $temporaryPath = Join-Path $directory (
        "." + [System.IO.Path]::GetFileName($Path) +
        "." + [guid]::NewGuid().ToString("N") +
        ".tmp"
    )

    try {
        [System.IO.File]::WriteAllBytes($temporaryPath, $Bytes)
        Move-Item -LiteralPath $temporaryPath -Destination $Path -Force
    }
    finally {
        if (Test-Path -LiteralPath $temporaryPath) {
            Remove-Item -LiteralPath $temporaryPath -Force
        }
    }
}

function Replace-TextExactlyOnce {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Source,

        [Parameter(Mandatory = $true)]
        [string]$OldText,

        [Parameter(Mandatory = $true)]
        [string]$NewText,

        [Parameter(Mandatory = $true)]
        [string]$Label
    )

    if ([string]::IsNullOrWhiteSpace($OldText)) {
        Stop-Script "Empty source anchor is forbidden: $Label"
    }

    # Normalize line endings and indentation for comparison only.
    # The actual source outside the matched region remains unchanged.
    $Normalize = {
        param([string]$Value)

        $Value = $Value.Replace("`r`n", "`n").Replace("`r", "`n")

        $Lines = $Value -split "`n"

        $Lines = @(
            foreach ($Line in $Lines) {
                $Line.Trim()
            }
        )

        return ($Lines -join "`n").Trim()
    }

    $NormalizedSource = & $Normalize $Source
    $NormalizedOld = & $Normalize $OldText

    if ([string]::IsNullOrWhiteSpace($NormalizedOld)) {
        Stop-Script "Normalized source anchor is empty: $Label"
    }

    $Index = $NormalizedSource.IndexOf(
        $NormalizedOld,
        [System.StringComparison]::Ordinal
    )

    if ($Index -lt 0) {
        Stop-Script "Source anchor not found after normalization: $Label"
    }

    $SecondIndex = $NormalizedSource.IndexOf(
        $NormalizedOld,
        $Index + $NormalizedOld.Length,
        [System.StringComparison]::Ordinal
    )

    if ($SecondIndex -ge 0) {
        Stop-Script "Source anchor is ambiguous after normalization: $Label"
    }

    # First attempt: exact replacement, preserving original behavior.
    $ExactIndex = $Source.IndexOf(
        $OldText,
        [System.StringComparison]::Ordinal
    )

    if ($ExactIndex -ge 0) {
        $ExactSecond = $Source.IndexOf(
            $OldText,
            $ExactIndex + $OldText.Length,
            [System.StringComparison]::Ordinal
        )

        if ($ExactSecond -ge 0) {
            Stop-Script "Exact source anchor is ambiguous: $Label"
        }

        return $Source.Substring(0, $ExactIndex) +
            $NewText +
            $Source.Substring($ExactIndex + $OldText.Length)
    }

    # If whitespace differs, locate the same logical lines in the
    # original source and replace only their complete line range.
    $SourceLines = $Source -split "`n", 0, "SimpleMatch"
    $OldLines = $OldText.Replace("`r`n", "`n").Replace("`r", "`n") -split "`n"

    $Expected = @(
        foreach ($Line in $OldLines) {
            $Line.Trim()
        }
    )

    $Matches = New-Object System.Collections.Generic.List[int]

    for ($Start = 0; $Start -le ($SourceLines.Count - $Expected.Count); $Start++) {
        $IsMatch = $true

        for ($Offset = 0; $Offset -lt $Expected.Count; $Offset++) {
            if ($SourceLines[$Start + $Offset].Trim() -cne $Expected[$Offset]) {
                $IsMatch = $false
                break
            }
        }

        if ($IsMatch) {
            $Matches.Add($Start)
        }
    }

    if ($Matches.Count -ne 1) {
        Stop-Script "Expected exactly one logical source anchor for '$Label'; found $($Matches.Count)."
    }

    $StartLine = $Matches[0]
    $EndLine = $StartLine + $Expected.Count - 1

    $Before = @()
    $After = @()

    if ($StartLine -gt 0) {
        $Before = @($SourceLines[0..($StartLine - 1)])
    }

    if ($EndLine -lt ($SourceLines.Count - 1)) {
        $After = @($SourceLines[($EndLine + 1)..($SourceLines.Count - 1)])
    }

    $NewLines = $NewText.Replace("`r`n", "`n").Replace("`r", "`n") -split "`n"

    return (@($Before) + @($NewLines) + @($After)) -join "`n"
}

function Replace-GoSection {
    param(
        [string]$Source,
        [string]$StartMarker,
        [string]$EndMarker,
        [string]$Replacement,
        [string]$Label
    )

    $start = $Source.IndexOf(
        $StartMarker,
        [System.StringComparison]::Ordinal
    )

    if ($start -lt 0) {
        Stop-Script "Go function not found: $Label"
    }

    $duplicate = $Source.IndexOf(
        $StartMarker,
        $start + $StartMarker.Length,
        [System.StringComparison]::Ordinal
    )

    if ($duplicate -ge 0) {
        Stop-Script "Duplicate Go function marker: $Label"
    }

    $end = $Source.IndexOf(
        $EndMarker,
        $start + $StartMarker.Length,
        [System.StringComparison]::Ordinal
    )

    if ($end -lt 0) {
        Stop-Script "End boundary not found for: $Label"
    }

    return $Source.Substring(0, $start) +
        $Replacement.TrimEnd() +
        "`n`n" +
        $Source.Substring($end)
}

function Find-ProjectRoot {
    param([string]$InitialPath)

    if (-not [string]::IsNullOrWhiteSpace($InitialPath)) {
        $resolved = Resolve-Path -LiteralPath $InitialPath
        $candidate = $resolved.Path

        if (
            (Test-Path -LiteralPath (Join-Path $candidate "go.mod")) -and
            (Test-Path -LiteralPath (Join-Path $candidate "internal\application"))
        ) {
            return $candidate
        }

        Stop-Script "ProjectRoot is not a valid General Market project."
    }

    $current = (Get-Location).Path

    while (-not [string]::IsNullOrWhiteSpace($current)) {
        $goMod = Join-Path $current "go.mod"
        $application = Join-Path $current "internal\application"

        if (
            (Test-Path -LiteralPath $goMod -PathType Leaf) -and
            (Test-Path -LiteralPath $application -PathType Container)
        ) {
            return $current
        }

        $parent = Split-Path -Parent $current

        if (
            [string]::IsNullOrWhiteSpace($parent) -or
            $parent -eq $current
        ) {
            break
        }

        $current = $parent
    }

    Stop-Script "General Market project root was not found."
}

function Invoke-CheckedNativeCommand {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Executable,

        [Parameter(Mandatory = $true)]
        [string[]]$Arguments,

        [Parameter(Mandatory = $true)]
        [string]$Label
    )

    Write-Section $Label

    $previousPreference = $ErrorActionPreference
    $output = @()
    $exitCode = -1
    $invocationError = $null

    try {
        # Windows PowerShell 5.1 can promote native stderr records to
        # terminating errors when ErrorActionPreference is Stop.
        # Continue only for this native invocation so stdout/stderr and
        # the real process exit code can both be collected.
        $ErrorActionPreference = "Continue"
        $output = @(& $Executable @Arguments 2>&1)
        $exitCode = $LASTEXITCODE
    }
    catch {
        $invocationError = $_
    }
    finally {
        $ErrorActionPreference = $previousPreference
    }

    foreach ($line in $output) {
        Write-Host $line
    }

    if ($null -ne $invocationError) {
        Stop-Script ("$Executable invocation failed: " + $invocationError.Exception.Message)
    }

    if ($null -eq $exitCode -or [int]$exitCode -ne 0) {
        Stop-Script ("$Executable failed with exit code '$exitCode': " + ($Arguments -join " "))
    }

    Write-Success "Command passed."
}

function Invoke-GoCheck {
    param(
        [string[]]$Arguments,
        [string]$Label
    )

    Invoke-CheckedNativeCommand -Executable "go" -Arguments $Arguments -Label $Label
}

function Get-ProtectedFileHashes {
    param([string]$Root)

    $relativePaths = @(
        "migrations",
        "internal/database",
        "docker",
        "docker-compose.yml",
        "Dockerfile",
        "go.mod",
        "go.sum"
    )

    $result = @{}

    foreach ($relative in $relativePaths) {
        $full = Join-Path $Root $relative

        if (-not (Test-Path -LiteralPath $full)) {
            continue
        }

        if (Test-Path -LiteralPath $full -PathType Leaf) {
            $hash = Get-FileHash -LiteralPath $full -Algorithm SHA256
            $result[$relative] = $hash.Hash
            continue
        }

        $files = @(
            Get-ChildItem -LiteralPath $full -File -Recurse -Force
        )

        foreach ($file in $files) {
            $key = $file.FullName.Substring($Root.Length).TrimStart("\")
            $hash = Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256
            $result[$key] = $hash.Hash
        }
    }

    return $result
}

function Assert-ProtectedFilesUnchanged {
    param(
        [hashtable]$Before,
        [hashtable]$After
    )

    $allKeys = @(
        $Before.Keys + $After.Keys |
            Sort-Object -Unique
    )

    $differences = @()

    foreach ($key in $allKeys) {
        if (-not $Before.ContainsKey($key)) {
            $differences += "Unexpected protected file: $key"
            continue
        }

        if (-not $After.ContainsKey($key)) {
            $differences += "Protected file disappeared: $key"
            continue
        }

        if ($Before[$key] -ne $After[$key]) {
            $differences += "Protected file changed: $key"
        }
    }

    if ($differences.Count -gt 0) {
        Stop-Script (
            "Protected database/infrastructure files changed:`n" +
            ($differences -join "`n")
        )
    }
}

# ---------------------------------------------------------------------
# 02. ROLLBACK
# ---------------------------------------------------------------------

function Restore-OriginalFiles {
    Write-Section "ROLLBACK"

    foreach ($relative in $Script:OriginalFiles.Keys) {
        $target = Join-Path $Script:Root $relative
        $backup = Join-Path $Script:BackupRoot $relative

        if (Test-Path -LiteralPath $backup -PathType Leaf) {
            $originalBytes = [System.IO.File]::ReadAllBytes($backup)
            Write-AtomicBytes -Path $target -Bytes $originalBytes

            Write-WarningMessage "Restored byte-exact original: $relative"
        }
    }

    foreach ($relative in $Script:NewFiles) {
        $target = Join-Path $Script:Root $relative

        if (Test-Path -LiteralPath $target) {
            Remove-Item -LiteralPath $target -Force
            Write-WarningMessage "Removed generated file: $relative"
        }
    }

    Write-Success "Application changes rolled back."
}

# ---------------------------------------------------------------------
# 03. VALIDATE PROJECT
# ---------------------------------------------------------------------


Write-Section "GENERAL MARKET - APPLICATION PACKAGE 01"

if (-not (Get-Command go -ErrorAction SilentlyContinue)) {
    Stop-Script "Go executable was not found in PATH."
}

$Script:Root = Find-ProjectRoot -InitialPath $ProjectRoot

Push-Location $Script:Root

try {
    Write-Info "Project root: $Script:Root"

    $modulePath = Join-Path $Script:Root "go.mod"
    $moduleText = Read-Utf8Text $modulePath

    if (
        $moduleText -notmatch
        '(?m)^module github\.com/igd-tesa/real-asset-management-platform/general-market-backend\s*$'
    ) {
        Stop-Script "Unexpected Go module path. No changes made."
    }

    $targetFiles = @(
        "internal/application/ports.go",
        "internal/application/services.go",
        "internal/application/services_test.go"
    )

    foreach ($relative in $targetFiles) {
        $full = Join-Path $Script:Root $relative

        if (-not (Test-Path -LiteralPath $full -PathType Leaf)) {
            Stop-Script "Required Application file is missing: $relative"
        }
    }

    $newTestRelative = "internal/application/services_hardening_test.go"
    $newTestFull = Join-Path $Script:Root $newTestRelative

    if (Test-Path -LiteralPath $newTestFull) {
        Stop-Script (
            "Hardening test file already exists. " +
            "Review it manually before running this script again."
        )
    }

    $portsPath = Join-Path $Script:Root "internal/application/ports.go"
    $servicesPath = Join-Path $Script:Root "internal/application/services.go"
    $testsPath = Join-Path $Script:Root "internal/application/services_test.go"

    $ports = Read-Utf8Text $portsPath
    $services = Read-Utf8Text $servicesPath
    $existingTests = Read-Utf8Text $testsPath

    $servicesImportAnchor = @'
    "math"
    "strings"
    "time"
'@

    $servicesImportReplacement = @'
    "math"
    "sort"
    "strings"
    "time"
'@

    $services = Replace-TextExactlyOnce -Source $services -OldText $servicesImportAnchor -NewText $servicesImportReplacement -Label "services.go sort import required by deterministic policy validation"

    if ($services.Contains($Script:PackageMarker)) {
        Stop-Script "Package 01 hardening marker already exists."
    }

    if ($existingTests.Contains($Script:PackageMarker)) {
        Stop-Script "Existing tests already contain the Package 01 marker."
    }

    Write-Success "Project structure and module identity validated."

    # -----------------------------------------------------------------
    # 04. BASELINE
    # -----------------------------------------------------------------

    Invoke-GoCheck `
        -Arguments @("test", "./...") `
        -Label "BASELINE: go test ./..."

    Invoke-GoCheck `
        -Arguments @("vet", "./...") `
        -Label "BASELINE: go vet ./..."

    $protectedBefore = Get-ProtectedFileHashes -Root $Script:Root

    # -----------------------------------------------------------------
    # 05. BACKUP
    # -----------------------------------------------------------------

    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $Script:BackupRoot = Join-Path $Script:Root (
        ".backups\application-package-01-" + $timestamp
    )

    New-Item -ItemType Directory -Path $Script:BackupRoot -Force |
        Out-Null

    foreach ($relative in $targetFiles) {
        $full = Join-Path $Script:Root $relative
        $originalBytes = [System.IO.File]::ReadAllBytes($full)

        $Script:OriginalFiles[$relative] = $originalBytes

        $backup = Join-Path $Script:BackupRoot $relative
        $backupDirectory = Split-Path -Parent $backup

        New-Item -ItemType Directory -Path $backupDirectory -Force |
            Out-Null

        Write-AtomicBytes -Path $backup -Bytes $originalBytes
    }

    Write-Success "Original Application files backed up."
    Write-Info "Backup: $Script:BackupRoot"

    # -----------------------------------------------------------------
    # 06. PORT CONTRACT HARDENING
    # -----------------------------------------------------------------

    $oldTransactionComment = @'
// TransactionManager must bind all repositories used inside the callback
// to one database transaction. It must commit or roll back atomically.
'@

    $newTransactionComment = @'
// TransactionManager is the atomic boundary for local market persistence.
//
// Contract:
//   1. Every repository receiving the callback context must use the same
//      transaction and must not silently fall back to a global connection.
//   2. The callback must not be invoked more than once by the adapter.
//   3. The adapter must not automatically retry a callback containing
//      application side effects.
//   4. A callback error must cause rollback.
//   5. A nil callback result may be returned only after a confirmed commit.
//   6. If commit outcome cannot be determined, return
//      ErrTransactionOutcomeUnknown. Never report an ordinary rollback
//      when the commit result is actually ambiguous.
//   7. External network calls must not be hidden inside this transaction.
//   8. Nested transaction behavior must be explicit and deterministic.
'@

    $ports = Replace-TextExactlyOnce `
        -Source $ports `
        -OldText $oldTransactionComment `
        -NewText $newTransactionComment `
        -Label "TransactionManager contract"

    $oldClockComment = @'
type Clock interface {
    Now() time.Time
}
'@

    $newClockComment = @'
// Clock must be safe for concurrent use.
// Implementations may return local time; Application normalizes it to UTC.
// A zero timestamp is invalid for state-changing operations.
type Clock interface {
    Now() time.Time
}
'@

    $ports = Replace-TextExactlyOnce `
        -Source $ports `
        -OldText $oldClockComment `
        -NewText $newClockComment `
        -Label "Clock contract"

    $oldIDComment = @'
type IDGenerator interface {
    NewID(context.Context, string) (marketflow.ID, error)
}
'@

    $newIDComment = @'
// IDGenerator must return a non-empty identifier unique within its namespace.
// Generation must respect context cancellation.
// Implementations used inside a database transaction must not perform
// unbounded external network calls.
type IDGenerator interface {
    NewID(context.Context, string) (marketflow.ID, error)
}
'@

    $ports = Replace-TextExactlyOnce `
        -Source $ports `
        -OldText $oldIDComment `
        -NewText $newIDComment `
        -Label "IDGenerator contract"

    $oldBusinessValidator = @'
// Offer readiness must validate the immutable configuration version,
// parameter values, required documents and specialized qualification.
type OfferBusinessValidator interface {
'@

    $newBusinessValidator = @'
// Offer readiness validates the immutable configuration version,
// parameter values, required documents and specialized qualification.
//
// This adapter is a local, deterministic, read-only validator.
// It must not make remote network calls or mutate external services.
// If it reads repositories during a transaction, those repositories must
// honor the transaction context.
type OfferBusinessValidator interface {
'@

    $ports = Replace-TextExactlyOnce `
        -Source $ports `
        -OldText $oldBusinessValidator `
        -NewText $newBusinessValidator `
        -Label "OfferBusinessValidator contract"

    $oldResourceComment = @'
// Order resource reservation must be idempotent by key.
// The adapter must support recovery of reservations whose order write
// did not complete. Buy and sell reservations are handled according to side.
type OrderResourceGateway interface {
'@

    $newResourceComment = @'
// OrderResourceGateway is an external boundary to My Assets.
//
// ReserveForOrder contract:
//   - The same idempotency key and same order intent must return the same
//     reservation, not create another reservation.
//   - The same key with a different intent must return a conflict.
//   - Buy orders reserve the required buying power.
//   - Sell orders reserve the relevant asset quantity.
//   - The returned reservation ID must never be empty.
//   - The gateway must enforce its own timeout and idempotency rules.
//
// ReleaseOrderResources contract:
//   - Release must be idempotent for the exact reservation ID and key.
//   - It must not release a reservation belonging to another order intent.
//   - An ambiguous result must be reported as an unknown external outcome.
//   - Application must not blindly release after an ambiguous DB commit.
type OrderResourceGateway interface {
'@

    $ports = Replace-TextExactlyOnce `
        -Source $ports `
        -OldText $oldResourceComment `
        -NewText $newResourceComment `
        -Label "OrderResourceGateway contract"

    $oldOrderRepository = @'
type OrderCommandRepository interface {
    GetByIdempotencyKey(context.Context, string) (marketflow.Order, bool, error)
    CreateOrder(context.Context, marketflow.Order, string, marketflow.ID) (marketflow.Order, error)
}
'@

    $newOrderRepository = @'
// OrderCommandRepository contract:
//   - Idempotency keys must be unique in the repository's defined scope.
//   - GetByIdempotencyKey must be strongly consistent after a completed
//     transaction.
//   - CreateOrder must atomically persist the order, idempotency key and
//     reservation reference.
//   - A duplicate key with a different intent must return a conflict.
//   - The repository must not create external reservations itself.
//   - The transaction context must be honored by every method.
type OrderCommandRepository interface {
    GetByIdempotencyKey(context.Context, string) (marketflow.Order, bool, error)
    CreateOrder(context.Context, marketflow.Order, string, marketflow.ID) (marketflow.Order, error)
}
'@

    $ports = Replace-TextExactlyOnce `
        -Source $ports `
        -OldText $oldOrderRepository `
        -NewText $newOrderRepository `
        -Label "OrderCommandRepository contract"

    $oldBookComment = @'
// The following methods must execute in the same transaction.
// LockBestCrossingPair must lock both orders and return a valid crossing pair.
type OrderBookCommandRepository interface {
'@

    $newBookComment = @'
// OrderBookCommandRepository methods must execute in the same transaction.
//
// LockBestCrossingPair must:
//   - Restrict both orders to the requested market and offer.
//   - Select only eligible open/partially-filled orders.
//   - Lock both rows using a deterministic lock order.
//   - Avoid returning the same order as both sides.
//   - Respect price-time priority.
//   - Return ErrNoCrossingOrders when no eligible crossing pair exists.
//
// SaveOrder and SaveMatch must participate in the same transaction.
// SaveMatch must enforce uniqueness of its idempotency key.
type OrderBookCommandRepository interface {
'@

    $ports = Replace-TextExactlyOnce `
        -Source $ports `
        -OldText $oldBookComment `
        -NewText $newBookComment `
        -Label "OrderBookCommandRepository contract"

    $oldTradeRepository = @'
type TradeCommandRepository interface {
    GetForUpdate(context.Context, marketflow.ID) (marketflow.Trade, error)
    Save(context.Context, marketflow.Trade, uint64) error
}
'@

    $newTradeRepository = @'
// TradeCommandRepository must lock the trade row and enforce optimistic
// concurrency using the supplied expected version.
// A stale version must never silently overwrite a newer trade.
type TradeCommandRepository interface {
    GetForUpdate(context.Context, marketflow.ID) (marketflow.Trade, error)
    Save(context.Context, marketflow.Trade, uint64) error
}
'@

    $ports = Replace-TextExactlyOnce `
        -Source $ports `
        -OldText $oldTradeRepository `
        -NewText $newTradeRepository `
        -Label "TradeCommandRepository contract"

    $oldLegalComment = @'
// LegalGateway adapters must enforce the request's idempotency key,
// authorized scope and correlation identifier at the external boundary.
type LegalGateway interface {
'@

    $newLegalComment = @'
// LegalGateway adapters must enforce:
//   - request idempotency key;
//   - authorized scope;
//   - correlation identifier;
//   - bounded request timeout;
//   - provider response validation;
//   - explicit handling of unknown outcomes;
//   - safe retrieval of the result using the external tracking ID.
//
// A successful submission must return a non-empty tracking identifier.
type LegalGateway interface {
'@

    $ports = Replace-TextExactlyOnce `
        -Source $ports `
        -OldText $oldLegalComment `
        -NewText $newLegalComment `
        -Label "LegalGateway contract"

    # -----------------------------------------------------------------
    # 07. APPLICATION ERROR TAXONOMY AND HELPERS
    # -----------------------------------------------------------------

    $oldErrorLine = 'ErrInvalidTradeDimension = errors.New("invalid trade status dimension")'

    $newErrorLines = @'
ErrInvalidTradeDimension = errors.New("invalid trade status dimension")
    ErrTransactionOutcomeUnknown = errors.New("transaction outcome unknown")
    ErrExternalOutcomeUnknown = errors.New("external operation outcome unknown")
    ErrReservationReconciliationRequired = errors.New("reservation reconciliation required")
    ErrReservationCompensationFailed = errors.New("reservation compensation failed")
    ErrInvalidClock = errors.New("invalid application clock")
    ErrInvalidGeneratedID = errors.New("invalid generated identifier")
    ErrInvalidReservationID = errors.New("invalid reservation identifier")
    ErrRepositoryContractViolation = errors.New("repository contract violation")
    ErrRevisionOverflow = errors.New("revision overflow")
'@

    $services = Replace-TextExactlyOnce `
        -Source $services `
        -OldText $oldErrorLine `
        -NewText $newErrorLines.TrimEnd() `
        -Label "Application error taxonomy"

    $helperAnchor = @'
)

type MarketCatalogueGuard struct {
'@

    $helpers = @'
)

// APPLICATION_PACKAGE_01_HARDENING_V1

const applicationMaxIdempotencyKeyLength = 200

func validateApplicationContext(ctx context.Context) error {
    if ctx == nil {
        return marketflow.ErrInvalidInput
    }

    return ctx.Err()
}

func applicationNowUTC(clock Clock) (time.Time, error) {
    if clock == nil {
        return time.Time{}, ErrDependencyMissing
    }

    now := clock.Now()
    if now.IsZero() {
        return time.Time{}, ErrInvalidClock
    }

    return now.UTC(), nil
}

func applicationNewID(
    ctx context.Context,
    generator IDGenerator,
    namespace string,
) (marketflow.ID, error) {
    if generator == nil {
        return "", ErrDependencyMissing
    }

    if err := validateApplicationContext(ctx); err != nil {
        return "", err
    }

    if strings.TrimSpace(namespace) == "" {
        return "", marketflow.ErrInvalidInput
    }

    id, err := generator.NewID(ctx, namespace)
    if err != nil {
        return "", err
    }

    if strings.TrimSpace(string(id)) == "" {
        return "", ErrInvalidGeneratedID
    }

    return id, nil
}

func applicationValidateAuditEvent(event marketflow.AuditEvent) error {
    if err := event.Validate(); err != nil {
        return fmt.Errorf(
            "%w: invalid audit event: %v",
            ErrRepositoryContractViolation,
            err,
        )
    }

    return nil
}

type MarketCatalogueGuard struct {
'@

    $services = Replace-TextExactlyOnce `
        -Source $services `
        -OldText $helperAnchor `
        -NewText $helpers `
        -Label "Application helper insertion"

    # -----------------------------------------------------------------
    # 08. MARKET / CATALOGUE GUARD
    # -----------------------------------------------------------------

    $replacement = @'
func (g MarketCatalogueGuard) ValidateOffer(
    ctx context.Context,
    offer marketflow.Offer,
) error {
    if err := validateApplicationContext(ctx); err != nil {
        return err
    }

    if g.Markets == nil || g.Categories == nil || g.Mappings == nil {
        return ErrDependencyMissing
    }

    if err := offer.Validate(); err != nil {
        return err
    }

    market, err := g.Markets.GetMarket(
        ctx,
        marketdomain.MarketID(offer.MarketID),
    )
    if err != nil {
        return err
    }

    if market == nil || !market.IsOperational() {
        return marketflow.ErrNotEligible
    }

    publicCategory, err := g.Categories.GetCategory(
        ctx,
        cataloguedomain.CategoryID(offer.PublicCategoryID),
    )
    if err != nil {
        return err
    }

    specializedCategory, err := g.Categories.GetCategory(
        ctx,
        cataloguedomain.CategoryID(offer.SpecializedCategoryID),
    )
    if err != nil {
        return err
    }

    if publicCategory == nil ||
        specializedCategory == nil ||
        !publicCategory.IsSelectable() ||
        !specializedCategory.IsSelectable() ||
        publicCategory.Kind() != cataloguedomain.CategoryKindGeneral ||
        specializedCategory.Kind() != cataloguedomain.CategoryKindSpecialized {
        return marketflow.ErrNotEligible
    }

    mapping, err := g.Mappings.GetMapping(
        ctx,
        marketdomain.MarketID(offer.MarketID),
        cataloguedomain.CategoryID(offer.PublicCategoryID),
        cataloguedomain.CategoryID(offer.SpecializedCategoryID),
    )
    if err != nil {
        return err
    }

    if mapping == nil || !mapping.IsUsable() {
        return marketflow.ErrNotEligible
    }

    return nil
}
'@

    $services = Replace-GoSection `
        -Source $services `
        -StartMarker "func (g MarketCatalogueGuard) ValidateOffer(" `
        -EndMarker "type OfferReadiness interface" `
        -Replacement $replacement `
        -Label "MarketCatalogueGuard.ValidateOffer"

    # -----------------------------------------------------------------
    # 09. OFFER LIFECYCLE
    # -----------------------------------------------------------------

    $replacement = @'
func (s *OfferLifecycleService) transition(
    ctx context.Context,
    cmd OfferCommand,
    permission string,
    action string,
) (marketflow.Offer, error) {
    if err := validateApplicationContext(ctx); err != nil {
        return marketflow.Offer{}, err
    }

    if s == nil ||
        s.Transactions == nil ||
        s.Offers == nil ||
        s.Identity == nil ||
        s.Readiness == nil ||
        s.Audit == nil ||
        s.IDs == nil ||
        s.Clock == nil {
        return marketflow.Offer{}, ErrDependencyMissing
    }

    if strings.TrimSpace(string(cmd.ActorID)) == "" ||
        strings.TrimSpace(string(cmd.OfferID)) == "" ||
        strings.TrimSpace(string(cmd.CorrelationID)) == "" ||
        cmd.ExpectedVersion == 0 {
        return marketflow.Offer{}, marketflow.ErrInvalidInput
    }

    if err := s.Identity.VerifyIdentity(ctx, cmd.ActorID); err != nil {
        return marketflow.Offer{}, err
    }

    if err := s.Identity.Authorize(ctx, cmd.ActorID, permission); err != nil {
        return marketflow.Offer{}, err
    }

    var result marketflow.Offer

    err := s.Transactions.WithinTransaction(
        ctx,
        func(txctx context.Context) error {
            if err := validateApplicationContext(txctx); err != nil {
                return err
            }

            offer, err := s.Offers.GetOffer(txctx, cmd.OfferID)
            if err != nil {
                return err
            }

            if offer.ID != cmd.OfferID {
                return ErrRepositoryContractViolation
            }

            if err := offer.Validate(); err != nil {
                return err
            }

            if offer.Version != cmd.ExpectedVersion {
                return ErrVersionConflict
            }

            previousVersion := offer.Version

            now, err := applicationNowUTC(s.Clock)
            if err != nil {
                return err
            }

            switch action {
            case "submit_for_review":
                if err := s.Readiness.ValidateOffer(txctx, offer); err != nil {
                    return err
                }

                err = offer.SubmitForReview(now)

            case "approve":
                err = offer.Approve(now)

            case "publish":
                if err := s.Readiness.ValidateOffer(txctx, offer); err != nil {
                    return err
                }

                err = offer.Publish(now)

            default:
                return marketflow.ErrInvalidInput
            }

            if err != nil {
                return err
            }

            if err := s.Offers.SaveOffer(
                txctx,
                offer,
                previousVersion,
            ); err != nil {
                return err
            }

            eventID, err := applicationNewID(
                txctx,
                s.IDs,
                "audit",
            )
            if err != nil {
                return err
            }

            event := marketflow.AuditEvent{
                ID:              eventID,
                AggregateType:   "offer",
                AggregateID:     offer.ID,
                Action:          action,
                ActorID:         cmd.ActorID,
                CorrelationID:   cmd.CorrelationID,
                PreviousVersion: previousVersion,
                NewVersion:      offer.Version,
                OccurredAt:      now,
            }

            if err := applicationValidateAuditEvent(event); err != nil {
                return err
            }

            if err := s.Audit.Append(txctx, event); err != nil {
                return err
            }

            result = offer
            return nil
        },
    )

    return result, err
}
'@

    $services = Replace-GoSection `
        -Source $services `
        -StartMarker "func (s *OfferLifecycleService) transition(" `
        -EndMarker "// Supply request selection." `
        -Replacement $replacement `
        -Label "OfferLifecycleService.transition"

    # -----------------------------------------------------------------
    # 10. SUPPLY REQUEST / PROPOSAL SELECTION
    # -----------------------------------------------------------------

    $replacement = @'
func (s *SupplyRequestService) SelectProposal(
    ctx context.Context,
    cmd SelectProposalCommand,
) (marketflow.SupplyRequest, error) {
    if err := validateApplicationContext(ctx); err != nil {
        return marketflow.SupplyRequest{}, err
    }

    if s == nil ||
        s.Transactions == nil ||
        s.Requests == nil ||
        s.Proposals == nil ||
        s.Validator == nil ||
        s.Identity == nil ||
        s.Audit == nil ||
        s.IDs == nil ||
        s.Clock == nil {
        return marketflow.SupplyRequest{}, ErrDependencyMissing
    }

    if cmd.ExpectedVersion == 0 ||
        strings.TrimSpace(string(cmd.ActorID)) == "" ||
        strings.TrimSpace(string(cmd.RequestID)) == "" ||
        strings.TrimSpace(string(cmd.ProposalID)) == "" ||
        strings.TrimSpace(string(cmd.CorrelationID)) == "" {
        return marketflow.SupplyRequest{}, marketflow.ErrInvalidInput
    }

    if err := s.Identity.VerifyIdentity(ctx, cmd.ActorID); err != nil {
        return marketflow.SupplyRequest{}, err
    }

    if err := s.Identity.Authorize(
        ctx,
        cmd.ActorID,
        "supply_requests.select_proposal",
    ); err != nil {
        return marketflow.SupplyRequest{}, err
    }

    var result marketflow.SupplyRequest

    err := s.Transactions.WithinTransaction(
        ctx,
        func(txctx context.Context) error {
            if err := validateApplicationContext(txctx); err != nil {
                return err
            }

            request, requestRevision, err :=
                s.Requests.GetForUpdate(txctx, cmd.RequestID)

            if err != nil {
                return err
            }

            if request.ID != cmd.RequestID || requestRevision == 0 {
                return ErrRepositoryContractViolation
            }

            if err := request.Validate(); err != nil {
                return err
            }

            if requestRevision != cmd.ExpectedVersion {
                return ErrVersionConflict
            }

            proposal, proposalRevision, err :=
                s.Proposals.GetForUpdate(txctx, cmd.ProposalID)

            if err != nil {
                return err
            }

            if proposalRevision == 0 ||
                proposal.ID != cmd.ProposalID ||
                proposal.RequestID != request.ID {
                return ErrRepositoryContractViolation
            }

            if proposal.State != marketflow.ProposalSubmitted {
                return marketflow.ErrNotEligible
            }

            if err := s.Validator.ValidateProposal(
                txctx,
                request,
                proposal,
            ); err != nil {
                return err
            }

            if err := marketflow.SelectProposal(
                &request,
                proposal,
            ); err != nil {
                return err
            }

            proposal.State = marketflow.ProposalAccepted

            if err := s.Proposals.Save(
                txctx,
                proposal,
                proposalRevision,
            ); err != nil {
                return err
            }

            if err := s.Requests.Save(
                txctx,
                request,
                requestRevision,
            ); err != nil {
                return err
            }

            if requestRevision == ^uint64(0) {
                return ErrRevisionOverflow
            }

            now, err := applicationNowUTC(s.Clock)
            if err != nil {
                return err
            }

            eventID, err := applicationNewID(
                txctx,
                s.IDs,
                "audit",
            )
            if err != nil {
                return err
            }

            event := marketflow.AuditEvent{
                ID:              eventID,
                AggregateType:   "supply_request",
                AggregateID:     request.ID,
                Action:          "proposal_selected",
                ActorID:         cmd.ActorID,
                CorrelationID:   cmd.CorrelationID,
                PreviousVersion: requestRevision,
                NewVersion:      requestRevision + 1,
                OccurredAt:      now,
                Metadata: map[string]string{
                    "proposal_id": string(proposal.ID),
                },
            }

            if err := applicationValidateAuditEvent(event); err != nil {
                return err
            }

            if err := s.Audit.Append(txctx, event); err != nil {
                return err
            }

            result = request
            return nil
        },
    )

    return result, err
}
'@

    $services = Replace-GoSection `
        -Source $services `
        -StartMarker "func (s *SupplyRequestService) SelectProposal(" `
        -EndMarker "// Order admission and resource reservation." `
        -Replacement $replacement `
        -Label "SupplyRequestService.SelectProposal"

    # -----------------------------------------------------------------
    # 11. ORDER NOTIONAL
    # -----------------------------------------------------------------

    $replacement = @'
func CalculateOrderNotional(order marketflow.Order) (int64, error) {
    switch order.Side {
    case marketflow.Buy:
        if order.Price <= 0 || order.Quantity <= 0 {
            return 0, marketflow.ErrInvalidInput
        }

        if order.Price > math.MaxInt64/order.Quantity {
            return 0, marketflow.ErrInvalidInput
        }

        return order.Price * order.Quantity, nil

    case marketflow.Sell:
        if order.Quantity <= 0 {
            return 0, marketflow.ErrInvalidInput
        }

        // Sell-side reservation is quantity-based and is handled by
        // My Assets. No monetary notional is sent for this side.
        return 0, nil

    default:
        return 0, marketflow.ErrInvalidInput
    }
}
'@

    $services = Replace-GoSection `
        -Source $services `
        -StartMarker "func CalculateOrderNotional(" `
        -EndMarker "func sameOrderIntent(" `
        -Replacement $replacement `
        -Label "CalculateOrderNotional"

    # -----------------------------------------------------------------
    # 12. ORDER ADMISSION / SAFE RESERVATION COMPENSATION
    # -----------------------------------------------------------------

    $replacement = @'
func (s *OrderAdmissionService) Place(
    ctx context.Context,
    cmd PlaceOrderCommand,
) (marketflow.Order, error) {
    if err := validateApplicationContext(ctx); err != nil {
        return marketflow.Order{}, err
    }

    if s == nil ||
        s.Transactions == nil ||
        s.Orders == nil ||
        s.Validator == nil ||
        s.Resources == nil ||
        s.Identity == nil ||
        s.Audit == nil ||
        s.IDs == nil ||
        s.Clock == nil {
        return marketflow.Order{}, ErrDependencyMissing
    }

    key := strings.TrimSpace(cmd.IdempotencyKey)

    if key == "" ||
        len(key) > applicationMaxIdempotencyKeyLength ||
        strings.TrimSpace(string(cmd.ActorID)) == "" ||
        strings.TrimSpace(string(cmd.CorrelationID)) == "" {
        return marketflow.Order{}, marketflow.ErrInvalidInput
    }

    order := cmd.Order

    if err := order.Validate(); err != nil {
        return marketflow.Order{}, err
    }

    if order.UserID != cmd.ActorID ||
        order.State != marketflow.OrderPending {
        return marketflow.Order{}, marketflow.ErrNotEligible
    }

    if err := s.Identity.VerifyIdentity(ctx, cmd.ActorID); err != nil {
        return marketflow.Order{}, err
    }

    if err := s.Identity.Authorize(
        ctx,
        cmd.ActorID,
        "orders.place",
    ); err != nil {
        return marketflow.Order{}, err
    }

    // First idempotency read:
    // a completed order must be replayed without creating a new reservation.
    existing, found, err := s.Orders.GetByIdempotencyKey(ctx, key)
    if err != nil {
        return marketflow.Order{}, err
    }

    if found {
        if !sameOrderIntent(existing, order) {
            return marketflow.Order{}, ErrIdempotencyConflict
        }

        return existing, nil
    }

    if err := s.Validator.ValidateOrder(ctx, order); err != nil {
        return marketflow.Order{}, err
    }

    notional, err := CalculateOrderNotional(order)
    if err != nil {
        return marketflow.Order{}, err
    }

    // External reservation is deliberately outside the DB transaction.
    reservationID, err := s.Resources.ReserveForOrder(
        ctx,
        order,
        notional,
        key,
    )

    if err != nil {
        if errors.Is(err, ErrExternalOutcomeUnknown) {
            return marketflow.Order{}, errors.Join(
                err,
                ErrReservationReconciliationRequired,
            )
        }

        return marketflow.Order{}, err
    }

    if strings.TrimSpace(string(reservationID)) == "" {
        // There is no safe identifier with which to release this reservation.
        // Treat this as a gateway contract violation and require reconciliation.
        return marketflow.Order{}, errors.Join(
            ErrInvalidReservationID,
            ErrReservationReconciliationRequired,
        )
    }

    var result marketflow.Order

    txErr := s.Transactions.WithinTransaction(
        ctx,
        func(txctx context.Context) error {
            if err := validateApplicationContext(txctx); err != nil {
                return err
            }

            // Second idempotency read closes the race between the initial
            // read and the reservation operation.
            current, exists, err := s.Orders.GetByIdempotencyKey(
                txctx,
                key,
            )

            if err != nil {
                return err
            }

            if exists {
                if !sameOrderIntent(current, order) {
                    return ErrIdempotencyConflict
                }

                result = current
                return nil
            }

            orderToSave := order

            if err := orderToSave.Open(); err != nil {
                return err
            }

            created, err := s.Orders.CreateOrder(
                txctx,
                orderToSave,
                key,
                reservationID,
            )

            if err != nil {
                return err
            }

            // A repository must not silently mutate the admitted intent.
            if err := created.Validate(); err != nil {
                return fmt.Errorf(
                    "%w: invalid created order: %v",
                    ErrRepositoryContractViolation,
                    err,
                )
            }

            if !sameOrderIntent(created, order) ||
                created.State != marketflow.OrderOpen ||
                created.Version != orderToSave.Version {
                return ErrRepositoryContractViolation
            }

            now, err := applicationNowUTC(s.Clock)
            if err != nil {
                return err
            }

            eventID, err := applicationNewID(
                txctx,
                s.IDs,
                "audit",
            )
            if err != nil {
                return err
            }

            event := marketflow.AuditEvent{
                ID:              eventID,
                AggregateType:   "order",
                AggregateID:     created.ID,
                Action:          "placed",
                ActorID:         cmd.ActorID,
                CorrelationID:   cmd.CorrelationID,
                PreviousVersion: order.Version,
                NewVersion:      created.Version,
                OccurredAt:      now,
                Metadata: map[string]string{
                    "reservation_id":  string(reservationID),
                    "idempotency_key": key,
                },
            }

            if err := applicationValidateAuditEvent(event); err != nil {
                return err
            }

            if err := s.Audit.Append(txctx, event); err != nil {
                return err
            }

            result = created
            return nil
        },
    )

    if txErr == nil {
        return result, nil
    }

    // A commit error may be ambiguous. Releasing the reservation without
    // determining whether the order committed could release live resources.
    if errors.Is(txErr, ErrTransactionOutcomeUnknown) {
        return marketflow.Order{}, errors.Join(
            txErr,
            ErrReservationReconciliationRequired,
        )
    }

    // Reconcile against the authoritative order repository before compensation.
    // A committed order, even if the caller received a commit error, must retain
    // its reservation.
    persisted, exists, reconcileErr :=
        s.Orders.GetByIdempotencyKey(ctx, key)

    if reconcileErr != nil {
        return marketflow.Order{}, errors.Join(
            txErr,
            ErrReservationReconciliationRequired,
            fmt.Errorf("order reconciliation read failed: %w", reconcileErr),
        )
    }

    if exists {
        if sameOrderIntent(persisted, order) {
            return persisted, nil
        }

        // The idempotency key belongs to another intent.
        // Do not release a reservation that may belong to that order.
        return marketflow.Order{}, ErrIdempotencyConflict
    }

    // Compensation is allowed only after a completed transaction failure
    // and a successful authoritative read proving that no order exists.
    releaseErr := s.Resources.ReleaseOrderResources(
        ctx,
        reservationID,
        key,
    )

    if releaseErr != nil {
        return marketflow.Order{}, errors.Join(
            txErr,
            ErrReservationCompensationFailed,
            ErrReservationReconciliationRequired,
            fmt.Errorf("reservation compensation failed: %w", releaseErr),
        )
    }

    return marketflow.Order{}, txErr
}
'@

    $services = Replace-GoSection `
        -Source $services `
        -StartMarker "func (s *OrderAdmissionService) Place(" `
        -EndMarker "// Matching is performed only inside a transaction" `
        -Replacement $replacement `
        -Label "OrderAdmissionService.Place"

    # -----------------------------------------------------------------
    # 13. MATCHING
    # -----------------------------------------------------------------

    $replacement = @'
func (s *MatchingService) MatchNext(
    ctx context.Context,
    marketID marketflow.ID,
    offerID marketflow.ID,
) (MatchRecord, error) {
    if err := validateApplicationContext(ctx); err != nil {
        return MatchRecord{}, err
    }

    if s == nil ||
        s.Transactions == nil ||
        s.Book == nil ||
        s.IDs == nil ||
        s.Clock == nil {
        return MatchRecord{}, ErrDependencyMissing
    }

    if strings.TrimSpace(string(marketID)) == "" ||
        strings.TrimSpace(string(offerID)) == "" {
        return MatchRecord{}, marketflow.ErrInvalidInput
    }

    var result MatchRecord

    err := s.Transactions.WithinTransaction(
        ctx,
        func(txctx context.Context) error {
            if err := validateApplicationContext(txctx); err != nil {
                return err
            }

            buy, sell, err := s.Book.LockBestCrossingPair(
                txctx,
                marketID,
                offerID,
            )

            if err != nil {
                return err
            }

            if err := buy.Validate(); err != nil {
                return fmt.Errorf(
                    "%w: invalid buy order: %v",
                    ErrRepositoryContractViolation,
                    err,
                )
            }

            if err := sell.Validate(); err != nil {
                return fmt.Errorf(
                    "%w: invalid sell order: %v",
                    ErrRepositoryContractViolation,
                    err,
                )
            }

            if buy.ID == sell.ID ||
                buy.Side != marketflow.Buy ||
                sell.Side != marketflow.Sell ||
                buy.MarketID != marketID ||
                sell.MarketID != marketID ||
                buy.OfferID != offerID ||
                sell.OfferID != offerID {
                return ErrRepositoryContractViolation
            }

            originalBuyVersion := buy.Version
            originalSellVersion := sell.Version

            match, err := marketflow.MatchOrders(&buy, &sell)
            if err != nil {
                return err
            }

            matchID, err := applicationNewID(
                txctx,
                s.IDs,
                "match",
            )
            if err != nil {
                return err
            }

            now, err := applicationNowUTC(s.Clock)
            if err != nil {
                return err
            }

            record := MatchRecord{
                ID:          matchID,
                MarketID:    buy.MarketID,
                OfferID:     buy.OfferID,
                BuyOrderID:  match.BuyOrderID,
                SellOrderID: match.SellOrderID,
                BuyerID:     buy.UserID,
                SellerID:    sell.UserID,
                Quantity:    match.Quantity,
                Price:       match.Price,
                CreatedAt:   now,
            }

            if record.Quantity <= 0 ||
                record.Price <= 0 ||
                record.BuyOrderID != buy.ID ||
                record.SellOrderID != sell.ID ||
                record.BuyerID == record.SellerID {
                return ErrRepositoryContractViolation
            }

            if err := s.Book.SaveOrder(
                txctx,
                buy,
                originalBuyVersion,
            ); err != nil {
                return err
            }

            if err := s.Book.SaveOrder(
                txctx,
                sell,
                originalSellVersion,
            ); err != nil {
                return err
            }

            if err := s.Book.SaveMatch(
                txctx,
                record,
                "match:"+string(matchID),
            ); err != nil {
                return err
            }

            result = record
            return nil
        },
    )

    if errors.Is(err, ErrNoCrossingOrders) {
        return MatchRecord{}, ErrNoCrossingOrders
    }

    return result, err
}
'@

    $services = Replace-GoSection `
        -Source $services `
        -StartMarker "func (s *MatchingService) MatchNext(" `
        -EndMarker "// Trade state dimensions are updated independently." `
        -Replacement $replacement `
        -Label "MatchingService.MatchNext"

    # -----------------------------------------------------------------
    # 14. TRADE STATUS DIMENSIONS
    # -----------------------------------------------------------------

    $replacement = @'
func (s *TradeWorkflowService) UpdateStatus(
    ctx context.Context,
    cmd TradeStatusCommand,
) (marketflow.Trade, error) {
    if err := validateApplicationContext(ctx); err != nil {
        return marketflow.Trade{}, err
    }

    if s == nil ||
        s.Transactions == nil ||
        s.Trades == nil ||
        s.Clock == nil {
        return marketflow.Trade{}, ErrDependencyMissing
    }

    if cmd.ExpectedVersion == 0 ||
        strings.TrimSpace(string(cmd.TradeID)) == "" {
        return marketflow.Trade{}, marketflow.ErrInvalidInput
    }

    var result marketflow.Trade

    err := s.Transactions.WithinTransaction(
        ctx,
        func(txctx context.Context) error {
            if err := validateApplicationContext(txctx); err != nil {
                return err
            }

            trade, err := s.Trades.GetForUpdate(
                txctx,
                cmd.TradeID,
            )

            if err != nil {
                return err
            }

            if trade.ID != cmd.TradeID {
                return ErrRepositoryContractViolation
            }

            if err := trade.Validate(); err != nil {
                return err
            }

            var currentValue string

            switch cmd.Dimension {
            case DimensionContract:
                currentValue = string(trade.Contract)

            case DimensionServices:
                currentValue = string(trade.Services)

            case DimensionDelivery:
                currentValue = string(trade.Delivery)

            default:
                return ErrInvalidTradeDimension
            }

            // A repeated command that has already achieved its desired
            // state is a successful no-op, even if its original version
            // is now stale.
            if currentValue == cmd.Value {
                result = trade
                return nil
            }

            if trade.Version != cmd.ExpectedVersion {
                return ErrVersionConflict
            }

            switch cmd.Dimension {
            case DimensionContract:
                value := marketflow.ContractState(cmd.Value)

                switch value {
                case marketflow.ContractPending,
                    marketflow.ContractCreated,
                    marketflow.ContractFailed,
                    marketflow.ContractNotRequired:
                    trade.Contract = value

                default:
                    return ErrInvalidTradeDimension
                }

            case DimensionServices:
                value := marketflow.ServiceState(cmd.Value)

                switch value {
                case marketflow.ServicePending,
                    marketflow.ServiceInProgress,
                    marketflow.ServiceCompleted,
                    marketflow.ServiceFailed,
                    marketflow.ServiceNotRequired:
                    trade.Services = value

                default:
                    return ErrInvalidTradeDimension
                }

            case DimensionDelivery:
                value := marketflow.DeliveryState(cmd.Value)

                switch value {
                case marketflow.DeliveryPending,
                    marketflow.DeliveryConfirmed,
                    marketflow.DeliveryFailed,
                    marketflow.DeliveryNotRequired:
                    trade.Delivery = value

                default:
                    return ErrInvalidTradeDimension
                }

            default:
                return ErrInvalidTradeDimension
            }

            if trade.Version == ^uint64(0) {
                return ErrRevisionOverflow
            }

            now, err := applicationNowUTC(s.Clock)
            if err != nil {
                return err
            }

            if now.Before(trade.UpdatedAt) {
                return ErrInvalidClock
            }

            trade.RecalculateSettlementReadiness()
            trade.Version++
            trade.UpdatedAt = now

            if err := trade.Validate(); err != nil {
                return err
            }

            if err := s.Trades.Save(
                txctx,
                trade,
                cmd.ExpectedVersion,
            ); err != nil {
                return err
            }

            result = trade
            return nil
        },
    )

    return result, err
}
'@

    $services = Replace-GoSection `
        -Source $services `
        -StartMarker "func (s *TradeWorkflowService) UpdateStatus(" `
        -EndMarker "func RequireSettlementReadiness(" `
        -Replacement $replacement `
        -Label "TradeWorkflowService.UpdateStatus"

    # -----------------------------------------------------------------
    # 15. EXECUTION POLICY GRAPH VALIDATION
    # -----------------------------------------------------------------

    $replacement = @'
func ValidateExecutionPolicy(policy marketflow.ExecutionPolicy) error {
    if err := policy.Validate(); err != nil {
        return err
    }

    steps := make(map[string]marketflow.ExecutionStep, len(policy.Steps))
    orders := make(map[int]bool, len(policy.Steps))
    codes := make([]string, 0, len(policy.Steps))

    for _, step := range policy.Steps {
        if strings.TrimSpace(step.Code) != step.Code ||
            step.Code == "" {
            return ErrInvalidPolicyGraph
        }

        if orders[step.Order] {
            return ErrInvalidPolicyGraph
        }

        if _, exists := steps[step.Code]; exists {
            return ErrInvalidPolicyGraph
        }

        orders[step.Order] = true
        steps[step.Code] = step
        codes = append(codes, step.Code)
    }

    // A dependency may appear only once in a step.
    // Every dependency must precede the dependent step.
    for _, step := range policy.Steps {
        dependencies := make(map[string]struct{}, len(step.DependsOn))

        for _, dependency := range step.DependsOn {
            if _, duplicate := dependencies[dependency]; duplicate {
                return ErrInvalidPolicyGraph
            }

            dependencies[dependency] = struct{}{}

            dependencyStep, exists := steps[dependency]

            if !exists ||
                dependency == step.Code ||
                dependencyStep.Order >= step.Order {
                return ErrInvalidPolicyGraph
            }
        }
    }

    // Deterministic traversal makes failures reproducible.
    sort.Strings(codes)

    state := make(map[string]uint8, len(steps))

    var visit func(string) error

    visit = func(code string) error {
        switch state[code] {
        case 1:
            return ErrInvalidPolicyGraph

        case 2:
            return nil
        }

        step, exists := steps[code]
        if !exists {
            return ErrInvalidPolicyGraph
        }

        state[code] = 1

        dependencies := append([]string(nil), step.DependsOn...)
        sort.Strings(dependencies)

        for _, dependency := range dependencies {
            if _, exists := steps[dependency]; !exists {
                return ErrInvalidPolicyGraph
            }

            if err := visit(dependency); err != nil {
                return err
            }
        }

        state[code] = 2
        return nil
    }

    for _, code := range codes {
        if err := visit(code); err != nil {
            return err
        }
    }

    return nil
}
'@

    $services = Replace-GoSection `
        -Source $services `
        -StartMarker "func ValidateExecutionPolicy(" `
        -EndMarker "type CompleteExecutionStepCommand struct" `
        -Replacement $replacement `
        -Label "ValidateExecutionPolicy"

    # -----------------------------------------------------------------
    # 16. EXECUTION PROGRESS
    # -----------------------------------------------------------------

    $replacement = @'
func (s *ExecutionProgressService) CompleteStep(
    ctx context.Context,
    policy marketflow.ExecutionPolicy,
    cmd CompleteExecutionStepCommand,
) error {
    if err := validateApplicationContext(ctx); err != nil {
        return err
    }

    if s == nil ||
        s.Transactions == nil ||
        s.Progress == nil {
        return ErrDependencyMissing
    }

    if strings.TrimSpace(string(cmd.TradeID)) == "" ||
        strings.TrimSpace(cmd.StepCode) == "" ||
        cmd.ExpectedRevision == 0 {
        return marketflow.ErrInvalidInput
    }

    if !policy.Active {
        return marketflow.ErrNotEligible
    }

    if err := ValidateExecutionPolicy(policy); err != nil {
        return err
    }

    return s.Transactions.WithinTransaction(
        ctx,
        func(txctx context.Context) error {
            if err := validateApplicationContext(txctx); err != nil {
                return err
            }

            progress, revision, err := s.Progress.GetForUpdate(
                txctx,
                cmd.TradeID,
            )

            if err != nil {
                return err
            }

            if progress.TradeID != cmd.TradeID {
                return marketflow.ErrNotEligible
            }

            if progress.PolicyID != policy.ID ||
                progress.PolicyVersion != policy.Version {
                return marketflow.ErrConflict
            }

            if revision == 0 {
                return ErrRepositoryContractViolation
            }

            stepExists := false

            for _, step := range policy.Steps {
                if step.Code == cmd.StepCode {
                    stepExists = true
                    break
                }
            }

            if !stepExists {
                return marketflow.ErrNotFound
            }

            // Natural idempotency:
            // completing an already-completed step is a no-op.
            // This check intentionally precedes the revision comparison.
            if progress.CompletedSteps[cmd.StepCode] {
                return nil
            }

            if revision != cmd.ExpectedRevision {
                return ErrVersionConflict
            }

            if err := progress.CanComplete(
                policy,
                cmd.StepCode,
            ); err != nil {
                return err
            }

            if progress.CompletedSteps == nil {
                progress.CompletedSteps = make(map[string]bool)
            }

            progress.CompletedSteps[cmd.StepCode] = true

            return s.Progress.Save(
                txctx,
                progress,
                revision,
            )
        },
    )
}
'@

    $services = Replace-GoSection `
        -Source $services `
        -StartMarker "func (s *ExecutionProgressService) CompleteStep(" `
        -EndMarker "// Overflow-safe aggregation." `
        -Replacement $replacement `
        -Label "ExecutionProgressService.CompleteStep"

    # -----------------------------------------------------------------
    # 17. LEGAL EXTERNAL REQUESTS
    # -----------------------------------------------------------------

    $replacement = @'
func (s *LegalRequestService) Submit(
    ctx context.Context,
    actorID marketflow.ID,
    request marketflow.ExternalRequest,
    grantedScopes []string,
) (string, error) {
    if err := validateApplicationContext(ctx); err != nil {
        return "", err
    }

    if s == nil || s.Identity == nil || s.Gateway == nil {
        return "", ErrDependencyMissing
    }

    if strings.TrimSpace(string(actorID)) == "" {
        return "", marketflow.ErrInvalidInput
    }

    if err := s.Identity.VerifyIdentity(ctx, actorID); err != nil {
        return "", err
    }

    if err := s.Identity.Authorize(
        ctx,
        actorID,
        "legal.external.submit",
    ); err != nil {
        return "", err
    }

    if err := request.ValidateAuthorization(grantedScopes); err != nil {
        return "", err
    }

    trackingID, err := s.Gateway.SubmitAuthorizedRequest(
        ctx,
        request,
    )

    if err != nil {
        return "", err
    }

    if strings.TrimSpace(trackingID) == "" {
        return "", ErrExternalOutcomeUnknown
    }

    return trackingID, nil
}

// GetRequestResult retrieves a previously submitted request using the
// external tracking identifier. It does not create or resubmit a request.
func (s *LegalRequestService) GetRequestResult(
    ctx context.Context,
    actorID marketflow.ID,
    trackingID string,
) (string, error) {
    if err := validateApplicationContext(ctx); err != nil {
        return "", err
    }

    if s == nil || s.Identity == nil || s.Gateway == nil {
        return "", ErrDependencyMissing
    }

    if strings.TrimSpace(string(actorID)) == "" ||
        strings.TrimSpace(trackingID) == "" {
        return "", marketflow.ErrInvalidInput
    }

    if err := s.Identity.VerifyIdentity(ctx, actorID); err != nil {
        return "", err
    }

    if err := s.Identity.Authorize(
        ctx,
        actorID,
        "legal.external.read",
    ); err != nil {
        return "", err
    }

    return s.Gateway.GetRequestResult(ctx, trackingID)
}
'@

    $services = Replace-GoSection `
        -Source $services `
        -StartMarker "func (s *LegalRequestService) Submit(" `
        -EndMarker "// Platform position is deliberately independent" `
        -Replacement $replacement `
        -Label "LegalRequestService.Submit"

    # -----------------------------------------------------------------
    # 18. WRITE HARDENED SOURCE IN MEMORY TO DISK
    # -----------------------------------------------------------------

    Write-Section "APPLY APPLICATION SOURCE CHANGES"

    $Script:ChangesStarted = $true

    Write-AtomicUtf8 -Path $portsPath -Content $ports
    Write-AtomicUtf8 -Path $servicesPath -Content $services

    $Script:NewFiles += $newTestRelative

    # -----------------------------------------------------------------
    # 19. INTERACTION AND REGRESSION TESTS
    # -----------------------------------------------------------------

    $hardeningTests = @'
package application

import (
    "context"
    "errors"
    "math"
    "testing"
    "time"

    "github.com/igd-tesa/real-asset-management-platform/general-market-backend/internal/marketflow"
)

// APPLICATION_PACKAGE_01_HARDENING_V1

type package01Transaction struct {
    afterCallbackError error
    calls              int
}

func (f *package01Transaction) WithinTransaction(
    ctx context.Context,
    callback func(context.Context) error,
) error {
    f.calls++

    if err := callback(ctx); err != nil {
        return err
    }

    return f.afterCallbackError
}

type package01Clock struct {
    now time.Time
}

func (f package01Clock) Now() time.Time {
    return f.now
}

type package01IDs struct{}

func (package01IDs) NewID(
    _ context.Context,
    namespace string,
) (marketflow.ID, error) {
    return marketflow.ID(namespace + "-test-id"), nil
}

type package01Identity struct {
    verifyError    error
    authorizeError error
}

func (f package01Identity) VerifyIdentity(
    _ context.Context,
    _ marketflow.ID,
) error {
    return f.verifyError
}

func (f package01Identity) Authorize(
    _ context.Context,
    _ marketflow.ID,
    _ string,
) error {
    return f.authorizeError
}

type package01Audit struct {
    events []marketflow.AuditEvent
    err    error
}

func (f *package01Audit) Append(
    _ context.Context,
    event marketflow.AuditEvent,
) error {
    if f.err != nil {
        return f.err
    }

    f.events = append(f.events, event)
    return nil
}

func (f *package01Audit) ListByAggregate(
    _ context.Context,
    _ string,
    _ marketflow.ID,
    _ int,
) ([]marketflow.AuditEvent, error) {
    return append([]marketflow.AuditEvent(nil), f.events...), nil
}

type package01OrderValidator struct {
    err   error
    calls int
}

func (f *package01OrderValidator) ValidateOrder(
    _ context.Context,
    _ marketflow.Order,
) error {
    f.calls++
    return f.err
}

type package01Resources struct {
    reservationID marketflow.ID
    reserveError  error
    releaseError  error
    reserveCalls  int
    releaseCalls  int
}

func (f *package01Resources) ReserveForOrder(
    _ context.Context,
    _ marketflow.Order,
    _ int64,
    _ string,
) (marketflow.ID, error) {
    f.reserveCalls++

    if f.reserveError != nil {
        return "", f.reserveError
    }

    return f.reservationID, nil
}

func (f *package01Resources) ReleaseOrderResources(
    _ context.Context,
    _ marketflow.ID,
    _ string,
) error {
    f.releaseCalls++
    return f.releaseError
}

type package01OrderRepository struct {
    orders     map[string]marketflow.Order
    getCalls   int
    getErrors  map[int]error
    createErr  error
    createCall int
}

func (f *package01OrderRepository) GetByIdempotencyKey(
    _ context.Context,
    key string,
) (marketflow.Order, bool, error) {
    f.getCalls++

    if err := f.getErrors[f.getCalls]; err != nil {
        return marketflow.Order{}, false, err
    }

    order, found := f.orders[key]
    return order, found, nil
}

func (f *package01OrderRepository) CreateOrder(
    _ context.Context,
    order marketflow.Order,
    key string,
    _ marketflow.ID,
) (marketflow.Order, error) {
    f.createCall++

    if f.createErr != nil {
        return marketflow.Order{}, f.createErr
    }

    if _, exists := f.orders[key]; exists {
        return marketflow.Order{}, ErrIdempotencyConflict
    }

    if f.orders == nil {
        f.orders = make(map[string]marketflow.Order)
    }

    f.orders[key] = order
    return order, nil
}

func package01Now() time.Time {
    return time.Date(2026, 11, 5, 12, 0, 0, 0, time.UTC)
}

func package01Order() marketflow.Order {
    return marketflow.Order{
        ID:        "order-1",
        OfferID:   "offer-1",
        MarketID:  "market-1",
        UserID:    "user-1",
        Side:      marketflow.Buy,
        Price:     100,
        Quantity:  5,
        Filled:    0,
        State:     marketflow.OrderPending,
        CreatedAt: package01Now(),
        Version:   1,
    }
}

func package01OrderService(
    tx *package01Transaction,
    repo *package01OrderRepository,
    resources *package01Resources,
) *OrderAdmissionService {
    return &OrderAdmissionService{
        Transactions: tx,
        Orders:       repo,
        Validator:    &package01OrderValidator{},
        Resources:    resources,
        Identity:     package01Identity{},
        Audit:        &package01Audit{},
        IDs:          package01IDs{},
        Clock:        package01Clock{now: package01Now()},
    }
}

func package01PlaceCommand(order marketflow.Order) PlaceOrderCommand {
    return PlaceOrderCommand{
        ActorID:        order.UserID,
        Order:          order,
        IdempotencyKey: "order-idempotency-1",
        CorrelationID:  "correlation-1",
    }
}

func TestPackage01CalculateOrderNotionalRejectsInvalidSide(t *testing.T) {
    order := package01Order()
    order.Side = marketflow.OrderSide("unknown")

    if _, err := CalculateOrderNotional(order); !errors.Is(
        err,
        marketflow.ErrInvalidInput,
    ) {
        t.Fatalf("expected invalid input, got %v", err)
    }
}

func TestPackage01CalculateSellNotionalRequiresPositiveQuantity(t *testing.T) {
    order := package01Order()
    order.Side = marketflow.Sell
    order.Quantity = 0

    if _, err := CalculateOrderNotional(order); !errors.Is(
        err,
        marketflow.ErrInvalidInput,
    ) {
        t.Fatalf("expected invalid input, got %v", err)
    }
}

func TestPackage01CalculateBuyNotionalRejectsOverflow(t *testing.T) {
    order := package01Order()
    order.Price = math.MaxInt64
    order.Quantity = 2

    if _, err := CalculateOrderNotional(order); !errors.Is(
        err,
        marketflow.ErrInvalidInput,
    ) {
        t.Fatalf("expected overflow rejection, got %v", err)
    }
}

func TestPackage01PlaceOrderReplaysExistingOrderWithoutReservation(t *testing.T) {
    order := package01Order()
    order.State = marketflow.OrderOpen
    order.Version = 2

    repo := &package01OrderRepository{
        orders: map[string]marketflow.Order{
            "order-idempotency-1": order,
        },
        getErrors: make(map[int]error),
    }

    resources := &package01Resources{
        reservationID: "reservation-1",
    }

    tx := &package01Transaction{}
    service := package01OrderService(tx, repo, resources)

    result, err := service.Place(
        context.Background(),
        package01PlaceCommand(package01Order()),
    )

    if err != nil {
        t.Fatal(err)
    }

    if result.ID != order.ID {
        t.Fatalf("expected existing order %s, got %s", order.ID, result.ID)
    }

    if resources.reserveCalls != 0 {
        t.Fatalf("reservation must not be repeated; calls=%d", resources.reserveCalls)
    }

    if tx.calls != 0 {
        t.Fatalf("transaction must not run for a completed replay; calls=%d", tx.calls)
    }
}

func TestPackage01PlaceOrderCompensatesOnlyAfterConfirmedAbsence(t *testing.T) {
    createError := errors.New("order insert failed")

    repo := &package01OrderRepository{
        orders:    make(map[string]marketflow.Order),
        getErrors: make(map[int]error),
        createErr: createError,
    }

    resources := &package01Resources{
        reservationID: "reservation-1",
    }

    tx := &package01Transaction{}
    service := package01OrderService(tx, repo, resources)

    _, err := service.Place(
        context.Background(),
        package01PlaceCommand(package01Order()),
    )

    if !errors.Is(err, createError) {
        t.Fatalf("expected original create error, got %v", err)
    }

    if resources.reserveCalls != 1 {
        t.Fatalf("expected one reservation, got %d", resources.reserveCalls)
    }

    if resources.releaseCalls != 1 {
        t.Fatalf("expected one compensation, got %d", resources.releaseCalls)
    }
}

func TestPackage01PlaceOrderReconcilesCommittedOrderAfterCommitError(t *testing.T) {
    tx := &package01Transaction{
        afterCallbackError: errors.New("commit acknowledgement lost"),
    }

    repo := &package01OrderRepository{
        orders:    make(map[string]marketflow.Order),
        getErrors: make(map[int]error),
    }

    resources := &package01Resources{
        reservationID: "reservation-1",
    }

    service := package01OrderService(tx, repo, resources)

    result, err := service.Place(
        context.Background(),
        package01PlaceCommand(package01Order()),
    )

    if err != nil {
        t.Fatalf("committed order should be reconciled: %v", err)
    }

    if result.ID != "order-1" {
        t.Fatalf("unexpected reconciled order: %s", result.ID)
    }

    if resources.releaseCalls != 0 {
        t.Fatalf("committed order reservation was released")
    }
}

func TestPackage01PlaceOrderDoesNotReleaseOnUnknownTransactionOutcome(t *testing.T) {
    tx := &package01Transaction{
        afterCallbackError: ErrTransactionOutcomeUnknown,
    }

    repo := &package01OrderRepository{
        orders:    make(map[string]marketflow.Order),
        getErrors: make(map[int]error),
    }

    resources := &package01Resources{
        reservationID: "reservation-1",
    }

    service := package01OrderService(tx, repo, resources)

    _, err := service.Place(
        context.Background(),
        package01PlaceCommand(package01Order()),
    )

    if !errors.Is(err, ErrReservationReconciliationRequired) {
        t.Fatalf("expected reconciliation requirement, got %v", err)
    }

    if resources.releaseCalls != 0 {
        t.Fatalf("reservation must not be released on unknown commit outcome")
    }
}

func TestPackage01PlaceOrderDoesNotReleaseWhenReconciliationReadFails(t *testing.T) {
    createError := errors.New("order insert failed")
    readError := errors.New("repository unavailable")

    repo := &package01OrderRepository{
        orders:    make(map[string]marketflow.Order),
        getErrors: map[int]error{3: readError},
        createErr: createError,
    }

    resources := &package01Resources{
        reservationID: "reservation-1",
    }

    service := package01OrderService(
        &package01Transaction{},
        repo,
        resources,
    )

    _, err := service.Place(
        context.Background(),
        package01PlaceCommand(package01Order()),
    )

    if !errors.Is(err, ErrReservationReconciliationRequired) {
        t.Fatalf("expected reconciliation requirement, got %v", err)
    }

    if resources.releaseCalls != 0 {
        t.Fatalf("reservation must be retained when order state is unknown")
    }
}

type package01Book struct {
    buy        marketflow.Order
    sell       marketflow.Order
    lockError  error
    saveOrders int
    saveMatches int
}

func (f *package01Book) LockBestCrossingPair(
    _ context.Context,
    _ marketflow.ID,
    _ marketflow.ID,
) (marketflow.Order, marketflow.Order, error) {
    return f.buy, f.sell, f.lockError
}

func (f *package01Book) SaveOrder(
    _ context.Context,
    _ marketflow.Order,
    _ uint64,
) error {
    f.saveOrders++
    return nil
}

func (f *package01Book) SaveMatch(
    _ context.Context,
    _ MatchRecord,
    _ string,
) error {
    f.saveMatches++
    return nil
}

func package01OpenOrder(
    id marketflow.ID,
    side marketflow.OrderSide,
    price int64,
) marketflow.Order {
    return marketflow.Order{
        ID:        id,
        OfferID:   "offer-1",
        MarketID:  "market-1",
        UserID:    marketflow.ID("user-" + string(id)),
        Side:      side,
        Price:     price,
        Quantity:  10,
        Filled:    0,
        State:     marketflow.OrderOpen,
        CreatedAt: package01Now(),
        Version:   1,
    }
}

func TestPackage01MatchingRejectsPairOutsideRequestedMarket(t *testing.T) {
    buy := package01OpenOrder("buy-1", marketflow.Buy, 110)
    sell := package01OpenOrder("sell-1", marketflow.Sell, 100)

    buy.MarketID = "another-market"
    sell.MarketID = "another-market"

    book := &package01Book{
        buy:  buy,
        sell: sell,
    }

    service := &MatchingService{
        Transactions: &package01Transaction{},
        Book:         book,
        IDs:          package01IDs{},
        Clock:        package01Clock{now: package01Now()},
    }

    _, err := service.MatchNext(
        context.Background(),
        "market-1",
        "offer-1",
    )

    if !errors.Is(err, ErrRepositoryContractViolation) {
        t.Fatalf("expected repository contract violation, got %v", err)
    }

    if book.saveOrders != 0 || book.saveMatches != 0 {
        t.Fatal("invalid repository pair must not be persisted")
    }
}

type package01ProgressRepository struct {
    progress  marketflow.ExecutionProgress
    revision  uint64
    saveCalls int
}

func (f *package01ProgressRepository) GetForUpdate(
    _ context.Context,
    _ marketflow.ID,
) (marketflow.ExecutionProgress, uint64, error) {
    return f.progress, f.revision, nil
}

func (f *package01ProgressRepository) Save(
    _ context.Context,
    progress marketflow.ExecutionProgress,
    expected uint64,
) error {
    if expected != f.revision {
        return ErrVersionConflict
    }

    f.saveCalls++
    f.progress = progress
    f.revision++
    return nil
}

func package01Policy() marketflow.ExecutionPolicy {
    return marketflow.ExecutionPolicy{
        ID:              "policy-1",
        Name:            "Package 01 policy",
        Version:         1,
        OfferCategoryID: "category-1",
        Active:          true,
        CreatedAt:       package01Now(),
        Steps: []marketflow.ExecutionStep{
            {
                Code:        "contract",
                Order:       1,
                Requirement: marketflow.StepRequired,
            },
            {
                Code:        "delivery",
                Order:       2,
                Requirement: marketflow.StepRequired,
                DependsOn:   []string{"contract"},
            },
        },
    }
}

func TestPackage01ExecutionProgressIdempotentReplayPrecedesRevisionCheck(t *testing.T) {
    repo := &package01ProgressRepository{
        progress: marketflow.ExecutionProgress{
            TradeID:       "trade-1",
            PolicyID:      "policy-1",
            PolicyVersion: 1,
            CompletedSteps: map[string]bool{
                "delivery": true,
            },
        },
        revision: 5,
    }

    service := &ExecutionProgressService{
        Transactions: &package01Transaction{},
        Progress:     repo,
    }

    err := service.CompleteStep(
        context.Background(),
        package01Policy(),
        CompleteExecutionStepCommand{
            TradeID:          "trade-1",
            StepCode:         "delivery",
            ExpectedRevision: 4,
        },
    )

    if err != nil {
        t.Fatalf("completed step replay should succeed: %v", err)
    }

    if repo.saveCalls != 0 {
        t.Fatalf("completed step replay must not write again")
    }
}

func TestPackage01ExecutionProgressRejectsDifferentTrade(t *testing.T) {
    repo := &package01ProgressRepository{
        progress: marketflow.ExecutionProgress{
            TradeID:       "another-trade",
            PolicyID:      "policy-1",
            PolicyVersion: 1,
        },
        revision: 1,
    }

    service := &ExecutionProgressService{
        Transactions: &package01Transaction{},
        Progress:     repo,
    }

    err := service.CompleteStep(
        context.Background(),
        package01Policy(),
        CompleteExecutionStepCommand{
            TradeID:          "trade-1",
            StepCode:         "contract",
            ExpectedRevision: 1,
        },
    )

    if !errors.Is(err, marketflow.ErrNotEligible) {
        t.Fatalf("expected trade mismatch rejection, got %v", err)
    }
}

type package01TradeRepository struct {
    trade     marketflow.Trade
    saveCalls int
}

func (f *package01TradeRepository) GetForUpdate(
    _ context.Context,
    _ marketflow.ID,
) (marketflow.Trade, error) {
    return f.trade, nil
}

func (f *package01TradeRepository) Save(
    _ context.Context,
    trade marketflow.Trade,
    _ uint64,
) error {
    f.saveCalls++
    f.trade = trade
    return nil
}

func package01Trade() marketflow.Trade {
    return marketflow.Trade{
        ID:          "trade-1",
        BuyOrderID:  "buy-1",
        SellOrderID: "sell-1",
        BuyerID:     "buyer-1",
        SellerID:    "seller-1",
        OfferID:     "offer-1",
        Quantity:    10,
        Price:       100,
        State:       marketflow.TradeExecuting,
        Contract:    marketflow.ContractCreated,
        Services:    marketflow.ServicePending,
        Delivery:    marketflow.DeliveryPending,
        CreatedAt:   package01Now(),
        UpdatedAt:   package01Now(),
        Version:     3,
    }
}

func TestPackage01TradeSameDimensionValueIsIdempotent(t *testing.T) {
    repo := &package01TradeRepository{
        trade: package01Trade(),
    }

    service := &TradeWorkflowService{
        Transactions: &package01Transaction{},
        Trades:       repo,
        Clock:        package01Clock{now: package01Now()},
    }

    result, err := service.UpdateStatus(
        context.Background(),
        TradeStatusCommand{
            TradeID:         "trade-1",
            ExpectedVersion: 2,
            Dimension:       DimensionContract,
            Value:           string(marketflow.ContractCreated),
        },
    )

    if err != nil {
        t.Fatal(err)
    }

    if result.Version != 3 {
        t.Fatalf("idempotent update changed version: %d", result.Version)
    }

    if repo.saveCalls != 0 {
        t.Fatal("same-value update must not write")
    }
}

func TestPackage01ExecutionPolicyRejectsDuplicateDependency(t *testing.T) {
    policy := package01Policy()

    policy.Steps[1].DependsOn = []string{
        "contract",
        "contract",
    }

    if err := ValidateExecutionPolicy(policy); !errors.Is(
        err,
        ErrInvalidPolicyGraph,
    ) {
        t.Fatalf("expected invalid policy graph, got %v", err)
    }
}

func TestPackage01ExecutionPolicyAcceptsValidDependencies(t *testing.T) {
    if err := ValidateExecutionPolicy(package01Policy()); err != nil {
        t.Fatalf("valid policy rejected: %v", err)
    }
}

func TestPackage01ApplicationClockRejectsZeroTime(t *testing.T) {
    _, err := applicationNowUTC(package01Clock{})

    if !errors.Is(err, ErrInvalidClock) {
        t.Fatalf("expected invalid clock error, got %v", err)
    }
}

func TestPackage01ApplicationIDRejectsEmptyIdentifier(t *testing.T) {
    generator := package01EmptyIDGenerator{}

    _, err := applicationNewID(
        context.Background(),
        generator,
        "audit",
    )

    if !errors.Is(err, ErrInvalidGeneratedID) {
        t.Fatalf("expected invalid generated ID, got %v", err)
    }
}

type package01EmptyIDGenerator struct{}

func (package01EmptyIDGenerator) NewID(
    context.Context,
    string,
) (marketflow.ID, error) {
    return "", nil
}

func TestPackage01ApplicationContextPropagatesCancellation(t *testing.T) {
    ctx, cancel := context.WithCancel(context.Background())
    cancel()

    if err := validateApplicationContext(ctx); !errors.Is(
        err,
        context.Canceled,
    ) {
        t.Fatalf("expected context cancellation, got %v", err)
    }
}
'@

    Write-AtomicUtf8 `
        -Path $newTestFull `
        -Content $hardeningTests

    Write-Success "Application source and hardening tests written."

    # -----------------------------------------------------------------
    # 20. FORMAT
    # -----------------------------------------------------------------

    Write-Section "GO FORMAT"

    $formatFiles = @(
        $portsPath,
        $servicesPath,
        $newTestFull
    )

    Invoke-CheckedNativeCommand -Executable "gofmt" -Arguments (@("-w") + $formatFiles) -Label "GO FORMAT"

    Write-Success "gofmt completed."

    # -----------------------------------------------------------------
    # 21. STATIC STRUCTURAL CHECKS
    # -----------------------------------------------------------------

    Write-Section "STRUCTURAL VALIDATION"

    $formattedPorts = Read-Utf8Text $portsPath
    $formattedServices = Read-Utf8Text $servicesPath
    $formattedTests = Read-Utf8Text $newTestFull

    $requiredMarkers = @(
        "ErrTransactionOutcomeUnknown",
        "ErrReservationReconciliationRequired",
        "ErrReservationCompensationFailed",
        "ErrRepositoryContractViolation",
        "func applicationNowUTC",
        "func applicationNewID",
        "func (s *OrderAdmissionService) Place",
        "func (s *MatchingService) MatchNext",
        "func (s *ExecutionProgressService) CompleteStep",
        "func (s *LegalRequestService) GetRequestResult"
    )

    $combined = $formattedPorts + "`n" +
        $formattedServices + "`n" +
        $formattedTests

    foreach ($marker in $requiredMarkers) {
        if (-not $combined.Contains($marker)) {
            Stop-Script "Required implementation marker missing: $marker"
        }
    }

    if (-not $formattedTests.Contains($Script:PackageMarker)) {
        Stop-Script "Hardening tests marker missing."
    }

    Write-Success "Structural checks passed."

    # -----------------------------------------------------------------
    # 22. TESTS
    # -----------------------------------------------------------------

    Invoke-GoCheck `
        -Arguments @("test", "-count=1", "./internal/application") `
        -Label "APPLICATION PACKAGE TESTS"

    Invoke-GoCheck `
        -Arguments @("test", "-count=1", "./...") `
        -Label "FULL PROJECT TESTS"

    Invoke-GoCheck `
        -Arguments @("vet", "./...") `
        -Label "GO VET"

    # -----------------------------------------------------------------
    # 23. PROTECTED FILE VERIFICATION
    # -----------------------------------------------------------------

    Write-Section "DATABASE AND INFRASTRUCTURE PROTECTION"

    $protectedAfter = Get-ProtectedFileHashes -Root $Script:Root

    Assert-ProtectedFilesUnchanged `
        -Before $protectedBefore `
        -After $protectedAfter

    Write-Success "No database or infrastructure file was modified."

    # -----------------------------------------------------------------
    # 24. FINAL REPORT
    # -----------------------------------------------------------------

    Write-Section "PACKAGE 01 RESULT"

    Write-Host "Status: SUCCESS" -ForegroundColor Green
    Write-Host "Project: $Script:Root"
    Write-Host "Backup: $Script:BackupRoot"

    Write-Host ""
    Write-Host "Modified files:" -ForegroundColor Cyan

    Write-Host "  internal/application/ports.go"
    Write-Host "  internal/application/services.go"

    Write-Host ""
    Write-Host "Created file:" -ForegroundColor Cyan
    Write-Host "  internal/application/services_hardening_test.go"

    Write-Host ""
    Write-Host "Validated commands:" -ForegroundColor Cyan
    Write-Host "  gofmt -w ..."
    Write-Host "  go test -count=1 ./internal/application"
    Write-Host "  go test -count=1 ./..."
    Write-Host "  go vet ./..."

    Write-Host ""
    Write-Host "Protected and unchanged:" -ForegroundColor Cyan
    Write-Host "  migrations/"
    Write-Host "  internal/database/"
    Write-Host "  docker/"
    Write-Host "  docker-compose.yml"
    Write-Host "  Dockerfile"
    Write-Host "  go.mod"
    Write-Host "  go.sum"

    if (Test-Path -LiteralPath (Join-Path $Script:Root ".git")) {
        Write-Host ""
        Write-Host "Git status:" -ForegroundColor Cyan

        & git status --short
    }
    else {
        Write-Host ""
        Write-WarningMessage "No .git directory found at project root."
    }

    Write-Success "Package 01 hardening completed."

}
catch {
    Write-Host ""
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red

    if ($Script:ChangesStarted) {
        try {
            Restore-OriginalFiles
        }
        catch {
            Write-Host (
                "CRITICAL: Automatic rollback failed: " +
                $_.Exception.Message
            ) -ForegroundColor Red

            Write-Host (
                "Original backups are preserved at: " +
                $Script:BackupRoot
            ) -ForegroundColor Yellow
        }
    }
    else {
        Write-WarningMessage "No source modifications were made."
    }

    throw
}
finally {
    Pop-Location
}