#requires -Version 5.1
#requires -RunAsAdministrator

[CmdletBinding()]
param(
    [switch]$SkipBuild
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'Continue'
$VerbosePreference = 'SilentlyContinue'
$DebugPreference = 'SilentlyContinue'
$InformationPreference = 'SilentlyContinue'
$WarningPreference = 'SilentlyContinue'
Set-PSDebug -Off

# ============================================================
# IGD FRONTEND - COMPLETE CONTROLLED INSTALLATION
# Windows PowerShell 5.1+
#
# E: Project source code and configuration
# D: Runtimes, tools, dependencies, caches, downloads and logs
#
# STACK:
# Angular 22
# TypeScript
# Angular Material / CDK
# Spartan UI
# Tailwind CSS 4
# ECharts / ngx-echarts
# Vazirmatn / Inter
# Material Symbols
#
# VERIFIED SOURCES:
# Node.js: https://nodejs.org/dist/
# npm:     https://registry.npmjs.org/
#
# No unverified internal mirrors.
# No global PATH modifications.
# No automatic deletion of existing project data.
# ============================================================


# ------------------------------------------------------------
# 01. ROOT PATHS
# ------------------------------------------------------------

$ProjectRoot = [IO.Path]::GetFullPath($PSScriptRoot)

$FrontRoot = Join-Path $ProjectRoot 'IGD-front'
$AppRoot = Join-Path $FrontRoot 'app'

$InstallRoot = 'D:\Program Files\IGD-Frontend'

$ToolsRoot = Join-Path $InstallRoot 'Tools'
$RuntimesRoot = Join-Path $InstallRoot 'Runtimes'
$LibrariesRoot = Join-Path $InstallRoot 'Libraries'
$CacheRoot = Join-Path $InstallRoot 'PackageCaches'
$DownloadsRoot = Join-Path $InstallRoot 'Downloads'
$LogsRoot = Join-Path $InstallRoot 'Logs'
$BackupsRoot = Join-Path $InstallRoot 'Backups'

$NodeVersion = '24.15.0'
$NodeFolder = "node-v$NodeVersion-win-x64"

$NodeRoot = Join-Path $RuntimesRoot "NodeJS\$NodeFolder"
$NodeExe = Join-Path $NodeRoot 'node.exe'
$NpmCli = Join-Path $NodeRoot 'node_modules\npm\bin\npm-cli.js'

$AngularCliRoot = Join-Path $ToolsRoot 'AngularCLI'
$AngularCliPackage = Join-Path $AngularCliRoot 'node_modules\@angular\cli\package.json'
$AngularCliJs = Join-Path $AngularCliRoot 'node_modules\@angular\cli\bin\ng.js'

$ProjectRuntime = Join-Path $LibrariesRoot 'IGD-Frontend'
$RuntimeModules = Join-Path $ProjectRuntime 'node_modules'
$RuntimePackageJson = Join-Path $ProjectRuntime 'package.json'

$NpmCache = Join-Path $CacheRoot 'npm'
$TempRoot = Join-Path $CacheRoot 'temp'

$NodeArchiveName = "$NodeFolder.zip"
$NodeArchive = Join-Path $DownloadsRoot $NodeArchiveName
$NodeChecksumFile = Join-Path $DownloadsRoot 'SHASUMS256.txt'

$NodeBaseUrl = "https://nodejs.org/dist/v$NodeVersion"
$NodeArchiveUrl = "$NodeBaseUrl/$NodeArchiveName"
$NodeChecksumUrl = "$NodeBaseUrl/SHASUMS256.txt"

$NpmRegistry = 'https://registry.npmjs.org/'

$Timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'

$LogFile = Join-Path $LogsRoot "Initialize-IGD-Front-$Timestamp.log"

$NativeLogRoot = Join-Path $LogsRoot "Commands-$Timestamp"

$ProjectBackupRoot = Join-Path $BackupsRoot "Project-$Timestamp"

$script:CurrentPercent = 0
$script:CurrentStage = ''


# ------------------------------------------------------------
# 02. BASIC FUNCTIONS
# ------------------------------------------------------------

function Write-Log {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Message,

        [ValidateSet('INFO', 'WARN', 'ERROR', 'SUCCESS')]
        [string]$Level = 'INFO'
    )

    $Line = '[{0}] [{1}] {2}' -f (
        Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    ), $Level, $Message

    Add-Content `
        -LiteralPath $LogFile `
        -Value $Line `
        -Encoding UTF8
}


function Stop-Setup {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Message
    )

    Write-Log $Message 'ERROR'

    throw $Message
}


function Ensure-Directory {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    if (-not (Test-Path -LiteralPath $Path -PathType Container)) {
        New-Item `
            -ItemType Directory `
            -Path $Path `
            -Force |
            Out-Null
    }
}


function Write-Utf8File {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [string]$Content
    )

    $Parent = Split-Path -Parent $Path

    if ($Parent) {
        Ensure-Directory $Parent
    }

    [IO.File]::WriteAllText(
        $Path,
        $Content,
        (New-Object System.Text.UTF8Encoding($false))
    )
}


function Set-JsonProperty {
    param(
        [Parameter(Mandatory = $true)]
        [object]$Object,

        [Parameter(Mandatory = $true)]
        [string]$Name,

        [Parameter(Mandatory = $true)]
        [AllowNull()]
        [object]$Value
    )

    $Existing = $Object.PSObject.Properties[$Name]

    if ($null -ne $Existing) {
        $Object.$Name = $Value
    }
    else {
        $Object |
            Add-Member `
                -MemberType NoteProperty `
                -Name $Name `
                -Value $Value
    }
}


function Get-JsonProperty {
    param(
        [Parameter(Mandatory = $true)]
        [object]$Object,

        [Parameter(Mandatory = $true)]
        [string]$Name
    )

    $Property = $Object.PSObject.Properties[$Name]

    if ($null -eq $Property) {
        return $null
    }

    return $Property.Value
}


function Backup-ProjectFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        return
    }

    $FullPath = [IO.Path]::GetFullPath($Path)

    if (-not $FullPath.StartsWith(
        $ProjectRoot.TrimEnd('\') + '\',
        [StringComparison]::OrdinalIgnoreCase
    )) {
        Stop-Setup "Backup path is outside project root: $FullPath"
    }

    $RelativePath = $FullPath.Substring(
        $ProjectRoot.TrimEnd('\').Length
    ).TrimStart('\')

    $BackupPath = Join-Path $ProjectBackupRoot $RelativePath

    Ensure-Directory (Split-Path -Parent $BackupPath)

    Copy-Item `
        -LiteralPath $FullPath `
        -Destination $BackupPath `
        -Force

    Write-Log "Project file backed up: $RelativePath"
}


function Set-Stage {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name,

        [Parameter(Mandatory = $true)]
        [ValidateRange(0, 100)]
        [int]$Percent
    )

    $script:CurrentStage = $Name
    $script:CurrentPercent = $Percent

    Write-Progress `
        -Id 1 `
        -Activity 'IGD FRONTEND INSTALLATION' `
        -Status $Name `
        -PercentComplete $Percent
}


