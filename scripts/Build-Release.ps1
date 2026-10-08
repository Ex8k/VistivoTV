[CmdletBinding()]
param(
    [string]$SigningProfile = "",
    [string]$TizenCli = "",
    [switch]$SkipSigning
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$projectRoot = Split-Path -Parent $PSScriptRoot
$releaseRoot = Join-Path $projectRoot ".release"
$sourceRoot = Join-Path $releaseRoot "source"
$buildRoot = Join-Path $releaseRoot "build"
$outputRoot = Join-Path $releaseRoot "output"

$runtimeFiles = @(
    "config.xml",
    "index.html",
    "icon.png",
    "css/style.css",
    "js/main.js",
    "images/tizen_32.png",
    "images/vistivo-banner.png"
)

if ([string]::IsNullOrWhiteSpace($TizenCli)) {
    $command = Get-Command "tizen.bat" -ErrorAction SilentlyContinue
    if ($null -eq $command) {
        throw "Tizen CLI was not found. Add it to PATH or pass -TizenCli '<TIZEN_STUDIO>\tools\ide\bin\tizen.bat'."
    }
    $TizenCli = $command.Source
}

if (Test-Path -LiteralPath $releaseRoot) {
    Remove-Item -LiteralPath $releaseRoot -Recurse -Force
}
New-Item -ItemType Directory -Path $sourceRoot, $buildRoot, $outputRoot | Out-Null

foreach ($relativePath in $runtimeFiles) {
    $sourcePath = Join-Path $projectRoot $relativePath
    if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) {
        throw "Required runtime file is missing: $relativePath"
    }

    $destinationPath = Join-Path $sourceRoot $relativePath
    $destinationDirectory = Split-Path -Parent $destinationPath
    New-Item -ItemType Directory -Path $destinationDirectory -Force | Out-Null
    Copy-Item -LiteralPath $sourcePath -Destination $destinationPath
}

[xml]$manifest = Get-Content -LiteralPath (Join-Path $sourceRoot "config.xml") -Raw
$version = $manifest.widget.version
if ([string]::IsNullOrWhiteSpace($version)) {
    throw "config.xml does not contain a widget version."
}

Write-Host "Building clean release source for Vistivo TV $version..."
& $TizenCli build-web -opt -out $buildRoot -- $sourceRoot
if ($LASTEXITCODE -ne 0) {
    throw "Tizen web build failed with exit code $LASTEXITCODE."
}

if ($SkipSigning) {
    Write-Host "Clean unsigned build created at $buildRoot"
    exit 0
}

$packageArguments = @("package", "-t", "wgt")
if (-not [string]::IsNullOrWhiteSpace($SigningProfile)) {
    $packageArguments += @("-s", $SigningProfile)
}
$packageArguments += @("--", $buildRoot)

Write-Host "Signing the release package..."
& $TizenCli @packageArguments
if ($LASTEXITCODE -ne 0) {
    throw "Tizen packaging failed with exit code $LASTEXITCODE."
}

$package = Get-ChildItem -LiteralPath $buildRoot -Filter "*.wgt" -File |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1
if ($null -eq $package) {
    throw "Tizen packaging completed without producing a WGT file."
}

$releasePackage = Join-Path $outputRoot "VistivoTV-$version.wgt"
Copy-Item -LiteralPath $package.FullName -Destination $releasePackage

& (Join-Path $PSScriptRoot "Test-ReleasePackage.ps1") -PackagePath $releasePackage
if ($LASTEXITCODE -ne 0) {
    throw "Release package validation failed."
}

Write-Host "Release package created: $releasePackage"
