[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$PackagePath
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$resolvedPackage = (Resolve-Path -LiteralPath $PackagePath).Path
Add-Type -AssemblyName System.IO.Compression.FileSystem

$requiredFiles = @(
    "author-signature.xml",
    "signature1.xml",
    "config.xml",
    "index.html",
    "icon.png",
    "css/style.css",
    "js/main.js",
    "images/tizen_32.png",
    "images/vistivo-banner.png"
)

$allowedFiles = [System.Collections.Generic.HashSet[string]]::new(
    [string[]]$requiredFiles,
    [System.StringComparer]::Ordinal
)

$archive = [System.IO.Compression.ZipFile]::OpenRead($resolvedPackage)
try {
    $entries = @($archive.Entries | Where-Object { -not [string]::IsNullOrEmpty($_.Name) })
    $entryNames = @($entries | ForEach-Object { $_.FullName.Replace("\", "/") })

    $missing = @($requiredFiles | Where-Object { $_ -notin $entryNames })
    $unexpected = @($entryNames | Where-Object { -not $allowedFiles.Contains($_) })

    if ($missing.Count -gt 0) {
        throw "Package is missing required files: $($missing -join ', ')"
    }
    if ($unexpected.Count -gt 0) {
        $sample = @($unexpected | Select-Object -First 12)
        $suffix = if ($unexpected.Count -gt $sample.Count) {
            " (and $($unexpected.Count - $sample.Count) more)"
        }
        else {
            ""
        }
        throw "Package contains $($unexpected.Count) unexpected files: $($sample -join ', ')$suffix"
    }

    $configEntry = $archive.GetEntry("config.xml")
    $reader = [System.IO.StreamReader]::new($configEntry.Open())
    try {
        [xml]$manifest = $reader.ReadToEnd()
    }
    finally {
        $reader.Dispose()
    }

    if ($manifest.widget.name -ne "Vistivo TV") {
        throw "Unexpected application name in packaged config.xml."
    }
    if ($manifest.widget.id -ne "urn:vistivo:tv") {
        throw "Unexpected widget ID in packaged config.xml."
    }

    $size = (Get-Item -LiteralPath $resolvedPackage).Length
    Write-Host "PASS: clean signed WGT"
    Write-Host "Version: $($manifest.widget.version)"
    Write-Host "Files: $($entryNames.Count)"
    Write-Host "Size: $size bytes"
}
finally {
    $archive.Dispose()
}
