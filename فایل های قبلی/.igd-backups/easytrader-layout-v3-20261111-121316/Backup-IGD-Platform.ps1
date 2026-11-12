
$ErrorActionPreference = "Stop"

# ------------------------------------------------------------
# Configuration
# ------------------------------------------------------------

$Desktop = [Environment]::GetFolderPath("Desktop")
$WorkspaceRoot = Split-Path -Parent $PSScriptRoot

$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$BackupRoot = Join-Path $Desktop "IGD-PLATFORM-BACKUP"
$Backup = Join-Path $BackupRoot "Backup-$Stamp"

$ProjectNames = @(
    "Real-Asset-Management-Platform",
    "Real-Asset-Management-Platform-Git",
    "real-asset-platform-service-service",
    "test"
)

$ContainerNames = @(
    "account-backend-market-1",
    "account-postgres",
    "account-redis"
)

$VolumeNames = @(
    "account-backend_postgres_data",
    "account-backend_redis_data"
)

$HelperImage = "postgres:18"
$StoppedContainers = @()

# ------------------------------------------------------------
# Helper functions
# ------------------------------------------------------------

function Invoke-RoboCopy {
    param(
        [string]$Source,
        [string]$Destination,
        [string]$LogFile
    )

    if (!(Test-Path -LiteralPath $Source)) {
        throw "Source directory not found: $Source"
    }

    New-Item -ItemType Directory -Force -Path $Destination |
        Out-Null

    & robocopy $Source $Destination `
        /E /COPY:DAT /DCOPY:DAT /R:2 /W:2 /XJ /NP `
        "/LOG:$LogFile"

    $Code = $LASTEXITCODE

    if ($Code -ge 8) {
        throw "Robocopy failed with exit code $Code. Log: $LogFile"
    }
}

function Save-DockerInspect {
    param(
        [string]$ContainerName,
        [string]$OutputFile
    )

    $Raw = & docker inspect $ContainerName

    if ($LASTEXITCODE -ne 0) {
        throw "Could not inspect container: $ContainerName"
    }

    $Objects = ($Raw -join "`n") | ConvertFrom-Json

    foreach ($Item in $Objects) {
        if ($null -ne $Item.Config.Env) {
            $Item.Config.Env = @(
                foreach ($Entry in $Item.Config.Env) {
                    $Key = ($Entry -split "=", 2)[0]
                    "$Key=<REDACTED>"
                }
            )
        }
    }

    $Objects |
        ConvertTo-Json -Depth 100 |
        Set-Content -LiteralPath $OutputFile -Encoding UTF8
}

