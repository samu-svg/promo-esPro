# Rode no terminal do Cursor (PowerShell), com você já logado no gh
$ErrorActionPreference = "Stop"
Set-Location -LiteralPath (Split-Path $PSScriptRoot -Parent)

$gh = if (Test-Path "C:\Program Files\GitHub CLI\gh.exe") { "C:\Program Files\GitHub CLI\gh.exe" } else { "gh" }

Write-Host "Verificando login..."
& $gh auth status
$login = & $gh api user -q .login
Write-Host "Conta: $login"
if ($login -ne "samu-svg") {
  Write-Warning "Esperado samu-svg. Se for outra conta: gh auth logout; gh auth login"
}

$owner = "samu-svg"
$repo = "promocoes-pro"

# Cria o repo se ainda nao existir
$exists = & $gh repo view "$owner/$repo" 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Criando $owner/$repo ..."
  & $gh repo create "$owner/$repo" --public --description "PromoçõesPro — gestão de promoções (Supabase)"
}

if (-not (git remote get-url origin 2>$null)) {
  git remote add origin "https://github.com/$owner/$repo.git"
} else {
  git remote set-url origin "https://github.com/$owner/$repo.git"
}

git push -u origin master
Write-Host ""
Write-Host "OK: https://github.com/$owner/$repo"
