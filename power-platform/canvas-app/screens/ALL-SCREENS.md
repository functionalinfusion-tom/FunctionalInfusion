# Canvas App Screen Build Guide — Functional Infusion

## App Setup
- **Layout:** Phone (portrait)
- **Connect data sources:** all `fi_` tables in your Dataverse environment
- **Fonts:** DM Serif Display (headings), DM Sans (body) — add via App > Fonts if available, else use Georgia/Lato fallback
- **Brand color:** #96C9A8 (sage green)

---

## Screen List

| Screen | Purpose |
|--------|---------|
| scnHome | Dashboard |
| scnBatchQueue | All batches with filter |
| scnNewBatch | New batch form + ingredient scan |
| scnBatchDetail | 4-tab: Recipe / Actuals / QA / Audit |
| scnScanLookup | Full-screen barcode/QR scanner |
| scnRecipeMasterList | Recipe master list |
| scnRecipeVersionList | Version history for a master |
| scnRecipeVersionDetail | Version editor + approval actions |
| scnIngredientEditor | Add/edit ingredient lines |
| scnInventory | Lot tracking + burn history |

---

## scnHome

### Header
- **Rectangle:** Fill=#96C9A8, H=110, W=App.Width
- **Label "Good morning, [name]":** Font=DM Serif Display, Size=26, Color=White
- **Label date:** Text=`Text(Today(),"dddd, mmmm d") & " · Waupaca, WI"`, Size=13, Color=RGBA(255,255,255,0.75)
- **Label "FI":** Fill=White, Color=#5a9b72, BorderRadius=8, W=32, H=32

### Stats Row (3 cards)
- **Active batches:** `CountIf(fi_batchrecord, fi_status='In Progress')`
- **Pending QA:** `CountIf(fi_batchrecord, fi_status='Pending QA')`
- **For Approval:** `CountIf(fi_recipeversion, fi_status='Pending Approval')` — Visible=varIsQALead

### Approval Queue (QA Lead only)
- **Gallery:** Items=`Filter(fi_recipeversion, fi_status='Pending Approval')`
- Visible=varIsQALead
- Approve button OnSelect: `Set(varSelectedVersion, ThisItem); FI_ApproveRecipeVersion.Run(…)`
- Reject button: `UpdateContext({locShowRejectPanel: true})`

### Today's Batches Gallery
- **Items:** `SortByColumns(Filter(fi_batchrecord, DateValue(Text(fi_batchdate,"yyyy-mm-dd"))=Today()), "fi_batchdate", Descending)`
- Row height: 72
- OnSelect: `Set(varSelectedBatch, ThisItem); Navigate(scnBatchDetail, Cover)`
- Status badge fill: `Switch(fi_status, 'In Progress': #fffbeb, 'Pending QA': #edf7f1, 'Complete': #f0fdf4, #f4f6f5)`

### New Batch Button
- Fill=#96C9A8, Color=White, BorderRadius=12
- OnSelect: `Navigate(scnNewBatch, Cover)`
