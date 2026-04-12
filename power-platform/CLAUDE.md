# Functional Infusion — Power Platform Project

## What This Is
This is the Power Platform (Dataverse + Power Apps Canvas + Power Automate) manufacturing operations system for **Functional Infusion**, a cannabis and functional beverage co-manufacturing facility at 300 De Lish Us Ave, Waupaca, Wisconsin.

This repo also contains the public B2B website (root folder). The Power Platform project lives entirely in `/power-platform/`.

## Business Context
Functional Infusion co-packs RTD cans, functional shots, and gummies for clients. Primary customer: **Looner Sodas** (contact: Kyle Felder). The system manages:
- Recipe versioning with QA approval workflow
- Batch production with lot code generation
- Ingredient lot scanning and inventory burn tracking
- QA test recording against batches
- Zebra label printing (2×1 case, 4×6 pallet)
- Full forward/backward traceability for recalls

**Owner/Admin:** Tom (QA Lead role)
**Production crew:** Matt Crane (Crew Lead, Canning), Dana Howard (Crew Lead, Gummies), Wade Bullick, Kris Dahlstrom

## Architecture

### Stack
- **Data:** Microsoft Dataverse
- **App:** Power Apps Canvas App (mobile-first, iOS/Android via Power Apps mobile)
- **Automation:** Power Automate cloud flows
- **Publisher prefix:** `fi_`
- **Solution name:** `FunctionalInfusionRecipeManagement`

### Dataverse Tables (Phase 1 — imported)
| Table | Schema Name | Purpose |
|-------|-------------|---------|
| Customer | fi_customer | Co-manufacturing customers |
| Ingredient | fi_ingredient | Master ingredient catalog |
| Recipe Master | fi_recipemaster | Parent recipe per customer |
| Recipe Version | fi_recipeversion | Versioned recipe snapshots |
| Recipe Ingredient | fi_recipeingredient | Ingredient lines per version |
| Audit Log | fi_auditlog | Append-only state change log |

### Dataverse Tables (Phase 2 — planned)
| Table | Schema Name | Purpose |
|-------|-------------|---------|
| Inventory Lot | fi_inventorylot | Supplier lot tracking + burn |
| Batch Record | fi_batchrecord | Production runs |
| Batch Ingredient Actual | fi_batchingredientactual | Actual vs theoretical |
| QA Test | fi_qatest | QA results per batch |

### Security Roles
- `FI - Operator`: Read-only on recipes, create/read on audit log
- `FI - QA Lead`: Full CRUD on recipes/versions/ingredients, no delete on audit log

## Current Build Status
| Module | Status | Notes |
|--------|--------|-------|
| Dataverse schema v1 | ✅ Complete | Solution ZIP in solution/ |
| Recipe versioning tables | ✅ Complete | fi_recipemaster, fi_recipeversion, fi_recipeingredient |
| Security roles | ✅ Complete | FI-Operator, FI-QA Lead |
| Canvas app prototype | ✅ Designed | See canvas-app/screens/ALL-SCREENS.md |
| Approval flow spec | ✅ Specced | flows/FI-ApproveRecipeVersion.json |
| Lot code flow spec | ✅ Specced | flows/FI-GenerateLotCode.json |
| Clone flow spec | ✅ Specced | flows/FI-CloneRecipeVersion.json |
| ZPL label templates | ✅ Ready | labels/ folder |
| Inventory lot tables | 📋 Phase 2 | fi_inventorylot, fi_batchrecord |
| QR scan ingredient pick | 📋 Phase 2 | Canvas app BarcodeReader control |

## Key Design Decisions
1. **Recipe versioning:** Only ONE Active version per RecipeMaster. Enforced server-side in approval flow — never client-side.
2. **Lot codes:** Generated server-side (Power Automate) on batch creation. Format: `FI-[TYPE]-[YYMMDD]-[SEQ]`.
3. **Audit log is append-only:** No Update or Delete for any role on fi_auditlog.
4. **Recipe snapshot on batch:** BatchRecord.fi_recipeversionid locked at creation and never changes.
5. **FEFO inventory:** Ingredient lots sorted by expiration date ascending.
6. **QA gate:** Batch cannot be marked Complete if any critical QA test is Pending or Fail.

## Brand
- **Primary color:** #96C9A8 (sage green)
- **Typography:** DM Serif Display (headings) / DM Sans (body)
- **Theme:** Light mode, sage dominant headers, white cards, iOS-native list patterns
- **Contact:** billing@functionalinfusion.com · (715) 256-7785
- **Address:** 300 De Lish Us Ave, Waupaca, WI

## Next Tasks For Claude Code
1. Build `FI-ApproveRecipeVersion` flow in Power Automate using spec in flows/FI-ApproveRecipeVersion.json
2. Build `FI-GenerateLotCode` flow using spec in flows/FI-GenerateLotCode.json
3. Build `FI-CloneRecipeVersion` flow using spec in flows/FI-CloneRecipeVersion.json
4. Import solution ZIP from solution/ into Dataverse environment
5. Build Canvas App starting with scnHome — see canvas-app/screens/ALL-SCREENS.md
6. When schema changes: run scripts/export-solution.ps1 and commit new ZIP
