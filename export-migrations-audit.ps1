
param(
    [string]$RepositoryPath = (Get-Location).Path,
    [string]$OutputFile = "migration-audit-report.txt"
)

$ErrorActionPreference = "Stop"

$RepositoryPath = (Resolve-Path $RepositoryPath).Path
$OutputPath = if ([System.IO.Path]::IsPathRooted($OutputFile)) {
    $OutputFile
} else {
    Join-Path $RepositoryPath $OutputFile
}

# Directories that should not be scanned.
$ExcludedDirectories = @(
    ".git",
    "node_modules",
    "vendor",
    "bin",
    "obj",
    "dist",
    "build",
    ".next",
    "coverage"
)

# Relevant migration, schema and database file extensions.
$RelevantExtensions = @(
    ".sql", ".go", ".prisma", ".py", ".ts", ".js",
    ".json", ".yaml", ".yml", ".toml", ".xml",
    ".md", ".txt", ".ps1", ".sh", ".graphql"
)

# Include files based on their paths or filenames.
$PathPattern = '(?i)(^|[/\\])([^/\\]*(migration|migrations|migrate|schema|schemas|database|databases|db|seed|seeds|ddl|changelog)[^/\\]*[/\\]|[^/\\]*(migration|migrations|schema|seed|changelog|flyway|liquibase)[^/\\]*)'

$Content = [System.Collections.Generic.List[string]]::new()

function Add-ReportLine {
    param([AllowEmptyString()][string]$Text = "")
    $script:Content.Add($Text)
}

Add-ReportLine "IGD - MIGRATION AND DATABASE AUDIT REPORT"
Add-ReportLine "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Add-ReportLine "Repository: $RepositoryPath"
Add-ReportLine "Output: $OutputPath"
Add-ReportLine ("=" * 100)

# Git metadata.
Add-ReportLine "`r`n### 1. GIT STATUS"

if (Get-Command git -ErrorAction SilentlyContinue) {
    $GitRoot = git -C $RepositoryPath rev-parse --show-toplevel 2>$null

    if ($LASTEXITCODE -eq 0) {
        Add-ReportLine "Git root: $GitRoot"
        Add-ReportLine "`r`n--- Current branch ---"
        Add-ReportLine ((git -C $RepositoryPath branch --show-current 2>&1 | Out-String).Trim())

        Add-ReportLine "`r`n--- Working tree status ---"
        Add-ReportLine ((git -C $RepositoryPath status --short 2>&1 | Out-String).Trim())

        Add-ReportLine "`r`n--- Latest 20 commits ---"
        Add-ReportLine ((git -C $RepositoryPath log -20 --date=short --pretty=format:"%h %ad %s" 2>&1 | Out-String).Trim())
    } else {
        Add-ReportLine "Git metadata unavailable; directory may not be a Git repository."
    }
} else {
    Add-ReportLine "Git executable not found."
}

# Collect files, excluding generated and dependency directories.
Add-ReportLine "`r`n### 2. FILE DISCOVERY"

