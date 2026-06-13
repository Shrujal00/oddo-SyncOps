param(
  [switch]$NoPause
)

$scriptPath = Join-Path $PSScriptRoot "judge-demo.ps1"
if ($NoPause) {
  & $scriptPath -NoPause
} else {
  & $scriptPath
}