function Complete-Progress {
    Write-Progress `
        -Id 1 `
        -Activity 'IGD FRONTEND INSTALLATION' `
        -Completed
}


function Test-PathOnD {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    $FullPath = [IO.Path]::GetFullPath($Path)

    if (-not $FullPath.StartsWith(
        'D:\',
        [StringComparison]::OrdinalIgnoreCase
    )) {
        Stop-Setup "A runtime or dependency path is outside D: $FullPath"
    }
}


# ------------------------------------------------------------
# 03. NATIVE PROCESS EXECUTION
# ------------------------------------------------------------

function Invoke-Node {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Arguments,

        [Parameter(Mandatory = $true)]
        [string]$WorkingDirectory,

        [Parameter(Mandatory = $true)]
        [string]$LogName
    )

    if (-not (Test-Path -LiteralPath $NodeExe -PathType Leaf)) {
        Stop-Setup 'Node.js executable was not found.'
    }

    if (-not (Test-Path -LiteralPath $WorkingDirectory -PathType Container)) {
        Stop-Setup "Working directory does not exist: $WorkingDirectory"
    }

    Ensure-Directory $NativeLogRoot

    $StdOut = Join-Path $NativeLogRoot "$LogName.stdout.log"
    $StdErr = Join-Path $NativeLogRoot "$LogName.stderr.log"

    $QuotedArguments = foreach ($Argument in $Arguments) {
        '"' + ([string]$Argument).Replace('"', '\"') + '"'
    }

    $ArgumentLine = $QuotedArguments -join ' '

    Write-Log "Starting command: node $LogName"

    try {
        $Process = Start-Process `
            -FilePath $NodeExe `
            -ArgumentList $ArgumentLine `
            -WorkingDirectory $WorkingDirectory `
            -RedirectStandardOutput $StdOut `
            -RedirectStandardError $StdErr `
            -NoNewWindow `
            -Wait `
            -PassThru `
            -ErrorAction Stop
    }
    catch {
        Write-Log "Process launch error: $($_.Exception.Message)" 'ERROR'
        throw
    }

    if ($Process.ExitCode -ne 0) {
        Write-Log "Command failed: $LogName" 'ERROR'
        Write-Log "Exit code: $($Process.ExitCode)" 'ERROR'
        Write-Log "stdout: $StdOut" 'ERROR'
        Write-Log "stderr: $StdErr" 'ERROR'

        throw "Required command failed. See command logs: $LogName"
    }

    Write-Log "Command completed: $LogName" 'SUCCESS'
}


