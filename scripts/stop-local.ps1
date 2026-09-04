$ErrorActionPreference = "Stop"
$StoppedAny = $false

function Get-ListenerProcessId {
  param([int]$LocalPort)
  $connection = Get-NetTCPConnection -State Listen -LocalPort $LocalPort -ErrorAction SilentlyContinue |
    Select-Object -First 1
  if ($null -eq $connection) { return $null }
  return [int]$connection.OwningProcess
}

foreach ($candidatePort in 4173..4180) {
  $ownerId = Get-ListenerProcessId -LocalPort $candidatePort
  if ($null -eq $ownerId) { continue }
  $processInfo = Get-CimInstance Win32_Process -Filter "ProcessId = $ownerId" -ErrorAction SilentlyContinue
  $commandLine = [string]$processInfo.CommandLine
  if ($commandLine -match "(?i)(vite|vinext)" -and $commandLine -match "(?i)company[-_ ]law") {
    Write-Host "Stopping Company Law Lab on port $candidatePort..."
    & "$env:SystemRoot\System32\taskkill.exe" /PID $ownerId /T /F *> $null
    $StoppedAny = $true
  }
}

if (-not $StoppedAny) {
  Write-Host "No running Company Law Lab server was found."
}
