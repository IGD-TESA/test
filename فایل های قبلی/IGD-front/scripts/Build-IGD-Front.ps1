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