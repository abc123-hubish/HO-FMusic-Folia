param([switch]$Clean, [string]$Product = 'default')
$ErrorActionPreference = 'Stop'
$taskRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$devEcoRoot = 'D:\dev26\DevEco Studio'
$webEntry = Join-Path $taskRoot 'entry\src\main\resources\rawfile\folia\harmony.html'
if (-not (Test-Path -LiteralPath $webEntry -PathType Leaf)) {
  throw 'Generated Web runtime is missing. Run node tools/build-web.mjs before building the HAP.'
}
$env:DEVECO_SDK_HOME = Join-Path $devEcoRoot 'sdk'
$env:JAVA_HOME = Join-Path $devEcoRoot 'jbr'
$env:Path = (Join-Path $env:JAVA_HOME 'bin') + ';' + $env:Path
Push-Location $taskRoot
try {
  $hvigorArgs = @('--mode', 'module', '-p', 'module=entry@default', '-p', "product=$Product", '-p', 'requiredDeviceType=phone')
  if ($Clean) { $hvigorArgs += 'clean' }
  $hvigorArgs += @('assembleHap', '--no-daemon')
  & (Join-Path $devEcoRoot 'tools\node\node.exe') (Join-Path $devEcoRoot 'tools\hvigor\bin\hvigorw.js') @hvigorArgs
  if ($LASTEXITCODE -ne 0) { throw "Hvigor failed ($LASTEXITCODE)" }
  # Signing alone does not guarantee the page resources made it through Hvigor's incremental cache.
  $hap = Join-Path $taskRoot "entry\build\$Product\outputs\default\entry-default-signed.hap"
  & (Join-Path $devEcoRoot 'tools\node\node.exe') (Join-Path $PSScriptRoot 'inspect-package.mjs') $hap
  if ($LASTEXITCODE -ne 0) { throw 'HAP Web resource validation failed. Rebuild with tools/build-hap.ps1 -Clean.' }
} finally { Pop-Location }
