param(
  [switch]$SkipBrowser
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$ExpectedVersion = "3.1.4"
$Port = 4173
$BaseUrl = "http://127.0.0.1:$Port"
$VersionUrl = "$BaseUrl/lab-version.json"
$BrowserUrl = "$BaseUrl/?v=$ExpectedVersion"
$LogPath = Join-Path $ProjectRoot "startup-log.txt"
$RuntimePatchScript = Join-Path $PSScriptRoot "patch-vinext-windows-static-cache.mjs"
$ServerProcess = $null
$Mutex = $null
$HasMutex = $false

function Write-StartupLog {
  param([string]$Message)
  Add-Content -LiteralPath $LogPath -Value $Message -Encoding UTF8
}

function Get-ListenerProcessId {
  param([int]$LocalPort)
  $connection = Get-NetTCPConnection -State Listen -LocalPort $LocalPort -ErrorAction SilentlyContinue |
    Select-Object -First 1
  if ($null -eq $connection) { return $null }
  return [int]$connection.OwningProcess
}

function Get-ProcessCommandLine {
  param([int]$ProcessId)
  $processInfo = Get-CimInstance Win32_Process -Filter "ProcessId = $ProcessId" -ErrorAction SilentlyContinue
  if ($null -eq $processInfo) { return "" }
  return [string]$processInfo.CommandLine
}

function Test-IsCompanyLawServer {
  param([string]$CommandLine)
  if ([string]::IsNullOrWhiteSpace($CommandLine)) { return $false }
  $isDevServer = $CommandLine -match "(?i)(vite|vinext)"
  $isCompanyLawFolder = $CommandLine -match "(?i)company[-_ ]law"
  return ($isDevServer -and $isCompanyLawFolder)
}

function Stop-ProcessTree {
  param([int]$ProcessId)
  & "$env:SystemRoot\System32\taskkill.exe" /PID $ProcessId /T /F *> $null
}

function Stop-StaleLabListeners {
  foreach ($candidatePort in 4173..4180) {
    $ownerId = Get-ListenerProcessId -LocalPort $candidatePort
    if ($null -eq $ownerId) { continue }

    $commandLine = Get-ProcessCommandLine -ProcessId $ownerId
    if (Test-IsCompanyLawServer -CommandLine $commandLine) {
      Write-Host "Closing an older Company Law Lab server on port $candidatePort..."
      Write-StartupLog "Closing stale lab server: port=$candidatePort pid=$ownerId"
      Stop-ProcessTree -ProcessId $ownerId
      Start-Sleep -Milliseconds 700
      continue
    }

    if ($candidatePort -eq $Port) {
      throw "Port $Port is being used by another program (PID $ownerId). Close that program, then run start-local.bat again. No alternate port was used, so the wrong version cannot open."
    }
  }

  $deadline = (Get-Date).AddSeconds(12)
  while ((Get-ListenerProcessId -LocalPort $Port) -and ((Get-Date) -lt $deadline)) {
    Start-Sleep -Milliseconds 300
  }
  if (Get-ListenerProcessId -LocalPort $Port) {
    throw "The previous server did not release port $Port. Restart Windows once, then run start-local.bat."
  }
}

function New-WebsiteHealthResult {
  param(
    [bool]$Ready,
    [string]$Detail
  )
  return [PSCustomObject]@{
    Ready = $Ready
    Detail = $Detail
  }
}

function Get-ExpectedWebsiteHealth {
  $stage = "version file"
  try {
    $stamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
    $result = Invoke-RestMethod -Uri "$VersionUrl`?t=$stamp" -TimeoutSec 3 -UseBasicParsing
    if ([string]$result.version -ne $ExpectedVersion) {
      return New-WebsiteHealthResult $false "version mismatch: expected $ExpectedVersion, received $($result.version)"
    }

    $stage = "home page"
    $page = Invoke-WebRequest -Uri "$BaseUrl/?health=$stamp" -TimeoutSec 5 -UseBasicParsing
    if ($page.StatusCode -ne 200) {
      return New-WebsiteHealthResult $false "home page returned HTTP $($page.StatusCode)"
    }
    if ($page.Content -notmatch 'class="app-shell') {
      return New-WebsiteHealthResult $false "home page is missing the app-shell structure"
    }

    $stage = "stylesheet link"
    $stylesheet = [regex]::Match($page.Content, 'href="([^"?]+\.css)')
    if (-not $stylesheet.Success) {
      return New-WebsiteHealthResult $false "home page does not reference a stylesheet"
    }
    $stylesheetUrl = [Uri]::new([Uri]$BaseUrl, $stylesheet.Groups[1].Value).AbsoluteUri
    $stage = "stylesheet $($stylesheet.Groups[1].Value)"
    $css = Invoke-WebRequest -Uri "$stylesheetUrl`?health=$stamp" -TimeoutSec 5 -UseBasicParsing
    if ($css.StatusCode -ne 200) {
      return New-WebsiteHealthResult $false "stylesheet returned HTTP $($css.StatusCode)"
    }
    if ($css.Content -notmatch '\.app-shell' -or $css.Content -notmatch '#173f36') {
      return New-WebsiteHealthResult $false "stylesheet is incomplete or does not contain the expected theme"
    }

    $stage = "client-script link"
    $clientScript = [regex]::Match($page.Content, '(?:src|href)="([^"?]+LawLab[^"?]+\.js)')
    if (-not $clientScript.Success) {
      return New-WebsiteHealthResult $false "home page does not reference the main client script"
    }
    $clientScriptUrl = [Uri]::new([Uri]$BaseUrl, $clientScript.Groups[1].Value).AbsoluteUri
    $stage = "client script $($clientScript.Groups[1].Value)"
    $script = Invoke-WebRequest -Uri "$clientScriptUrl`?health=$stamp" -TimeoutSec 5 -UseBasicParsing
    if ($script.StatusCode -ne 200) {
      return New-WebsiteHealthResult $false "client script returned HTTP $($script.StatusCode)"
    }
    if ($script.RawContentLength -le 10000) {
      return New-WebsiteHealthResult $false "client script is unexpectedly small ($($script.RawContentLength) bytes)"
    }
    return New-WebsiteHealthResult $true "version, page, stylesheet and client script are ready"
  } catch {
    return New-WebsiteHealthResult $false "$stage failed: $($_.Exception.Message)"
  }
}

try {
  Set-Location -LiteralPath $ProjectRoot
  Set-Content -LiteralPath $LogPath -Value @(
    "Company Law Lab startup log"
    "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    "Folder: $ProjectRoot"
    "Expected version: $ExpectedVersion"
    "Fixed URL: $BaseUrl"
  ) -Encoding UTF8

  Write-Host "========================================"
  Write-Host "Company Law English Learning Lab"
  Write-Host "Version $ExpectedVersion"
  Write-Host "========================================"
  Write-Host ""

  $Mutex = New-Object System.Threading.Mutex($false, "Local\CompanyLawEnglishLabLauncher")
  $HasMutex = $Mutex.WaitOne(0, $false)
  if (-not $HasMutex) {
    $existingHealth = Get-ExpectedWebsiteHealth
    if ($existingHealth.Ready) {
      Write-StartupLog "The current version is already running and passed validation."
      if ($SkipBrowser) {
        Write-Host "The current version is already running and passed validation."
      } else {
        Write-Host "The current version is already running. Opening it now..."
        Start-Process $BrowserUrl
      }
      exit 0
    }
    throw "Another Company Law Lab launcher is already starting. Keep its window open and wait for the browser; do not click the launcher repeatedly."
  }

  $NodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
  $NpmCommand = Get-Command npm.cmd -ErrorAction SilentlyContinue
  if ($null -eq $NodeCommand) { throw "Node.js was not found. Reinstall Node.js 22 or later with Add to PATH enabled." }
  if ($null -eq $NpmCommand) { throw "npm was not found. Reinstall Node.js with npm enabled." }

  $NodeVersion = & $NodeCommand.Source --version
  $NpmVersion = & $NpmCommand.Source --version
  Write-StartupLog "Node: $NodeVersion"
  Write-StartupLog "npm: $NpmVersion"
  Write-Host "Node.js and npm detected."

  foreach ($requiredFile in @("package.json", "dist\server\index.js", "dist\client\lab-version.json")) {
    if (-not (Test-Path -LiteralPath (Join-Path $ProjectRoot $requiredFile) -PathType Leaf)) {
      throw "Website files are incomplete: missing $requiredFile"
    }
  }

  $VinextCli = Join-Path $ProjectRoot "node_modules\vinext\dist\cli.js"
  if (-not (Test-Path -LiteralPath $VinextCli -PathType Leaf)) {
    Write-Host ""
    Write-Host "First-time setup is installing components."
    Write-Host "This happens only when node_modules is missing from this folder."
    Write-StartupLog "Running npm install because the production server is missing."
    & $NpmCommand.Source install --no-fund --no-audit *>> $LogPath
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $VinextCli -PathType Leaf)) {
      throw "Component installation failed. See startup-log.txt."
    }
  }

  if (-not (Test-Path -LiteralPath $RuntimePatchScript -PathType Leaf)) {
    throw "Website files are incomplete: missing scripts\patch-vinext-windows-static-cache.mjs"
  }
  Write-StartupLog "Checking Windows static-resource compatibility."
  & $NodeCommand.Source $RuntimePatchScript *>> $LogPath
  if ($LASTEXITCODE -ne 0) {
    throw "The Windows static-resource compatibility check failed. See startup-log.txt."
  }

  Stop-StaleLabListeners

  $WranglerDirectory = Join-Path $ProjectRoot ".wrangler"
  New-Item -ItemType Directory -Path $WranglerDirectory -Force | Out-Null
  $env:WRANGLER_LOG_PATH = Join-Path $WranglerDirectory "wrangler.log"

  Write-Host ""
  Write-Host "Starting the current website on $BaseUrl ..."
  Write-Host "Keep this window open while using the website."
  Write-StartupLog "Starting prebuilt production server on fixed port $Port."

  $quotedVinext = '"' + $VinextCli + '"'
  $ServerProcess = Start-Process -FilePath $NodeCommand.Source `
    -ArgumentList @($quotedVinext, "start", "--port", "$Port") `
    -WorkingDirectory $ProjectRoot -NoNewWindow -PassThru

  $readyDeadline = (Get-Date).AddSeconds(30)
  $ready = $false
  $lastHealth = New-WebsiteHealthResult $false "server has not answered yet"
  while ((Get-Date) -lt $readyDeadline) {
    if ($ServerProcess.HasExited) {
      throw "The website server stopped before it became ready (exit code $($ServerProcess.ExitCode))."
    }
    $lastHealth = Get-ExpectedWebsiteHealth
    if ($lastHealth.Ready) {
      $ready = $true
      break
    }
    Start-Sleep -Milliseconds 600
  }

  if (-not $ready) {
    throw "The website server started, but validation did not pass within 30 seconds. Last check: $($lastHealth.Detail)"
  }

  Write-StartupLog "Validation passed: $($lastHealth.Detail). Version: $ExpectedVersion"
  Write-Host ""
  Write-Host "Ready: verified Company Law Lab $ExpectedVersion"
  if ($SkipBrowser) {
    Write-Host "Browser opening skipped for automated validation."
    Write-StartupLog "Browser opening skipped for automated validation."
  } else {
    Write-Host "Opening: $BrowserUrl"
    Start-Process $BrowserUrl
  }

  Wait-Process -Id $ServerProcess.Id
  Write-StartupLog "Website server exited with code $($ServerProcess.ExitCode)."
  exit $ServerProcess.ExitCode
} catch {
  $message = $_.Exception.Message
  Write-Host ""
  Write-Host "ERROR: $message" -ForegroundColor Red
  Write-StartupLog "ERROR: $message"
  exit 1
} finally {
  if ($null -ne $ServerProcess -and -not $ServerProcess.HasExited) {
    try { Stop-ProcessTree -ProcessId $ServerProcess.Id } catch { }
  }
  if ($HasMutex -and $null -ne $Mutex) {
    try { $Mutex.ReleaseMutex() } catch { }
  }
  if ($null -ne $Mutex) { $Mutex.Dispose() }
}
