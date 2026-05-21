# Publica PromoçõesPro no GitHub (rode depois de: gh auth login)
$ErrorActionPreference = "Stop"
Set-Location -LiteralPath (Split-Path $PSScriptRoot -Parent)

$gh = "C:\Program Files\GitHub CLI\gh.exe"
if (-not (Test-Path $gh)) { $gh = "gh" }

& $gh auth status
if ($LASTEXITCODE -ne 0) {
  Write-Host "Faça login primeiro: gh auth login -h github.com -p https -w"
  exit 1
}

$repoName = "promocoes-pro"
& $gh repo create $repoName --public --source=. --remote=origin --description "PromoçõesPro — gestão de promoções (Supabase)" --push

Write-Host ""
Write-Host "Repositório criado. Veja: https://github.com/$(& $gh api user -q .login)/$repoName"
