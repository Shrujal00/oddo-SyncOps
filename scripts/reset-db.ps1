param(
  [switch]$Force
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not $Force) {
  Write-Host "This will delete all local SyncOps database data, reapply Prisma migrations, and run the seed script."
  Write-Host "Run with -Force to continue:"
  Write-Host "  powershell -ExecutionPolicy Bypass -File scripts/reset-db.ps1 -Force"
  exit 1
}

Write-Host "Resetting local SyncOps database..."
npm.cmd run prisma:reset --workspace backend
Write-Host "Database reset complete."