function Invoke-Npm {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Arguments,

        [Parameter(Mandatory = $true)]
        [string]$WorkingDirectory,

        [Parameter(Mandatory = $true)]
        [string]$LogName
    )

    $FullArguments = @($NpmCli) + $Arguments

    Invoke-Node `
        -Arguments $FullArguments `
        -WorkingDirectory $WorkingDirectory `
        -LogName $LogName
}


# ------------------------------------------------------------
# 04. DOWNLOAD AND CHECKSUM FUNCTIONS
# ------------------------------------------------------------

function Download-File {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Url,

        [Parameter(Mandatory = $true)]
        [string]$Destination
    )

    Ensure-Directory (Split-Path -Parent $Destination)

    if (Test-Path -LiteralPath $Destination) {
        Remove-Item -LiteralPath $Destination -Force
    }

    Write-Log "Downloading: $Url"

    $Client = New-Object System.Net.WebClient

    try {
        $Client.DownloadFile($Url, $Destination)
    }
    catch {
        Write-Log "Download failed: $($_.Exception.Message)" 'ERROR'
        throw
    }
    finally {
        $Client.Dispose()
    }

    if (
        -not (Test-Path -LiteralPath $Destination -PathType Leaf) -or
        (Get-Item -LiteralPath $Destination).Length -le 0
    ) {
        Stop-Setup "Downloaded file is missing or empty: $Destination"
    }

    Write-Log "Download completed: $Destination" 'SUCCESS'
}


function Get-NodeChecksum {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ManifestPath,

        [Parameter(Mandatory = $true)]
        [string]$FileName
    )

    $EscapedName = [regex]::Escape($FileName)

    foreach ($Line in (Get-Content -LiteralPath $ManifestPath)) {
        if ($Line -match (
            '^\s*([a-fA-F0-9]{64})\s+\*?' +
            $EscapedName +
            '\s*$'
        )) {
            return $Matches[1].ToLowerInvariant()
        }
    }

    Stop-Setup 'Node.js SHA256 checksum was not found.'
}


# ------------------------------------------------------------
# 05. VALIDATE REPOSITORY AND DRIVE
# ------------------------------------------------------------

if (-not (Test-Path -LiteralPath 'D:\' -PathType Container)) {
    throw 'Drive D: is not available.'
}

$RootMarkers = @(
    (Join-Path $ProjectRoot 'general-market-backend'),
    (Join-Path $ProjectRoot 'account-backend')
)

$RootValid = $false

foreach ($Marker in $RootMarkers) {
    if (Test-Path -LiteralPath $Marker -PathType Container) {
        $RootValid = $true
        break
    }
}

if (-not $RootValid) {
    throw 'Run this script from the repository root.'
}

# Avoid installing into a different or unexpected repository.
if (-not (Test-Path -LiteralPath $ProjectRoot -PathType Container)) {
    throw "Project root does not exist: $ProjectRoot"
}


# ------------------------------------------------------------
# 06. CREATE INSTALLATION DIRECTORIES ON D:
# ------------------------------------------------------------

$Directories = @(
    $InstallRoot,
    $ToolsRoot,
    $RuntimesRoot,
    $LibrariesRoot,
    $CacheRoot,
    $DownloadsRoot,
    $LogsRoot,
    $BackupsRoot,
    $AngularCliRoot,
    $ProjectRuntime,
    $NpmCache,
    $TempRoot,
    $NativeLogRoot
)

foreach ($Directory in $Directories) {
    Ensure-Directory $Directory
}

New-Item -ItemType File -Path $LogFile -Force | Out-Null

Write-Log 'IGD Frontend initialization started.'
Write-Log "Repository root: $ProjectRoot"
Write-Log "Frontend source: $FrontRoot"
Write-Log "Installation root: $InstallRoot"
Write-Log "Node.js source: $NodeArchiveUrl"
Write-Log "npm registry: $NpmRegistry"


# ------------------------------------------------------------
# 07. ISOLATE ENVIRONMENT
# ------------------------------------------------------------

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$env:TEMP = $TempRoot
$env:TMP = $TempRoot

$env:NPM_CONFIG_CACHE = $NpmCache
$env:NPM_CONFIG_REGISTRY = $NpmRegistry

$env:NPM_CONFIG_FUND = 'false'
$env:NPM_CONFIG_AUDIT = 'false'
$env:NPM_CONFIG_UPDATE_NOTIFIER = 'false'
$env:NPM_CONFIG_PROGRESS = 'false'

$env:NPM_CONFIG_FETCH_RETRIES = '3'
$env:NPM_CONFIG_FETCH_TIMEOUT = '180000'

$env:PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = '1'

$env:POWERSHELL_TELEMETRY_OPTOUT = '1'

# No global PATH modification.
# No permanent environment-variable changes.


try {

    # --------------------------------------------------------
    # 08. INSTALL PORTABLE NODE.JS
    # --------------------------------------------------------

    Set-Stage 'بررسی و آماده‌سازی Node.js' 5

    $NodeReady = $false

    if (Test-Path -LiteralPath $NodeExe -PathType Leaf) {

        $NodeVersionOutput = (
            & $NodeExe --version 2>$null |
            Out-String
        ).Trim()

        if ($LASTEXITCODE -ne 0) {
            Stop-Setup 'Existing Node.js executable cannot run.'
        }

        if ($NodeVersionOutput -ne "v$NodeVersion") {
            Stop-Setup "Unexpected existing Node.js version: $NodeVersionOutput"
        }

        $NodeReady = $true
        Write-Log "Existing Node.js verified: $NodeVersionOutput" 'SUCCESS'
    }
    elseif (Test-Path -LiteralPath $NodeRoot) {
        Stop-Setup 'Node.js directory exists but is incomplete. Existing data was preserved.'
    }

    if (-not $NodeReady) {

        Set-Stage 'دانلود Node.js از منبع رسمی' 10

        Download-File `
            -Url $NodeArchiveUrl `
            -Destination $NodeArchive

        Download-File `
            -Url $NodeChecksumUrl `
            -Destination $NodeChecksumFile

        Set-Stage 'بررسی صحت SHA256 فایل Node.js' 16

        $ExpectedHash = Get-NodeChecksum `
            -ManifestPath $NodeChecksumFile `
            -FileName $NodeArchiveName

        $ActualHash = (
            Get-FileHash `
                -LiteralPath $NodeArchive `
                -Algorithm SHA256
        ).Hash.ToLowerInvariant()

        if ($ActualHash -ne $ExpectedHash) {
            Stop-Setup 'Node.js archive checksum validation failed.'
        }

        Write-Log 'Node.js SHA256 validation passed.' 'SUCCESS'

        Set-Stage 'استخراج Node.js در درایو D' 20

        $ExtractRoot = Join-Path $TempRoot 'node-extract'

        if (Test-Path -LiteralPath $ExtractRoot) {
            Remove-Item `
                -LiteralPath $ExtractRoot `
                -Recurse `
                -Force
        }

        Ensure-Directory $ExtractRoot

        Expand-Archive `
            -LiteralPath $NodeArchive `
            -DestinationPath $ExtractRoot `
            -Force

        $ExtractedNode = Join-Path $ExtractRoot $NodeFolder

        if (-not (Test-Path -LiteralPath (Join-Path $ExtractedNode 'node.exe'))) {
            Stop-Setup 'Unexpected Node.js archive structure.'
        }

        Ensure-Directory (Split-Path -Parent $NodeRoot)

        Move-Item `
            -LiteralPath $ExtractedNode `
            -Destination $NodeRoot

        if (-not (Test-Path -LiteralPath $NodeExe -PathType Leaf)) {
            Stop-Setup 'Node.js extraction did not create node.exe.'
        }

        Remove-Item `
            -LiteralPath $ExtractRoot `
            -Recurse `
            -Force

        Write-Log 'Node.js installed successfully.' 'SUCCESS'
    }

    if (-not (Test-Path -LiteralPath $NpmCli -PathType Leaf)) {
        Stop-Setup 'npm CLI is missing from the Node.js distribution.'
    }

    $InstalledNodeVersion = (
        & $NodeExe --version 2>$null |
        Out-String
    ).Trim()

    if ($LASTEXITCODE -ne 0 -or $InstalledNodeVersion -ne "v$NodeVersion") {
        Stop-Setup 'Node.js version validation failed.'
    }

    $InstalledNpmVersion = (
        & $NodeExe $NpmCli --version 2>$null |
        Out-String
    ).Trim()

    if ($LASTEXITCODE -ne 0) {
        Stop-Setup 'npm execution failed.'
    }

    Write-Log "Node.js version: $InstalledNodeVersion" 'SUCCESS'
    Write-Log "npm version: $InstalledNpmVersion" 'SUCCESS'


    # --------------------------------------------------------
    # 09. INSTALL ANGULAR CLI ON D:
    # --------------------------------------------------------

    Set-Stage 'نصب Angular CLI روی درایو D' 26

    $AngularToolsPackageJson = Join-Path $AngularCliRoot 'package.json'

    if (-not (Test-Path -LiteralPath $AngularToolsPackageJson)) {

        $AngularToolsPackage = [ordered]@{
            name = 'igd-angular-cli-tools'
            version = '1.0.0'
            private = $true
            description = 'Isolated Angular CLI tools for IGD'
        }

        Write-Utf8File `
            -Path $AngularToolsPackageJson `
            -Content ($AngularToolsPackage | ConvertTo-Json -Depth 10)
    }

    if (-not (Test-Path -LiteralPath $AngularCliJs -PathType Leaf)) {

        Invoke-Npm `
            -WorkingDirectory $AngularCliRoot `
            -Arguments @(
                'install',
                '--save-exact',
                '@angular/cli@22',
                "--registry=$NpmRegistry",
                "--cache=$NpmCache",
                '--no-audit',
                '--no-fund'
            ) `
            -LogName 'Angular-CLI-install'
    }

    if (-not (Test-Path -LiteralPath $AngularCliJs -PathType Leaf)) {
        Stop-Setup 'Angular CLI installation is incomplete.'
    }

    $AngularCliVersion = (
        Get-Content -LiteralPath $AngularCliPackage -Raw |
        ConvertFrom-Json
    ).version

    if ($AngularCliVersion -notmatch '^22\.') {
        Stop-Setup "Unexpected Angular CLI version: $AngularCliVersion"
    }

    Write-Log "Angular CLI version: $AngularCliVersion" 'SUCCESS'


    # --------------------------------------------------------
    # 10. CREATE FRONTEND PROJECT DIRECTORIES ON E:
    # --------------------------------------------------------

    Set-Stage 'آماده‌سازی ساختار پروژه در درایو E' 30

    $FrontDirectories = @(
        $FrontRoot,
        $AppRoot,
        (Join-Path $FrontRoot 'design-system'),
        (Join-Path $FrontRoot 'design-system\tokens'),
        (Join-Path $FrontRoot 'design-system\themes'),
        (Join-Path $FrontRoot 'design-system\components'),
        (Join-Path $FrontRoot 'design-system\patterns'),
        (Join-Path $FrontRoot 'design-system\icons'),
        (Join-Path $FrontRoot 'assets'),
        (Join-Path $FrontRoot 'assets\fonts'),
        (Join-Path $FrontRoot 'assets\images'),
        (Join-Path $FrontRoot 'assets\illustrations'),
        (Join-Path $FrontRoot 'docs'),
        (Join-Path $FrontRoot 'scripts')
    )

    foreach ($Directory in $FrontDirectories) {
        Ensure-Directory $Directory
    }


    # --------------------------------------------------------
    # 11. CREATE ANGULAR WORKSPACE IF ABSENT
    # --------------------------------------------------------

    Set-Stage 'ساخت یا بررسی فضای کاری Angular' 35

    $AngularJsonPath = Join-Path $AppRoot 'angular.json'
    $PackageJsonPath = Join-Path $AppRoot 'package.json'

    $CreatedWorkspace = $false

    if (-not (Test-Path -LiteralPath $AngularJsonPath)) {

        $ExistingFiles = @(
            Get-ChildItem -LiteralPath $AppRoot -Force
        )

        if ($ExistingFiles.Count -gt 0) {
            Stop-Setup 'The app directory is not empty and has no angular.json. Existing files were preserved.'
        }

        Invoke-Node `
            -WorkingDirectory $FrontRoot `
            -Arguments @(
                $AngularCliJs,
                'new',
                'igd-front',
                '--directory',
                'app',
                '--skip-install',
                '--style',
                'css',
                '--routing',
                '--standalone',
                '--package-manager',
                'npm',
                '--skip-git'
            ) `
            -LogName 'Angular-workspace-create'

        $CreatedWorkspace = $true
    }

    if (
        -not (Test-Path -LiteralPath $AngularJsonPath -PathType Leaf) -or
        -not (Test-Path -LiteralPath $PackageJsonPath -PathType Leaf)
    ) {
        Stop-Setup 'Angular workspace validation failed.'
    }

    Write-Log 'Angular workspace verified.' 'SUCCESS'


    # --------------------------------------------------------
    # 12. READ AND BACK UP PROJECT PACKAGE MANIFEST
    # --------------------------------------------------------

    Set-Stage 'بررسی و پشتیبان‌گیری تنظیمات پروژه' 39

    Backup-ProjectFile $PackageJsonPath
    Backup-ProjectFile $AngularJsonPath

    $Package = Get-Content `
        -LiteralPath $PackageJsonPath `
        -Raw |
        ConvertFrom-Json

    $Dependencies = Get-JsonProperty $Package 'dependencies'
    $DevDependencies = Get-JsonProperty $Package 'devDependencies'
    $Scripts = Get-JsonProperty $Package 'scripts'

    if ($null -eq $Dependencies) {
        $Dependencies = [PSCustomObject]@{}
        Set-JsonProperty $Package 'dependencies' $Dependencies
    }

    if ($null -eq $DevDependencies) {
        $DevDependencies = [PSCustomObject]@{}
        Set-JsonProperty $Package 'devDependencies' $DevDependencies
    }

    if ($null -eq $Scripts) {
        $Scripts = [PSCustomObject]@{}
        Set-JsonProperty $Package 'scripts' $Scripts
    }


    # --------------------------------------------------------
    # 13. REQUIRED RUNTIME DEPENDENCIES
    # --------------------------------------------------------

    Set-Stage 'تنظیم وابستگی‌های اصلی رابط کاربری' 44

    $RuntimeDependencies = [ordered]@{
        '@angular/material' = '^22.0.0'
        '@angular/cdk' = '^22.0.0'
        '@spartan-ng/brain' = 'latest'
        'ngx-echarts' = '22.0.0'
        'echarts' = 'latest'
        '@fontsource-variable/vazirmatn' = 'latest'
        '@fontsource-variable/inter' = 'latest'
        'material-symbols' = 'latest'
    }

    foreach ($Name in $RuntimeDependencies.Keys) {
        Set-JsonProperty `
            -Object $Dependencies `
            -Name $Name `
            -Value $RuntimeDependencies[$Name]
    }


    # --------------------------------------------------------
    # 14. REQUIRED DEVELOPMENT DEPENDENCIES
    # --------------------------------------------------------

    Set-Stage 'تنظیم ابزارهای توسعه و Tailwind CSS' 48

    $DevelopmentDependencies = [ordered]@{
        '@spartan-ng/cli' = 'latest'
        'tailwindcss' = '^4.0.0'
        '@tailwindcss/postcss' = '^4.0.0'
        'postcss' = 'latest'
    }

    foreach ($Name in $DevelopmentDependencies.Keys) {
        Set-JsonProperty `
            -Object $DevDependencies `
            -Name $Name `
            -Value $DevelopmentDependencies[$Name]
    }


    # --------------------------------------------------------
    # 15. PROJECT COMMANDS
    # --------------------------------------------------------

    Set-Stage 'تنظیم فرمان‌های پروژه' 51

    Set-JsonProperty $Scripts 'start' 'ng serve'
    Set-JsonProperty $Scripts 'build' 'ng build'
    Set-JsonProperty $Scripts 'test' 'ng test'

    Write-Utf8File `
        -Path $PackageJsonPath `
        -Content ($Package | ConvertTo-Json -Depth 100)


    # --------------------------------------------------------
    # 16. INSTALL ALL PROJECT DEPENDENCIES ON D:
    # --------------------------------------------------------

    Set-Stage 'نصب وابستگی‌های پروژه روی درایو D' 59

    Ensure-Directory $ProjectRuntime

    if (Test-Path -LiteralPath $RuntimePackageJson) {
        $RuntimePackageBackup = Join-Path $BackupsRoot "package-$Timestamp.json"

        Copy-Item `
            -LiteralPath $RuntimePackageJson `
            -Destination $RuntimePackageBackup `
            -Force
    }

    Write-Utf8File `
        -Path $RuntimePackageJson `
        -Content ($Package | ConvertTo-Json -Depth 100)

    Invoke-Npm `
        -WorkingDirectory $ProjectRuntime `
        -Arguments @(
            'install',
            "--registry=$NpmRegistry",
            "--cache=$NpmCache",
            '--no-audit',
            '--no-fund',
            '--prefer-online'
        ) `
        -LogName 'Frontend-dependencies-install'

    if (-not (Test-Path -LiteralPath $RuntimeModules -PathType Container)) {
        Stop-Setup 'Project dependencies were not installed on D:.'
    }


    # --------------------------------------------------------
    # 17. VERIFY REQUIRED PACKAGES
    # --------------------------------------------------------

    Set-Stage 'اعتبارسنجی بسته‌های نصب‌شده' 69

    $RequiredPackages = @(
        '@angular/core',
        '@angular/cli',
        '@angular/material',
        '@angular/cdk',
        '@spartan-ng/brain',
        '@spartan-ng/cli',
        'tailwindcss',
        '@tailwindcss/postcss',
        'postcss',
        'echarts',
        'ngx-echarts',
        'typescript',
        '@fontsource-variable/vazirmatn',
        '@fontsource-variable/inter',
        'material-symbols'
    )

    foreach ($PackageName in $RequiredPackages) {

        $PackagePath = Join-Path `
            $RuntimeModules `
            ($PackageName.Replace('/', '\'))

        $PackageManifest = Join-Path $PackagePath 'package.json'

        if (-not (Test-Path -LiteralPath $PackageManifest -PathType Leaf)) {
            Stop-Setup "Required package is missing: $PackageName"
        }

        Write-Log "Verified package: $PackageName"
    }


    # --------------------------------------------------------
    # 18. PROJECT NODE_MODULES JUNCTION
    # --------------------------------------------------------

    Set-Stage 'اتصال وابستگی‌های درایو D به پروژه درایو E' 73

    $ProjectModules = Join-Path $AppRoot 'node_modules'

    if (Test-Path -LiteralPath $ProjectModules) {

        $ExistingItem = Get-Item `
            -LiteralPath $ProjectModules `
            -Force

        $IsReparsePoint = (
            ($ExistingItem.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0
        )

        if ($IsReparsePoint) {

            $JunctionInfo = (
                & fsutil.exe reparsepoint query $ProjectModules 2>&1 |
                Out-String
            )

            if ($LASTEXITCODE -ne 0) {
                Stop-Setup 'Unable to inspect existing node_modules junction.'
            }

            $NormalizedInfo = $JunctionInfo.Replace('/', '\')
            $ExpectedTarget = $RuntimeModules.Replace('/', '\')

            if (
                $NormalizedInfo.IndexOf(
                    $ExpectedTarget,
                    [StringComparison]::OrdinalIgnoreCase
                ) -lt 0
            ) {
                Stop-Setup 'Existing node_modules junction points to another location. It was not changed.'
            }

            Write-Log 'Existing node_modules junction verified.' 'SUCCESS'
        }
        else {

            $BackupModules = Join-Path $BackupsRoot "node_modules-$Timestamp"

            Move-Item `
                -LiteralPath $ProjectModules `
                -Destination $BackupModules

            Write-Log "Previous node_modules preserved: $BackupModules"
        }
    }

    if (-not (Test-Path -LiteralPath $ProjectModules)) {

        New-Item `
            -ItemType Junction `
            -Path $ProjectModules `
            -Target $RuntimeModules |
            Out-Null

        Write-Log 'Project node_modules junction created.' 'SUCCESS'
    }


    # --------------------------------------------------------
    # 19. NPM PROJECT CONFIGURATION
    # --------------------------------------------------------

    Set-Stage 'تنظیم رجیستری رسمی npm' 76

    $NpmrcPath = Join-Path $AppRoot '.npmrc'

    Backup-ProjectFile $NpmrcPath

    $NpmrcContent = @"
registry=$NpmRegistry
fund=false
audit=false
update-notifier=false
"@

    Write-Utf8File $NpmrcPath $NpmrcContent


    # --------------------------------------------------------
    # 20. TAILWIND POSTCSS CONFIGURATION
    # --------------------------------------------------------

    Set-Stage 'پیکربندی Tailwind CSS 4' 79

    $PostCssPath = Join-Path $AppRoot '.postcssrc.json'

    Backup-ProjectFile $PostCssPath

    $PostCssContent = @'
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
'@

    Write-Utf8File $PostCssPath $PostCssContent


    # --------------------------------------------------------
    # 21. GLOBAL DESIGN SYSTEM CSS
    # --------------------------------------------------------

    Set-Stage 'ایجاد بنیاد طراحی و فونت‌ها' 82

    $FoundationCssPath = Join-Path $FrontRoot 'design-system\igd-foundation.css'

    Backup-ProjectFile $FoundationCssPath

    $FoundationCss = @'
@layer theme, base, components, utilities;

@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "tailwindcss/utilities.css";

@import "@spartan-ng/brain/hlm-tailwind-preset.css";

@import "@angular/material/prebuilt-themes/azure-blue.css";

@import "@fontsource-variable/vazirmatn";
@import "@fontsource-variable/inter";

@import "material-symbols/outlined.css";

:root {
  color-scheme: light;

  --igd-font-fa: "Vazirmatn Variable", sans-serif;
  --igd-font-en: "Inter Variable", sans-serif;

  --igd-green-950: #172b24;
  --igd-green-900: #203b30;
  --igd-green-800: #2b4d3d;
  --igd-green-700: #3b6650;

  --igd-olive-600: #7b8052;
  --igd-gold-500: #b99a5b;

  --igd-cream-50: #fbfaf6;
  --igd-cream-100: #f4f1e8;
  --igd-cream-200: #e9e4d7;

  --igd-text-primary: #202923;
  --igd-text-secondary: #6e766f;

  --igd-border: #e5e1d7;

  --igd-radius-sm: 8px;
  --igd-radius-md: 14px;
  --igd-radius-lg: 20px;
}

html,
body {
  min-height: 100%;
  margin: 0;
  background: var(--igd-cream-50);
  color: var(--igd-text-primary);
  font-family: var(--igd-font-fa);
}

body {
  direction: rtl;
  text-align: right;
  -webkit-font-smoothing: antialiased;
}

button,
input,
textarea,
select {
  font: inherit;
}

* {
  box-sizing: border-box;
}
'@

    Write-Utf8File $FoundationCssPath $FoundationCss


    # --------------------------------------------------------
    # 22. CONNECT FOUNDATION CSS TO ANGULAR
    # --------------------------------------------------------

    Set-Stage 'اتصال بنیاد طراحی به Angular' 85

    $AngularJson = Get-Content `
        -LiteralPath $AngularJsonPath `
        -Raw |
        ConvertFrom-Json

    $ProjectNames = @($AngularJson.projects.PSObject.Properties.Name)

    if ($ProjectNames.Count -eq 0) {
        Stop-Setup 'No Angular application project was found.'
    }

    $ApplicationProject = $null
    $BuildTarget = $null

    foreach ($Name in $ProjectNames) {

        $Candidate = $AngularJson.projects.$Name

        $Architect = Get-JsonProperty $Candidate 'architect'
        $Targets = Get-JsonProperty $Candidate 'targets'

        if ($null -ne $Architect) {
            $CandidateBuild = Get-JsonProperty $Architect 'build'

            if ($null -ne $CandidateBuild) {
                $ApplicationProject = $Candidate
                $BuildTarget = $CandidateBuild
                break
            }
        }

        if ($null -ne $Targets) {
            $CandidateBuild = Get-JsonProperty $Targets 'build'

            if ($null -ne $CandidateBuild) {
                $ApplicationProject = $Candidate
                $BuildTarget = $CandidateBuild
                break
            }
        }
    }

    if ($null -eq $ApplicationProject -or $null -eq $BuildTarget) {
        Stop-Setup 'Angular build target was not found.'
    }

    $BuildOptions = Get-JsonProperty $BuildTarget 'options'

    if ($null -eq $BuildOptions) {
        Stop-Setup 'Angular build options are missing.'
    }

    $Styles = Get-JsonProperty $BuildOptions 'styles'

    if ($null -eq $Styles) {
        $Styles = @()
    }

    $StylesArray = @($Styles)
    $FoundationRelative = '../design-system/igd-foundation.css'

    $FoundationAlreadyLinked = $false

    foreach ($Style in $StylesArray) {

        if (
            $Style -is [string] -and
            $Style.Replace('\', '/') -eq $FoundationRelative
        ) {
            $FoundationAlreadyLinked = $true
        }
    }

    if (-not $FoundationAlreadyLinked) {
        Set-JsonProperty `
            -Object $BuildOptions `
            -Name 'styles' `
            -Value (@($StylesArray) + @($FoundationRelative))
    }

    Write-Utf8File `
        -Path $AngularJsonPath `
        -Content ($AngularJson | ConvertTo-Json -Depth 100)


    # --------------------------------------------------------
    # 23. CREATE DESIGN TOKENS
    # --------------------------------------------------------

    Set-Stage 'ایجاد توکن‌های رنگ و تایپوگرافی' 88

    $ColorsPath = Join-Path $FrontRoot 'design-system\tokens\colors.css'

    Backup-ProjectFile $ColorsPath

    $ColorsCss = @'
:root {
  --igd-color-primary: #203b30;
  --igd-color-primary-dark: #172b24;
  --igd-color-primary-soft: #e9f0eb;

  --igd-color-olive: #7b8052;
  --igd-color-gold: #b99a5b;

  --igd-color-background: #fbfaf6;
  --igd-color-surface: #ffffff;
  --igd-color-surface-muted: #f4f1e8;

  --igd-color-text: #202923;
  --igd-color-text-muted: #6e766f;

  --igd-color-border: #e5e1d7;

  --igd-color-success: #2e7252;
  --igd-color-warning: #b78332;
  --igd-color-danger: #a9473e;
}
'@

    Write-Utf8File $ColorsPath $ColorsCss

    $TypographyPath = Join-Path $FrontRoot 'design-system\tokens\typography.css'

    Backup-ProjectFile $TypographyPath

    $TypographyCss = @'
:root {
  --igd-font-family-persian: "Vazirmatn Variable", sans-serif;
  --igd-font-family-latin: "Inter Variable", sans-serif;

  --igd-font-size-xs: 0.75rem;
  --igd-font-size-sm: 0.875rem;
  --igd-font-size-md: 1rem;
  --igd-font-size-lg: 1.125rem;
  --igd-font-size-xl: 1.375rem;
  --igd-font-size-2xl: 1.75rem;

  --igd-line-height: 1.8;
}
'@

    Write-Utf8File $TypographyPath $TypographyCss


    # --------------------------------------------------------
    # 24. CREATE DASHBOARD ONLY FOR A NEW WORKSPACE
    # --------------------------------------------------------

    Set-Stage 'آماده‌سازی صفحه اولیه داشبورد' 90

    if ($CreatedWorkspace) {

        $AppHtmlPath = Join-Path $AppRoot 'src\app\app.html'
        $LegacyAppHtmlPath = Join-Path $AppRoot 'src\app\app.component.html'

        if (Test-Path -LiteralPath $AppHtmlPath) {
            $DashboardPath = $AppHtmlPath
        }
        elseif (Test-Path -LiteralPath $LegacyAppHtmlPath) {
            $DashboardPath = $LegacyAppHtmlPath
        }
        else {
            Stop-Setup 'Angular application template was not found.'
        }

        $DashboardHtml = @'
<main class="min-h-screen bg-[var(--igd-cream-50)] text-[var(--igd-text-primary)]">
  <header class="border-b border-[var(--igd-border)] bg-white">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
      <div>
        <p class="text-xs text-[var(--igd-text-secondary)]">
          سامانه مدیریت دارایی‌های واقعی
        </p>
        <h1 class="mt-1 text-xl font-bold text-[var(--igd-green-950)]">
          مرکز دارایی‌های من
        </h1>
      </div>
      <div class="rounded-xl bg-[var(--igd-cream-100)] px-4 py-2 text-sm">
        حساب کاربری
      </div>
    </div>
  </header>

  <div class="mx-auto max-w-7xl px-6 py-8">
    <section class="mb-8">
      <p class="text-sm text-[var(--igd-text-secondary)]">
        نمای کلی فعالیت‌ها
      </p>

      <h2 class="mt-2 text-2xl font-bold text-[var(--igd-green-950)]">
        کارتابل اقتصادی شما
      </h2>

      <p class="mt-2 max-w-2xl text-sm leading-7 text-[var(--igd-text-secondary)]">
        مدیریت دارایی‌ها، پیگیری قراردادها و دسترسی به عرضه‌ها در یک محیط یکپارچه.
      </p>
    </section>

    <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <article class="rounded-2xl border border-[var(--igd-border)] bg-white p-5">
        <p class="text-sm text-[var(--igd-text-secondary)]">دارایی‌های من</p>
        <p class="mt-4 text-lg font-bold text-[var(--igd-green-900)]">
          نمای کلی دارایی‌ها
        </p>
      </article>

      <article class="rounded-2xl border border-[var(--igd-border)] bg-white p-5">
        <p class="text-sm text-[var(--igd-text-secondary)]">قراردادهای فعال</p>
        <p class="mt-4 text-lg font-bold text-[var(--igd-green-900)]">
          پیگیری قراردادها
        </p>
      </article>

      <article class="rounded-2xl border border-[var(--igd-border)] bg-white p-5">
        <p class="text-sm text-[var(--igd-text-secondary)]">بازار کلی</p>
        <p class="mt-4 text-lg font-bold text-[var(--igd-green-900)]">
          مشاهده عرضه‌ها
        </p>
      </article>

      <article class="rounded-2xl border border-[var(--igd-border)] bg-white p-5">
        <p class="text-sm text-[var(--igd-text-secondary)]">خدمات و تحویل</p>
        <p class="mt-4 text-lg font-bold text-[var(--igd-green-900)]">
          پیگیری خدمات
        </p>
      </article>
    </section>

    <section class="mt-8 rounded-2xl border border-[var(--igd-border)] bg-white p-6">
      <h3 class="font-bold text-[var(--igd-green-950)]">
        فعالیت‌های اخیر
      </h3>

      <p class="mt-3 text-sm leading-7 text-[var(--igd-text-secondary)]">
        اطلاعات فعالیت‌ها پس از اتصال به سرویس‌های بک‌اند نمایش داده می‌شود.
      </p>
    </section>
  </div>
</main>
'@

        Write-Utf8File $DashboardPath $DashboardHtml
    }


    # --------------------------------------------------------
    # 25. CREATE START SCRIPT
    # --------------------------------------------------------

    Set-Stage 'ساخت ابزار اجرای محیط توسعه' 92

    $StartScriptPath = Join-Path $FrontRoot 'scripts\Start-IGD-Front.ps1'

    Backup-ProjectFile $StartScriptPath

    $StartScriptContent = @'
[CmdletBinding()]
param(
    [string]$HostAddress = '127.0.0.1',
    [int]$Port = 4200
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$InstallRoot = 'D:\Program Files\IGD-Frontend'

$NodeExe = Join-Path $InstallRoot `
    'Runtimes\NodeJS\node-v24.15.0-win-x64\node.exe'

$NgJs = Join-Path $InstallRoot `
    'Libraries\IGD-Frontend\node_modules\@angular\cli\bin\ng.js'

$AppRoot = Join-Path (Split-Path -Parent $PSScriptRoot) 'app'

$env:TEMP = Join-Path $InstallRoot 'PackageCaches\temp'
$env:TMP = $env:TEMP
$env:NPM_CONFIG_CACHE = Join-Path $InstallRoot 'PackageCaches\npm'
$env:NPM_CONFIG_REGISTRY = 'https://registry.npmjs.org/'

if (-not (Test-Path -LiteralPath $NodeExe -PathType Leaf)) {
    throw 'Node.js installation was not found.'
}

if (-not (Test-Path -LiteralPath $NgJs -PathType Leaf)) {
    throw 'Workspace Angular CLI installation was not found.'
}

Push-Location $AppRoot

try {
    & $NodeExe $NgJs serve --host $HostAddress --port $Port

    if ($LASTEXITCODE -ne 0) {
        throw 'Angular development server failed.'
    }
}
finally {
    Pop-Location
}
'@

    Write-Utf8File $StartScriptPath $StartScriptContent


    # --------------------------------------------------------
    # 26. CREATE BUILD SCRIPT
    # --------------------------------------------------------

    Set-Stage 'ساخت ابزار Build پروژه' 94

    $BuildScriptPath = Join-Path $FrontRoot 'scripts\Build-IGD-Front.ps1'

    Backup-ProjectFile $BuildScriptPath

    $BuildScriptContent = @'
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$InstallRoot = 'D:\Program Files\IGD-Frontend'

$NodeExe = Join-Path $InstallRoot `
    'Runtimes\NodeJS\node-v24.15.0-win-x64\node.exe'

$NgJs = Join-Path $InstallRoot `
    'Libraries\IGD-Frontend\node_modules\@angular\cli\bin\ng.js'

$AppRoot = Join-Path (Split-Path -Parent $PSScriptRoot) 'app'

$env:TEMP = Join-Path $InstallRoot 'PackageCaches\temp'
$env:TMP = $env:TEMP
$env:NPM_CONFIG_CACHE = Join-Path $InstallRoot 'PackageCaches\npm'
$env:NPM_CONFIG_REGISTRY = 'https://registry.npmjs.org/'

if (-not (Test-Path -LiteralPath $NodeExe -PathType Leaf)) {
    throw 'Node.js installation was not found.'
}

if (-not (Test-Path -LiteralPath $NgJs -PathType Leaf)) {
    throw 'Workspace Angular CLI installation was not found.'
}

Push-Location $AppRoot

try {
    & $NodeExe $NgJs build

    if ($LASTEXITCODE -ne 0) {
        throw 'Angular production build failed.'
    }
}
finally {
    Pop-Location
}
'@

    Write-Utf8File $BuildScriptPath $BuildScriptContent


    # --------------------------------------------------------
    # 27. INSTALLATION MANIFEST AND PATH VALIDATION
    # --------------------------------------------------------

    Set-Stage 'ثبت Manifest و اعتبارسنجی مسیرها' 97

    $Manifest = [ordered]@{
        projectRoot = $ProjectRoot
        sourceRoot = $FrontRoot
        angularWorkspace = $AppRoot

        installationRoot = $InstallRoot

        nodeVersion = $InstalledNodeVersion
        npmVersion = $InstalledNpmVersion
        angularCliVersion = $AngularCliVersion

        nodeExecutable = $NodeExe
        npmExecutable = $NpmCli
        angularCli = $AngularCliJs

        projectRuntime = $ProjectRuntime
        dependencyModules = $RuntimeModules

        npmCache = $NpmCache
        temporaryFiles = $TempRoot

        npmRegistry = $NpmRegistry
        nodeArchive = $NodeArchiveUrl
        nodeChecksum = $NodeChecksumUrl

        operatingSystemArchitecture = $env:PROCESSOR_ARCHITECTURE

        createdAt = (Get-Date).ToString('o')

        installationPolicy = (
            'Project source and configuration are stored on E:. ' +
            'Runtimes, tools, dependencies, caches and downloads are stored on D:.'
        )
    }

    $ManifestPath = Join-Path $FrontRoot 'installation-manifest.json'

    Backup-ProjectFile $ManifestPath

    Write-Utf8File `
        -Path $ManifestPath `
        -Content ($Manifest | ConvertTo-Json -Depth 30)

    $DPaths = @(
        $NodeExe,
        $NpmCli,
        $AngularCliJs,
        $RuntimePackageJson,
        $RuntimeModules,
        $NpmCache,
        $TempRoot,
        $AngularCliRoot,
        $DownloadsRoot
    )

    foreach ($Path in $DPaths) {

        Test-PathOnD $Path

        if (-not (Test-Path -LiteralPath $Path)) {
            Stop-Setup "Installation path validation failed: $Path"
        }
    }

    $NodeModulesLink = Get-Item `
        -LiteralPath $ProjectModules `
        -Force

    if (
        ($NodeModulesLink.Attributes -band [IO.FileAttributes]::ReparsePoint) -eq 0
    ) {
        Stop-Setup 'Project node_modules is not a junction.'
    }


    # --------------------------------------------------------
    # 28. FINAL BUILD AND REPORT
    # --------------------------------------------------------

    if (-not $SkipBuild) {

        Set-Stage 'ساخت و اعتبارسنجی نهایی Angular' 99

        Invoke-Node `
            -WorkingDirectory $AppRoot `
            -Arguments @(
                $AngularCliJs,
                'build'
            ) `
            -LogName 'Angular-production-build'

        Write-Log 'Production build completed.' 'SUCCESS'
    }
    else {
        Write-Log 'Production build skipped by parameter.' 'WARN'
    }

    Set-Stage 'تکمیل نصب و ثبت نتیجه' 100

    Write-Log '============================================' 'SUCCESS'
    Write-Log 'IGD FRONTEND INITIALIZATION COMPLETED.' 'SUCCESS'
    Write-Log '============================================' 'SUCCESS'

    Write-Log "SOURCE CODE: $FrontRoot" 'SUCCESS'
    Write-Log "ANGULAR WORKSPACE: $AppRoot" 'SUCCESS'
    Write-Log "INSTALLATION: $InstallRoot" 'SUCCESS'
    Write-Log "NODE: $NodeRoot" 'SUCCESS'
    Write-Log "ANGULAR CLI: $AngularCliRoot" 'SUCCESS'
    Write-Log "DEPENDENCIES: $RuntimeModules" 'SUCCESS'
    Write-Log "NPM CACHE: $NpmCache" 'SUCCESS'
    Write-Log "LOG: $LogFile" 'SUCCESS'

    Complete-Progress

    Write-Host ''
    Write-Host 'IGD FRONTEND INITIALIZATION COMPLETED' -ForegroundColor Green
    Write-Host "Project: $FrontRoot"
    Write-Host "Installation: $InstallRoot"
    Write-Host "Node.js: $InstalledNodeVersion"
    Write-Host "npm: $InstalledNpmVersion"
    Write-Host "Angular CLI: $AngularCliVersion"
    Write-Host "Log: $LogFile"
    Write-Host ''

}
catch {

    Complete-Progress

    $ErrorMessage = $_.Exception.Message

    try {
        Write-Log 'IGD FRONTEND INITIALIZATION FAILED.' 'ERROR'
        Write-Log $ErrorMessage 'ERROR'
        Write-Log ($_ | Out-String) 'ERROR'
    }
    catch {}

    Write-Host ''
    Write-Host "IGD FRONTEND SETUP FAILED: $ErrorMessage" -ForegroundColor Red
    Write-Host "Technical log: $LogFile" -ForegroundColor Yellow
    Write-Host "Command logs: $NativeLogRoot" -ForegroundColor Yellow
    Write-Host ''

    throw
}