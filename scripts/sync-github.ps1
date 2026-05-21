# Sincroniza PromoçõesPro com o GitHub (rode após criar o repo e estar logado)
param(
  [Parameter(Mandatory = $true)]
  [string]$RepoUrl
)

$ErrorActionPreference = "Stop"
Set-Location -LiteralPath (Split-Path $PSScriptRoot -Parent)

if ($RepoUrl -notmatch '\.git$') { $RepoUrl = $RepoUrl.TrimEnd('/') + '.git' }

if (git remote get-url origin 2>$null) {
  git remote set-url origin $RepoUrl
} else {
  git remote add origin $RepoUrl
}

$branch = git branch --show-current
if (-not $branch) { $branch = 'master' }

git push -u origin $branch
Write-Host "Sincronizado: $RepoUrl (branch $branch)"