$AllFiles = Get-ChildItem -LiteralPath $RepositoryPath -Recurse -File -Force |
    Where-Object {
        $FullName = $_.FullName
        $RelativePath = $FullName.Substring($RepositoryPath.Length).TrimStart('\', '/')
        $Parts = $RelativePath -split '[/\\]'

        ($Parts | Where-Object { $ExcludedDirectories -contains $_ }).Count -eq 0 -and
        $FullName -ne $OutputPath -and
        $_.Name -ne "export-migrations-audit.ps1"
    }

$Candidates = @(
    $AllFiles | Where-Object {
        $RelativePath = $_.FullName.Substring($RepositoryPath.Length).TrimStart('\', '/')
        $Extension = $_.Extension.ToLowerInvariant()

        $IsRelevantPath = $RelativePath -match $PathPattern
        $IsSQL = $Extension -eq ".sql"
        $IsRelevantExtension = $RelevantExtensions -contains $Extension

        $IsRelevantPath -or $IsSQL
    } | Sort-Object FullName -Unique
)

Add-ReportLine "Total files in repository (excluding ignored directories): $(@($AllFiles).Count)"
Add-ReportLine "Migration/schema/database candidates: $(@($Candidates).Count)"
Add-ReportLine "`r`n--- Candidate file inventory ---"

foreach ($File in $Candidates) {
    $RelativePath = $File.FullName.Substring($RepositoryPath.Length).TrimStart('\', '/')
    $Hash = (Get-FileHash -LiteralPath $File.FullName -Algorithm SHA256).Hash

    Add-ReportLine ("{0} | {1} bytes | SHA256: {2}" -f $RelativePath, $File.Length, $Hash)
}

# Look for schema objects and migration operations in relevant files.
Add-ReportLine "`r`n### 3. STRUCTURAL KEYWORD INDEX"

$KeywordPattern = '(?i)\b(CREATE\s+TABLE|ALTER\s+TABLE|DROP\s+TABLE|CREATE\s+(UNIQUE\s+)?INDEX|DROP\s+INDEX|PRIMARY\s+KEY|FOREIGN\s+KEY|REFERENCES|UNIQUE|CHECK\s*\(|NOT\s+NULL|CREATE\s+TYPE|CREATE\s+SCHEMA|CREATE\s+EXTENSION|CREATE\s+SEQUENCE|CREATE\s+FUNCTION|CREATE\s+TRIGGER|INSERT\s+INTO|UPDATE\s+\w+|DELETE\s+FROM|BEGIN|COMMIT|ROLLBACK|migrate|migration|AutoMigrate|TableName|ForeignKey|OnDelete|OnUpdate)\b'

foreach ($File in $Candidates) {
    if ($File.Extension.ToLowerInvariant() -notin @(
        ".sql", ".go", ".prisma", ".py", ".ts", ".js", ".md", ".txt"
    )) {
        continue
    }

    try {
        $Lines = Get-Content -LiteralPath $File.FullName
        $RelativePath = $File.FullName.Substring($RepositoryPath.Length).TrimStart('\', '/')
        $Matches = @()

        for ($i = 0; $i -lt $Lines.Count; $i++) {
            if ($Lines[$i] -match $KeywordPattern) {
                $Matches += ("L{0}: {1}" -f ($i + 1), $Lines[$i].Trim())
            }
        }

        if ($Matches.Count -gt 0) {
            Add-ReportLine "`r`n--- $RelativePath ---"
            foreach ($Match in $Matches) {
                Add-ReportLine $Match
            }
        }
    } catch {
        Add-ReportLine "Could not index $($File.FullName): $($_.Exception.Message)"
    }
}

# Full contents: preserve migration SQL and related schema definitions.
Add-ReportLine "`r`n### 4. FULL FILE CONTENTS"
Add-ReportLine "Candidate files are included in full where readable."
Add-ReportLine "Binary or unreadable files are reported but not decoded."
Add-ReportLine ("=" * 100)

foreach ($File in $Candidates) {
    $RelativePath = $File.FullName.Substring($RepositoryPath.Length).TrimStart('\', '/')

    Add-ReportLine "`r`n"
    Add-ReportLine ("FILE: " + $RelativePath)
    Add-ReportLine ("SIZE: " + $File.Length + " bytes")
    Add-ReportLine ("-" * 100)

    try {
        $RawContent = Get-Content -LiteralPath $File.FullName -Raw -ErrorAction Stop

        if ($null -eq $RawContent) {
            Add-ReportLine "[EMPTY FILE]"
        } else {
            Add-ReportLine $RawContent
        }
    } catch {
        Add-ReportLine "[READ ERROR: $($_.Exception.Message)]"
    }

    Add-ReportLine ("=" * 100)
}

# Write the final report only after collection is complete.
$ParentDirectory = Split-Path -Parent $OutputPath

if ($ParentDirectory -and !(Test-Path -LiteralPath $ParentDirectory)) {
    New-Item -ItemType Directory -Path $ParentDirectory -Force | Out-Null
}

$ReportText = $Content -join "`r`n"
[System.IO.File]::WriteAllText(
    $OutputPath,
    $ReportText,
    [System.Text.UTF8Encoding]::new($true)
)

Write-Host ""
Write-Host "Migration audit report created." -ForegroundColor Green
Write-Host "File: $OutputPath"
Write-Host "Candidate files: $(@($Candidates).Count)"
Write-Host "Report size: $((Get-Item -LiteralPath $OutputPath).Length) bytes"
Write-Host ""
Write-Host "Review the report for secrets before sharing it." -ForegroundColor Yellow