function Get-FolderStats {
    param([string]$Path)

    $Files = @(
        Get-ChildItem -LiteralPath $Path -Recurse -File -Force `
            -ErrorAction Stop
    )

    $TotalBytes = ($Files | Measure-Object -Property Length -Sum).Sum

    if ($null -eq $TotalBytes) {
        $TotalBytes = 0
    }

    [PSCustomObject]@{
        Path = $Path
        FileCount = $Files.Count
        TotalBytes = [long]$TotalBytes
    }
}

# ------------------------------------------------------------
# Preflight checks
# ------------------------------------------------------------

Write-Host "`n=== IGD BACKUP: PRECHECK ===" -ForegroundColor Cyan

if (!(Test-Path -LiteralPath $Desktop)) {
    throw "Desktop directory not found."
}

if (!(Test-Path -LiteralPath $PSScriptRoot)) {
    throw "Script directory not found."
}

foreach ($ProjectName in $ProjectNames) {
    $ProjectPath = Join-Path $WorkspaceRoot $ProjectName

    if (!(Test-Path -LiteralPath $ProjectPath -PathType Container)) {
        throw "Project directory not found: $ProjectPath"
    }
}

& docker info | Out-Null

if ($LASTEXITCODE -ne 0) {
    throw "Docker is not available."
}

foreach ($ContainerName in $ContainerNames) {
    $Running = & docker inspect -f '{{.State.Running}}' $ContainerName

    if ($LASTEXITCODE -ne 0 -or $Running -ne "true") {
        throw "Required container is not running: $ContainerName"
    }
}

foreach ($VolumeName in $VolumeNames) {
    & docker volume inspect $VolumeName | Out-Null

    if ($LASTEXITCODE -ne 0) {
        throw "Required Docker volume not found: $VolumeName"
    }
}

& docker image inspect $HelperImage | Out-Null

if ($LASTEXITCODE -ne 0) {
    throw "Helper image is not available: $HelperImage"
}

& docker run --rm --network none --entrypoint tar $HelperImage --version |
    Out-Null

if ($LASTEXITCODE -ne 0) {
    throw "The helper image does not have a working tar command."
}

# Check free space on the destination drive.
$DestinationDrive = ([System.IO.Path]::GetPathRoot($Desktop)).TrimEnd("\").TrimEnd(":")
$Drive = Get-PSDrive -Name $DestinationDrive

$FreeGB = [math]::Round($Drive.Free / 1GB, 2)

Write-Host "Destination: $Backup"
Write-Host "Free space: $FreeGB GB"

if ($Drive.Free -lt 5GB) {
    throw "Insufficient free space. At least 5 GB is required."
}

# Create backup directories.
$Directories = @(
    "Projects",
    "Databases\PostgreSQL",
    "Databases\Redis",
    "Docker\containers",
    "Docker\volumes",
    "Docker\images",
    "Docker\configuration",
    "Development-Environment\VSCode",
    "Development-Environment\Git",
    "Development-Environment\Go",
    "Development-Environment\PowerShell",
    "Backup-Report",
    "Logs"
)

foreach ($Directory in $Directories) {
    New-Item -ItemType Directory -Force `
        -Path (Join-Path $Backup $Directory) | Out-Null
}

$MainLog = Join-Path $Backup "Backup-Report\backup-log.txt"
"IGD backup started: $(Get-Date -Format o)" |
    Set-Content -LiteralPath $MainLog -Encoding UTF8

try {

    # --------------------------------------------------------
    # 1. Copy all project folders
    # --------------------------------------------------------

    Write-Host "`n=== COPYING PROJECTS ===" -ForegroundColor Cyan

    foreach ($ProjectName in $ProjectNames) {
        $Source = Join-Path $WorkspaceRoot $ProjectName
        $Destination = Join-Path $Backup "Projects\$ProjectName"
        $Log = Join-Path $Backup "Logs\project-$ProjectName.log"

        Write-Host "Copying: $ProjectName"

        Invoke-RoboCopy -Source $Source `
            -Destination $Destination -LogFile $Log
    }

    # --------------------------------------------------------
    # 2. Save development environment settings
    # --------------------------------------------------------

    Write-Host "`n=== DEVELOPMENT SETTINGS ===" -ForegroundColor Cyan

    $VSCodeUser = Join-Path $env:APPDATA "Code\User"
    $VSCodeDestination = Join-Path $Backup "Development-Environment\VSCode\User"

    if (Test-Path $VSCodeUser) {
        New-Item -ItemType Directory -Force `
            -Path $VSCodeDestination | Out-Null

        foreach ($FileName in @("settings.json", "keybindings.json")) {
            $SourceFile = Join-Path $VSCodeUser $FileName

            if (Test-Path $SourceFile) {
                Copy-Item -LiteralPath $SourceFile `
                    -Destination $VSCodeDestination -Force
            }
        }

        foreach ($FolderName in @("snippets", "profiles")) {
            $SourceFolder = Join-Path $VSCodeUser $FolderName

            if (Test-Path $SourceFolder) {
                Invoke-RoboCopy -Source $SourceFolder `
                    -Destination (Join-Path $VSCodeDestination $FolderName) `
                    -LogFile (Join-Path $Backup "Logs\vscode-$FolderName.log")
            }
        }
    }

    $ExtensionsPath = Join-Path $env:USERPROFILE ".vscode\extensions"

    if (Test-Path $ExtensionsPath) {
        Invoke-RoboCopy -Source $ExtensionsPath `
            -Destination (Join-Path $Backup "Development-Environment\VSCode\Extensions") `
            -LogFile (Join-Path $Backup "Logs\vscode-extensions.log")
    }

    $GitConfig = Join-Path $env:USERPROFILE ".gitconfig"

    if (Test-Path $GitConfig) {
        Copy-Item $GitConfig `
            (Join-Path $Backup "Development-Environment\Git\.gitconfig")
    }

    & git --version 2>&1 |
        Set-Content (Join-Path $Backup "Development-Environment\Git\git-version.txt")

    & go version 2>&1 |
        Set-Content (Join-Path $Backup "Development-Environment\Go\go-version.txt")

    & go env 2>&1 |
        Set-Content (Join-Path $Backup "Development-Environment\Go\go-env.txt")

    & code --list-extensions 2>&1 |
        Set-Content (Join-Path $Backup "Development-Environment\VSCode\extensions-list.txt")

    if (Test-Path $PROFILE) {
        Copy-Item -LiteralPath $PROFILE `
            -Destination (Join-Path $Backup "Development-Environment\PowerShell\profile.ps1")
    }

    # --------------------------------------------------------
    # 3. Save Docker configuration and metadata
    # --------------------------------------------------------

    Write-Host "`n=== DOCKER METADATA ===" -ForegroundColor Cyan

    $DockerConfig = Join-Path $Backup "Docker\configuration"

    foreach ($FileName in @(
        "settings-store.json",
        "features-overrides.json"
    )) {
        $SourceFile = Join-Path $env:APPDATA "Docker\$FileName"

        if (Test-Path $SourceFile) {
            Copy-Item -LiteralPath $SourceFile `
                -Destination $DockerConfig -Force
        }
    }

    & docker ps -a --no-trunc |
        Set-Content (Join-Path $DockerConfig "containers.txt")

    & docker image ls --no-trunc |
        Set-Content (Join-Path $DockerConfig "images.txt")

    & docker volume ls |
        Set-Content (Join-Path $DockerConfig "volumes.txt")

    & docker network ls |
        Set-Content (Join-Path $DockerConfig "networks.txt")

    foreach ($ContainerName in $ContainerNames) {
        $OutputFile = Join-Path $Backup `
            "Docker\containers\$ContainerName.json"

        Save-DockerInspect -ContainerName $ContainerName `
            -OutputFile $OutputFile
    }

    & docker volume inspect @VolumeNames |
        Set-Content (Join-Path $Backup "Docker\volumes\volume-inspect.json")

    # Save the images required by the running containers.
    $ImageNames = @(
        "general-market-backend:local",
        "postgres:18",
        "redis:8"
    )

    $ImageArchive = Join-Path $Backup "Docker\images\docker-images.tar"

    & docker image save -o $ImageArchive @ImageNames

    if ($LASTEXITCODE -ne 0 -or !(Test-Path $ImageArchive)) {
        throw "Docker image backup failed."
    }

    # --------------------------------------------------------
    # 4. Stop application container first
    # --------------------------------------------------------

    Write-Host "`n=== STOPPING APPLICATION ===" -ForegroundColor Yellow

    & docker stop --time 60 account-backend-market-1 | Out-Null

    if ($LASTEXITCODE -ne 0) {
        throw "Could not stop the market backend container."
    }

    $StoppedContainers += "account-backend-market-1"

    # --------------------------------------------------------
    # 5. PostgreSQL full logical backup
    # --------------------------------------------------------

    Write-Host "`n=== POSTGRESQL BACKUP ===" -ForegroundColor Cyan

    $DumpInsideContainer = "/tmp/igd-full-cluster.sql"

    & docker exec account-postgres pg_dumpall `
        -U account -f $DumpInsideContainer

    if ($LASTEXITCODE -ne 0) {
        throw "PostgreSQL full cluster backup failed."
    }

    $PostgresDump = Join-Path $Backup `
        "Databases\PostgreSQL\full-cluster.sql"

    & docker cp "account-postgres:$DumpInsideContainer" $PostgresDump

    if ($LASTEXITCODE -ne 0 -or !(Test-Path $PostgresDump)) {
        throw "Could not copy PostgreSQL backup."
    }

    $DumpInfo = Get-Item $PostgresDump

    if ($DumpInfo.Length -eq 0) {
        throw "PostgreSQL backup file is empty."
    }

    & docker exec account-postgres rm -f $DumpInsideContainer |
        Out-Null

    # --------------------------------------------------------
    # 6. Redis persistence checkpoint
    # --------------------------------------------------------

    Write-Host "`n=== REDIS CHECKPOINT ===" -ForegroundColor Cyan

    & docker exec account-redis redis-cli SAVE

    if ($LASTEXITCODE -ne 0) {
        throw "Redis SAVE operation failed."
    }

    # --------------------------------------------------------
    # 7. Stop database containers gracefully
    # --------------------------------------------------------

    Write-Host "`n=== STOPPING DATABASE CONTAINERS ===" -ForegroundColor Yellow

    foreach ($ContainerName in @("account-postgres", "account-redis")) {
        & docker stop --time 60 $ContainerName | Out-Null

        if ($LASTEXITCODE -ne 0) {
            throw "Could not stop container: $ContainerName"
        }

        $StoppedContainers += $ContainerName
    }

    # --------------------------------------------------------
    # 8. Physical Docker volume backups
    # --------------------------------------------------------

    Write-Host "`n=== PHYSICAL VOLUME BACKUP ===" -ForegroundColor Cyan

    $VolumeDestination = Join-Path $Backup "Docker\volumes"

    foreach ($VolumeName in $VolumeNames) {
        $ArchiveName = "$VolumeName.tar.gz"

        $DockerDestination = "${VolumeDestination}:/backup"
        $DockerVolume = "${VolumeName}:/source:ro"

        Write-Host "Archiving volume: $VolumeName"

        & docker run --rm --network none `
            -v $DockerVolume `
            -v $DockerDestination `
            $HelperImage `
            tar -czf "/backup/$ArchiveName" -C /source .

        if ($LASTEXITCODE -ne 0) {
            throw "Physical volume backup failed: $VolumeName"
        }

        $ArchivePath = Join-Path $VolumeDestination $ArchiveName

        if (!(Test-Path $ArchivePath) -or
            (Get-Item $ArchivePath).Length -eq 0) {
            throw "Volume archive is missing or empty: $ArchiveName"
        }

        # Verify archive readability.
        & docker run --rm --network none `
            -v "${VolumeDestination}:/backup:ro" `
            $HelperImage `
            tar -tzf "/backup/$ArchiveName" |
            Out-Null

        if ($LASTEXITCODE -ne 0) {
            throw "Volume archive verification failed: $ArchiveName"
        }
    }

    # --------------------------------------------------------
    # 9. Project copy verification
    # --------------------------------------------------------

    Write-Host "`n=== VERIFYING PROJECT COPIES ===" -ForegroundColor Cyan

    $ProjectStats = @()

    foreach ($ProjectName in $ProjectNames) {
        $Source = Join-Path $WorkspaceRoot $ProjectName
        $Destination = Join-Path $Backup "Projects\$ProjectName"

        $SourceStats = Get-FolderStats $Source
        $DestinationStats = Get-FolderStats $Destination

        $ProjectStats += [PSCustomObject]@{
            Project = $ProjectName
            SourceFiles = $SourceStats.FileCount
            BackupFiles = $DestinationStats.FileCount
            SourceBytes = $SourceStats.TotalBytes
            BackupBytes = $DestinationStats.TotalBytes
            Verified = (
                $SourceStats.FileCount -eq $DestinationStats.FileCount -and
                $SourceStats.TotalBytes -eq $DestinationStats.TotalBytes
            )
        }
    }

    $ProjectStats |
        Export-Csv (Join-Path $Backup "Backup-Report\project-verification.csv") `
            -NoTypeInformation -Encoding UTF8

    if ($ProjectStats.Verified -contains $false) {
        throw "One or more project copies failed verification."
    }

    # --------------------------------------------------------
    # 10. Generate file manifest
    # --------------------------------------------------------

    Write-Host "`n=== GENERATING FILE MANIFEST ===" -ForegroundColor Cyan

    $Manifest = Get-ChildItem -LiteralPath $Backup -Recurse -File -Force |
        Where-Object { $_.FullName -notlike "*\Backup-Report\file-manifest.csv" } |
        ForEach-Object {
            [PSCustomObject]@{
                RelativePath = $_.FullName.Substring($Backup.Length + 1)
                Length = $_.Length
                SHA256 = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash
            }
        }

    $Manifest |
        Export-Csv (Join-Path $Backup "Backup-Report\file-manifest.csv") `
            -NoTypeInformation -Encoding UTF8

    "Backup completed: $(Get-Date -Format o)" |
        Add-Content -LiteralPath $MainLog -Encoding UTF8

    "PostgreSQL dump bytes: $($DumpInfo.Length)" |
        Add-Content -LiteralPath $MainLog -Encoding UTF8

    "Project copies verified: $($ProjectStats.Verified -notcontains $false)" |
        Add-Content -LiteralPath $MainLog -Encoding UTF8

    Write-Host "`nBACKUP DATA COLLECTION COMPLETED." -ForegroundColor Green
}
catch {
    $ErrorMessage = $_.Exception.Message

    Write-Host "`nBACKUP ERROR: $ErrorMessage" -ForegroundColor Red

    "BACKUP ERROR: $ErrorMessage" |
        Add-Content -LiteralPath $MainLog -Encoding UTF8
}
finally {

    # --------------------------------------------------------
    # Always restart containers that this script stopped.
    # --------------------------------------------------------

    Write-Host "`n=== RESTARTING CONTAINERS ===" -ForegroundColor Yellow

    foreach ($ContainerName in @(
        "account-postgres",
        "account-redis",
        "account-backend-market-1"
    )) {
        if ($StoppedContainers -contains $ContainerName) {
            & docker start $ContainerName

            if ($LASTEXITCODE -ne 0) {
                Write-Host "WARNING: Could not restart $ContainerName" `
                    -ForegroundColor Red
            }
        }
    }
}

Write-Host "`nBackup folder: $Backup" -ForegroundColor Cyan
Write-Host "Review the backup log before moving the folder." -ForegroundColor Cyan
