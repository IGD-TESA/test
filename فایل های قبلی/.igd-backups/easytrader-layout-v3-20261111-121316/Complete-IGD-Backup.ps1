#requires -Version 5.1

$ErrorActionPreference = "Continue"

# ============================================================
# CONFIGURATION
# ============================================================

$ProjectRoot = (Get-Location).Path

$BackupDefault = Join-Path `
    $env:USERPROFILE `
    "Desktop\IGD-PLATFORM-BACKUP\Backup-20261031-101753"

if (!(Test-Path $ProjectRoot)) {
    throw "Project root not found."
}

if (!(Test-Path $BackupDefault)) {
    throw "Existing backup folder not found: $BackupDefault"
}

$BackupRoot = Read-Host "Backup folder [$BackupDefault]"
if ([string]::IsNullOrWhiteSpace($BackupRoot)) {
    $BackupRoot = $BackupDefault
}

$BackupRoot = [System.IO.Path]::GetFullPath($BackupRoot)

if (!(Test-Path $BackupRoot)) {
    throw "Backup folder does not exist."
}

$FinalRoot = Join-Path $BackupRoot "Final-Verification"

$Folders = @(
    "Reports",
    "PostgreSQL",
    "Redis",
    "Docker",
    "Development",
    "System",
    "Verification"
)

foreach ($Folder in $Folders) {
    New-Item -ItemType Directory `
        -Path (Join-Path $FinalRoot $Folder) `
        -Force | Out-Null
}

$LogFile = Join-Path $FinalRoot "Reports\final-backup.log"

function Write-Log {
    param([string]$Message)

    $Line = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  $Message"

    Write-Host $Line
    Add-Content -Path $LogFile -Value $Line -Encoding UTF8
}

function Save-Text {
    param(
        [string]$Path,
        [string]$Content
    )

    $Parent = Split-Path -Parent $Path
    New-Item -ItemType Directory -Path $Parent -Force |
        Out-Null

    [System.IO.File]::WriteAllText(
        $Path,
        $Content,
        [System.Text.UTF8Encoding]::new($false)
    )
}

