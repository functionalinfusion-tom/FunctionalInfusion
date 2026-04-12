# Deployment Runbook

## Step 1 — Import Solution
1. https://make.powerapps.com → select environment
2. Solutions → Import solution
3. Browse → select solution/FunctionalInfusion_RecipeManagement_v1.0.0.zip
4. Next → Import → wait 2–4 min

## Step 2 — Enable Auditing
- Environment settings → Auditing → Start Auditing = On
- Verify each table has auditing enabled: fi_customer, fi_ingredient, fi_recipemaster, fi_recipeversion, fi_recipeingredient, fi_auditlog

## Step 3 — Assign Security Roles
| User | Role |
|------|------|
| Tom | FI - QA Lead + System Customizer |
| Dana Howard | FI - QA Lead |
| Matt Crane | FI - Operator |
| Wade Bullick | FI - Operator |
| Kris Dahlstrom | FI - Operator |

## Step 4 — Import Power Automate Flows
Flows are specced in flows/ as JSON. Build each in Power Automate manually:
1. FI-ApproveRecipeVersion — PowerApps trigger
2. FI-GenerateLotCode — Dataverse row added trigger
3. FI-CloneRecipeVersion — PowerApps trigger

## Step 5 — Build Canvas App
Follow canvas-app/screens/ALL-SCREENS.md screen by screen.

## Step 6 — Configure Zebra Printer
- Note printer IP (printer settings → network)
- Port 9100 raw ZPL
- Use labels/ templates with variables substituted via Power Automate HTTP action

## Updating Solution
```powershell
.\scripts\export-solution.ps1
git add power-platform/solution/
git commit -m "solution: export vX.X.X - [changes]"
git push
```
