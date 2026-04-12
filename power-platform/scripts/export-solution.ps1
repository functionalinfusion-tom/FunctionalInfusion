# export-solution.ps1 — Export Dataverse solution using PAC CLI
#
# Prerequisites: Install PAC CLI, run:
#   pac auth create --url https://yourenv.crm.dynamics.com
#
# Usage:
#   .\export-solution.ps1
#   .\export-solution.ps1 -Managed

param(
    [string]$SolutionName = "FunctionalInfusionRecipeManagement",
    [switch]$Managed
)

$SolutionDir = Join-Path $PSScriptRoot "..\solution"
$ManagedFlag = if ($Managed) { "true" } else { "false" }

Write-Host "Exporting $SolutionName ($ManagedFlag)…" -ForegroundColor Cyan

pac solution export --name $SolutionName --path $SolutionDir --managed $ManagedFlag --overwrite true

if ($LASTEXITCODE -ne 0) {
    Write-Error "Export failed."
    exit 1
}

Write-Host "`n✓ Exported to $SolutionDir" -ForegroundColor Green
Write-Host "Next steps:"
Write-Host "  git add power-platform/solution/"
Write-Host "  git commit -m 'solution: export vX.X.X - [describe changes]'"
Write-Host "  git push origin main"