function Get-FileHashSafe {
    param([string]$Path)

    try {
        return (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash
    }
    catch {
        return "HASH_ERROR"
    }
}

Write-Log "FINAL BACKUP VERIFICATION STARTED"
Write-Log "Project root: $ProjectRoot"
Write-Log "Backup root: $BackupRoot"

# ============================================================
# 1. PROJECT VERIFICATION
# ============================================================

Write-Log "Checking project copies"

$ProjectNames = @(
    "Real-Asset-Management-Platform",
    "Real-Asset-Management-Platform-Git",
    "real-asset-platform-service-service",
    "test"
)

$ProjectResults = @()

foreach ($Name in $ProjectNames) {

    $Source = Join-Path `
        (Split-Path -Parent $ProjectRoot) `
        $Name

    if (!(Test-Path $Source)) {
        Write-Log "PROJECT SOURCE MISSING: $Name"
        $ProjectResults += "MISSING SOURCE: $Name"
        continue
    }

    $Candidates = Get-ChildItem `
        -Path $BackupRoot `
        -Directory `
        -Recurse `
        -Filter $Name `
        -ErrorAction SilentlyContinue

    $Destination = $Candidates |
        Where-Object {
            $_.FullName -notlike "$FinalRoot*"
        } |
        Select-Object -First 1

    if (!$Destination) {
        Write-Log "PROJECT COPY NOT FOUND: $Name"
        $ProjectResults += "MISSING BACKUP: $Name"
        continue
    }

    Write-Log "Comparing project: $Name"

    $SourceFiles = @(
        Get-ChildItem $Source -Recurse -File -Force
    )

    $DestinationFiles = @(
        Get-ChildItem $Destination.FullName -Recurse -File -Force
    )

    $SourceBytes = ($SourceFiles |
        Measure-Object Length -Sum).Sum

    $DestinationBytes = ($DestinationFiles |
        Measure-Object Length -Sum).Sum

    $Missing = 0
    $Different = 0
    $HashErrors = 0

    foreach ($File in $SourceFiles) {

        $Relative = $File.FullName.Substring(
            $Source.Length
        ).TrimStart('\')

        $CopyFile = Join-Path `
            $Destination.FullName `
            $Relative

        if (!(Test-Path -LiteralPath $CopyFile)) {
            $Missing++
            continue
        }

        $HashSource = Get-FileHashSafe $File.FullName
        $HashCopy = Get-FileHashSafe $CopyFile

        if (
            $HashSource -eq "HASH_ERROR" -or
            $HashCopy -eq "HASH_ERROR"
        ) {
            $HashErrors++
        }
        elseif ($HashSource -ne $HashCopy) {
            $Different++
        }
    }

    $GitDirectory = Join-Path $Destination.FullName ".git"
    $GitExists = Test-Path $GitDirectory

    $Result = [PSCustomObject]@{
        Project          = $Name
        SourceFiles      = $SourceFiles.Count
        BackupFiles      = $DestinationFiles.Count
        SourceBytes      = $SourceBytes
        BackupBytes      = $DestinationBytes
        MissingFiles     = $Missing
        DifferentHashes  = $Different
        HashErrors       = $HashErrors
        GitDirectory     = $GitExists
        BackupPath       = $Destination.FullName
    }

    $ProjectResults += $Result

    if (
        $Missing -eq 0 -and
        $Different -eq 0 -and
        $HashErrors -eq 0
    ) {
        Write-Log "PROJECT VERIFIED: $Name"
    }
    else {
        Write-Log "PROJECT VERIFICATION WARNING: $Name"
    }
}

$ProjectResults |
    ConvertTo-Json -Depth 5 |
    Set-Content `
        (Join-Path $FinalRoot "Verification\projects.json") `
        -Encoding UTF8

# ============================================================
# 2. DOCKER STATUS AND METADATA
# ============================================================

Write-Log "Checking Docker"

$DockerAvailable = $false

try {
    $DockerVersion = docker version 2>&1

    if ($LASTEXITCODE -eq 0) {
        $DockerAvailable = $true
        Save-Text `
            (Join-Path $FinalRoot "Docker\docker-version.txt") `
            ($DockerVersion | Out-String)
    }
}
catch {
    Write-Log "Docker command failed."
}

if ($DockerAvailable) {

    Write-Log "Collecting Docker metadata"

    docker ps -a --no-trunc |
        Out-File `
            (Join-Path $FinalRoot "Docker\containers.txt") `
            -Encoding UTF8

    docker images --digests --no-trunc |
        Out-File `
            (Join-Path $FinalRoot "Docker\images.txt") `
            -Encoding UTF8

    docker network ls |
        Out-File `
            (Join-Path $FinalRoot "Docker\networks.txt") `
            -Encoding UTF8

    docker volume ls |
        Out-File `
            (Join-Path $FinalRoot "Docker\volumes.txt") `
            -Encoding UTF8

    docker info 2>&1 |
        Out-File `
            (Join-Path $FinalRoot "Docker\docker-info.txt") `
            -Encoding UTF8

    $Containers = @(
        docker ps -aq
    )

    foreach ($ContainerId in $Containers) {

        if ([string]::IsNullOrWhiteSpace($ContainerId)) {
            continue
        }

        $Info = docker inspect $ContainerId 2>$null

        if ($LASTEXITCODE -eq 0) {
            $Info |
                Out-File `
                    (Join-Path `
                        $FinalRoot `
                        "Docker\container-$ContainerId.json") `
                    -Encoding UTF8
        }
    }

    $Volumes = @(
        docker volume ls -q
    )

    foreach ($Volume in $Volumes) {

        if ([string]::IsNullOrWhiteSpace($Volume)) {
            continue
        }

        $Info = docker volume inspect $Volume 2>$null

        if ($LASTEXITCODE -eq 0) {
            $Info |
                Out-File `
                    (Join-Path `
                        $FinalRoot `
                        "Docker\volume-$Volume.json") `
                    -Encoding UTF8
        }
    }

    # --------------------------------------------------------
    # 3. EXPORT DOCKER IMAGES
    # --------------------------------------------------------

    Write-Log "Exporting Docker images"

    $ImageNames = @(
        "general-market-backend:local",
        "postgres:18",
        "redis:8"
    )

    foreach ($ContainerId in $Containers) {

        $Image = docker inspect `
            --format '{{.Config.Image}}' `
            $ContainerId 2>$null

        if (
            $LASTEXITCODE -eq 0 -and
            ![string]::IsNullOrWhiteSpace($Image)
        ) {
            $ImageNames += $Image.Trim()
        }
    }

    $ImageNames = $ImageNames |
        Sort-Object -Unique

    foreach ($Image in $ImageNames) {

        $Exists = docker image inspect $Image 2>$null

        if ($LASTEXITCODE -ne 0) {
            Write-Log "IMAGE NOT AVAILABLE: $Image"
            continue
        }

        $SafeName = $Image -replace '[^a-zA-Z0-9_.-]', '_'
        $ImageFile = Join-Path `
            $FinalRoot `
            "Docker\image-$SafeName.tar"

        Write-Log "Saving image: $Image"

        docker image save -o $ImageFile $Image

        if ($LASTEXITCODE -eq 0 -and (Test-Path $ImageFile)) {
            Write-Log "IMAGE SAVED: $Image"
        }
        else {
            Write-Log "IMAGE SAVE FAILED: $Image"
        }
    }

    # --------------------------------------------------------
    # 4. POSTGRESQL
    # --------------------------------------------------------

    Write-Log "Checking PostgreSQL"

    $PgContainer = "account-postgres"

    $PgState = docker inspect `
        --format '{{.State.Status}}' `
        $PgContainer 2>$null

    if ($LASTEXITCODE -eq 0) {

        if ($PgState -ne "running") {

            Write-Log "PostgreSQL is not running. Trying safe start."

            docker start $PgContainer 2>&1 |
                Out-File `
                    (Join-Path $FinalRoot "PostgreSQL\start-attempt.txt") `
                    -Encoding UTF8

            if ($LASTEXITCODE -ne 0) {
                Write-Log "PostgreSQL start failed. No volume changes made."
            }
            else {
                Write-Log "PostgreSQL start command succeeded."
            }
        }

        $PgState = docker inspect `
            --format '{{.State.Status}}' `
            $PgContainer 2>$null

        if ($PgState -eq "running") {

            $PgEnv = docker inspect `
                --format '{{range .Config.Env}}{{println .}}{{end}}' `
                $PgContainer

            $PgUserLine = $PgEnv |
                Where-Object { $_ -like "POSTGRES_USER=*" } |
                Select-Object -First 1

            $PgUser = "account"

            if ($PgUserLine) {
                $PgUser = $PgUserLine.Substring(
                    "POSTGRES_USER=".Length
                )
            }

            Write-Log "PostgreSQL is running. User: $PgUser"

            $RoleQuery = @"
SELECT rolname, rolsuper, rolcreaterole, rolcreatedb
FROM pg_roles
ORDER BY rolname;
"@

            docker exec $PgContainer `
                psql -U $PgUser -d postgres -Atc $RoleQuery 2>&1 |
                Out-File `
                    (Join-Path $FinalRoot "PostgreSQL\roles.txt") `
                    -Encoding UTF8

            $DatabaseQuery = @"
SELECT datname
FROM pg_database
WHERE datistemplate = false
ORDER BY datname;
"@

            docker exec $PgContainer `
                psql -U $PgUser -d postgres -Atc $DatabaseQuery 2>&1 |
                Out-File `
                    (Join-Path $FinalRoot "PostgreSQL\databases.txt") `
                    -Encoding UTF8

            $SuperUserQuery = @"
SELECT rolsuper
FROM pg_roles
WHERE rolname = current_user;
"@

            $IsSuper = docker exec $PgContainer `
                psql -U $PgUser -d postgres -Atc $SuperUserQuery 2>$null

            if (
                $LASTEXITCODE -eq 0 -and
                $IsSuper.Trim() -eq "t"
            ) {

                Write-Log "Creating full PostgreSQL cluster dump"

                $DumpFile = Join-Path `
                    $FinalRoot `
                    "PostgreSQL\full-cluster-final.sql"

                docker exec $PgContainer `
                    pg_dumpall -U $PgUser 2>$null |
                    Out-File $DumpFile -Encoding utf8

                if (
                    $LASTEXITCODE -eq 0 -and
                    (Test-Path $DumpFile) -and
                    (Get-Item $DumpFile).Length -gt 0
                ) {
                    Write-Log "Full PostgreSQL dump created."
                }
                else {
                    Write-Log "Full PostgreSQL dump FAILED."
                }
            }
            else {
                Write-Log "PostgreSQL user is not superuser. Full dump skipped."
            }

            docker exec $PgContainer `
                psql -U $PgUser -d postgres -Atc "SHOW data_directory;" 2>&1 |
                Out-File `
                    (Join-Path $FinalRoot "PostgreSQL\data-directory.txt") `
                    -Encoding UTF8
        }
        else {
            Write-Log "PostgreSQL remains unavailable."
        }
    }
    else {
        Write-Log "PostgreSQL container not found."
    }

    # --------------------------------------------------------
    # 5. REDIS
    # --------------------------------------------------------

    Write-Log "Checking Redis"

    $RedisContainer = "account-redis"

    $RedisState = docker inspect `
        --format '{{.State.Status}}' `
        $RedisContainer 2>$null

    if ($LASTEXITCODE -eq 0 -and $RedisState -eq "running") {

        $RedisInfo = docker exec $RedisContainer `
            redis-cli INFO persistence 2>&1

        $RedisInfo |
            Out-File `
                (Join-Path $FinalRoot "Redis\persistence-info.txt") `
                -Encoding UTF8

        Write-Log "Requesting Redis SAVE checkpoint"

        docker exec $RedisContainer redis-cli SAVE 2>&1 |
            Out-File `
                (Join-Path $FinalRoot "Redis\save-result.txt") `
                -Encoding UTF8

        if ($LASTEXITCODE -eq 0) {

            $RedisDir = docker exec $RedisContainer `
                redis-cli --raw CONFIG GET dir

            $RedisFile = docker exec $RedisContainer `
                redis-cli --raw CONFIG GET dbfilename

            if (
                $RedisDir.Count -ge 2 -and
                $RedisFile.Count -ge 2
            ) {

                $RdbPath = "$($RedisDir[1])/$($RedisFile[1])"

                docker cp `
                    "${RedisContainer}:$RdbPath" `
                    (Join-Path $FinalRoot "Redis\dump.rdb") 2>&1 |
                    Out-File `
                        (Join-Path $FinalRoot "Redis\copy-result.txt") `
                        -Encoding UTF8

                if ($LASTEXITCODE -eq 0) {
                    Write-Log "Redis RDB copied."
                }
                else {
                    Write-Log "Redis RDB copy failed."
                }
            }
        }
    }
    else {
        Write-Log "Redis is not running. Existing volume archive retained."
    }
}

# ============================================================
# 6. VERIFY EXISTING ARCHIVES
# ============================================================

Write-Log "Checking existing physical archives"

$Archives = @(
    Get-ChildItem $BackupRoot -Recurse -File |
        Where-Object {
            $_.Extension -in @(".tar", ".gz", ".tgz")
        }
)

$ArchiveResults = @()

foreach ($Archive in $Archives) {

    $Valid = $false

    try {
        tar -tf $Archive.FullName *> $null
        $Valid = ($LASTEXITCODE -eq 0)
    }
    catch {
        $Valid = $false
    }

    $ArchiveResults += [PSCustomObject]@{
        File   = $Archive.FullName
        Bytes  = $Archive.Length
        Valid  = $Valid
    }

    if ($Valid) {
        Write-Log "ARCHIVE VERIFIED: $($Archive.Name)"
    }
    else {
        Write-Log "ARCHIVE VERIFICATION FAILED: $($Archive.Name)"
    }
}

$ArchiveResults |
    ConvertTo-Json -Depth 4 |
    Set-Content `
        (Join-Path $FinalRoot "Verification\archives.json") `
        -Encoding UTF8

# ============================================================
# 7. EXISTING SQL FILES
# ============================================================

Write-Log "Checking SQL files"

$SqlFiles = @(
    Get-ChildItem $BackupRoot -Recurse -File -Filter "*.sql"
)

$SqlResults = @()

foreach ($Sql in $SqlFiles) {

    $Text = Get-Content $Sql.FullName -TotalCount 100 `
        -ErrorAction SilentlyContinue

    $SqlResults += [PSCustomObject]@{
        File         = $Sql.FullName
        Bytes        = $Sql.Length
        NonEmpty     = ($Sql.Length -gt 0)
        HasSQLHeader = (
            ($Text -join "`n") -match
            "PostgreSQL|CREATE ROLE|CREATE DATABASE|Dumped from"
        )
    }
}

$SqlResults |
    ConvertTo-Json -Depth 4 |
    Set-Content `
        (Join-Path $FinalRoot "Verification\sql-files.json") `
        -Encoding UTF8

# ============================================================
# 8. DEVELOPMENT ENVIRONMENT
# ============================================================

Write-Log "Backing up development settings"

$DevRoot = Join-Path $FinalRoot "Development"

try {
    git --version 2>&1 |
        Out-File "$DevRoot\git-version.txt" -Encoding UTF8

    git config --global --list 2>&1 |
        Out-File "$DevRoot\git-global-config.txt" -Encoding UTF8
}
catch {}

try {
    go version 2>&1 |
        Out-File "$DevRoot\go-version.txt" -Encoding UTF8

    go env 2>&1 |
        Out-File "$DevRoot\go-env.txt" -Encoding UTF8
}
catch {}

try {
    code --version 2>&1 |
        Out-File "$DevRoot\vscode-version.txt" -Encoding UTF8

    code --list-extensions 2>&1 |
        Out-File "$DevRoot\vscode-extensions.txt" -Encoding UTF8
}
catch {}

try {
    $ProfilePath = $PROFILE

    if (Test-Path $ProfilePath) {
        Copy-Item $ProfilePath "$DevRoot\PowerShell-Profile.ps1" -Force
    }
}
catch {}

# SSH private keys are intentionally NOT copied.
$SshRoot = Join-Path $env:USERPROFILE ".ssh"

if (Test-Path $SshRoot) {

    Get-ChildItem $SshRoot -File |
        Where-Object {
            $_.Name -like "*.pub"
        } |
        Select-Object Name, Length, LastWriteTime |
        Export-Csv `
            "$DevRoot\ssh-public-key-inventory.csv" `
            -NoTypeInformation `
            -Encoding UTF8

    Write-Log "SSH private keys were not copied."
}

# ============================================================
# 9. DOCKER DESKTOP DISK CANDIDATES
# ============================================================

Write-Log "Checking common Docker disk locations"

$DockerCandidates = @(
    "$env:LOCALAPPDATA\Docker\wsl\disk\docker_data.vhdx",
    "$env:LOCALAPPDATA\Docker\wsl\data\ext4.vhdx",
    "$env:LOCALAPPDATA\Docker\wsl\main\ext4.vhdx",
    "$env:APPDATA\Docker\settings-store.json",
    "$env:APPDATA\Docker\settings.json"
)

$DiskResults = foreach ($Path in $DockerCandidates) {

    if (Test-Path $Path) {

        $Item = Get-Item $Path

        [PSCustomObject]@{
            Path             = $Item.FullName
            Exists           = $true
            Bytes            = $Item.Length
            LastWriteTime    = $Item.LastWriteTime
        }
    }
    else {
        [PSCustomObject]@{
            Path             = $Path
            Exists           = $false
            Bytes            = 0
            LastWriteTime    = $null
        }
    }
}

$DiskResults |
    ConvertTo-Json -Depth 4 |
    Set-Content `
        (Join-Path $FinalRoot "System\docker-disk-locations.json") `
        -Encoding UTF8

# ============================================================
# 10. SYSTEM INFORMATION
# ============================================================

Write-Log "Collecting system information"

Get-ComputerInfo |
    Out-File `
        (Join-Path $FinalRoot "System\computer-info.txt") `
        -Encoding UTF8

Get-PSDrive -PSProvider FileSystem |
    Format-Table -AutoSize |
    Out-File `
        (Join-Path $FinalRoot "System\drives.txt") `
        -Encoding UTF8

# ============================================================
# 11. FINAL FILE MANIFEST
# ============================================================

Write-Log "Generating final SHA256 manifest"

$ManifestPath = Join-Path `
    $FinalRoot `
    "Verification\SHA256-MANIFEST.csv"

$Manifest = @(
    Get-ChildItem $BackupRoot -Recurse -File |
        Where-Object {
            $_.FullName -ne $ManifestPath
        } |
        ForEach-Object {

            [PSCustomObject]@{
                RelativePath = $_.FullName.Substring(
                    $BackupRoot.Length
                ).TrimStart('\')

                Bytes = $_.Length

                SHA256 = Get-FileHashSafe $_.FullName
            }
        }
)

$Manifest |
    Export-Csv $ManifestPath `
        -NoTypeInformation `
        -Encoding UTF8

# ============================================================
# 12. FINAL REPORT
# ============================================================

Write-Log "Creating final report"

$Report = @"
IGD PLATFORM FINAL BACKUP REPORT
================================

Date:
$(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

Project Root:
$ProjectRoot

Backup Root:
$BackupRoot

Final Verification:
$FinalRoot

Project verification:
$($ProjectResults | ConvertTo-Json -Depth 5)

Archive verification:
$($ArchiveResults | ConvertTo-Json -Depth 4)

SQL file verification:
$($SqlResults | ConvertTo-Json -Depth 4)

Docker available:
$DockerAvailable

IMPORTANT:
This script does not perform a real database restore test.
Docker Desktop disk storage must be checked separately.
SSH private keys were not copied.
A failed PostgreSQL start must be investigated.
"@

Save-Text `
    (Join-Path $FinalRoot "Reports\FINAL-REPORT.txt") `
    $Report

Write-Log "FINAL DATA COLLECTION COMPLETED"

# ============================================================
# 13. OPTIONAL EXTERNAL DRIVE COPY
# ============================================================

Write-Host ""
Write-Host "Enter external drive destination."
Write-Host "Example: F:\IGD-PLATFORM-BACKUP"
Write-Host "Leave blank to skip."

$ExternalPath = Read-Host "External destination"

if (![string]::IsNullOrWhiteSpace($ExternalPath)) {

    $DriveRoot = [System.IO.Path]::GetPathRoot(
        [System.IO.Path]::GetFullPath($ExternalPath)
    )

    if (!(Test-Path $DriveRoot)) {
        Write-Log "External drive not available. Copy skipped."
    }
    else {

        New-Item -ItemType Directory `
            -Path $ExternalPath `
            -Force | Out-Null

        Write-Log "Copying complete backup to external drive"

        robocopy `
            $BackupRoot `
            $ExternalPath `
            /E /COPY:DAT /DCOPY:DAT /R:2 /W:2 /XJ /NP `
            /LOG+:"$FinalRoot\Reports\external-copy.log"

        $CopyCode = $LASTEXITCODE

        if ($CopyCode -le 7) {
            Write-Log "External copy command completed. Hash verification still required."
        }
        else {
            Write-Log "External copy FAILED. Robocopy code: $CopyCode"
        }
    }
}

Write-Log "SCRIPT FINISHED"

Write-Host ""
Write-Host "========================================"
Write-Host "FINAL BACKUP CHECK FINISHED"
Write-Host "========================================"
Write-Host "Backup: $BackupRoot"
Write-Host "Report: $FinalRoot\Reports\FINAL-REPORT.txt"
Write-Host "Log: $LogFile"
Write-Host ""
Write-Host "Do not reinstall Windows until the report is reviewed."