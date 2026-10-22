param([Parameter(Mandatory=$true)][string]$NodeDirectory,[switch]$Restaurar)
$ErrorActionPreference='Stop'
$node=Join-Path $NodeDirectory 'node.exe'
$npmCli=Join-Path $NodeDirectory 'node_modules\npm\bin\npm-cli.js'
if ((& $node --version) -ne 'v12.22.12') {throw 'Se requiere Node 12.22.12 aislado.'}
if ((& $node $npmCli --version) -ne '6.14.16') {throw 'Se requiere npm 6.14.16.'}
$raiz=Split-Path $PSScriptRoot -Parent
$pathAnterior=$env:Path
Push-Location $raiz
try {
 $env:Path=$NodeDirectory+';'+$pathAnterior
 if ($Restaurar) {
  & $node $npmCli ci
  if ($LASTEXITCODE -ne 0) {throw 'Falló npm ci.'}
 }
 & $node node_modules\typescript\bin\tsc --noEmit -p tsconfig.app.json
 if ($LASTEXITCODE -ne 0) {throw 'Falló TypeScript de aplicación.'}
 & $node node_modules\typescript\bin\tsc --noEmit -p tsconfig.spec.json
 if ($LASTEXITCODE -ne 0) {throw 'Falló TypeScript de pruebas.'}
 & $node node_modules\@angular\cli\bin\ng test --watch=false --browsers=ChromeHeadless --progress=false
 if ($LASTEXITCODE -ne 0) {throw 'Fallaron las pruebas Angular.'}
 & $node node_modules\@angular\cli\bin\ng build --prod --progress=false
 if ($LASTEXITCODE -ne 0) {throw 'Falló producción Angular.'}
} finally {$env:Path=$pathAnterior;Pop-Location}
