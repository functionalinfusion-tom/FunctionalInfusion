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

---

## scnNewBatch

### Form Fields (grouped white card)
- **Customer dropdown:**
  - Items=`Filter(fi_customer, fi_isactive=true)`
  - OnChange: `UpdateContext({locCustomer: Self.Selected}); Reset(drpRecipe)`
- **Recipe dropdown:**
  - Items=`Filter(fi_recipemaster, fi_customerid.fi_customerid=locCustomer.fi_customerid And fi_isactive=true)`
  - OnChange: `Set(varActiveVersion, LookUp(fi_recipeversion, fi_recipemasterid.fi_recipemasterid=Self.Selected.fi_recipemasterid And fi_status='Active')); ClearCollect(colBatchReceipt, ForAll(…))`
- **Date picker:** DefaultDate=Today()
- **Batch size input:** InputTextPlaceholder="e.g. 30", OnChange=`UpdateContext({locBatchSize: Value(Self.Text)})`
- **Unit dropdown:** `["gal","BBL","unit","case","kg","lb"]`
- **Crew Lead:** `["Matt Crane","Dana Howard","Wade Bullick","Kris Dahlstrom"]`
- **Tank/Line:** `["Tank 1".."Tank 7","Canning Line A","Canning Line B","Gummy Line"]`

### Ingredient Scan Gallery
- Visible: `!IsBlank(varActiveVersion)`
- **Items:** colBatchReceipt (built in recipe dropdown OnChange)
- Row height: 72
- **Scan button (camera icon):** OnSelect=`Set(varScanTargetIng, ThisItem); Navigate(scnScanLookup, Cover)`
- **Lot badge:** Visible=`!IsBlank(ThisItem.LotCode)`, Text=ThisItem.LotCode, Fill=#eff6ff, Color=#2563eb
- **Check icon:** Visible=`!IsBlank(ThisItem.LotCode)`
- **Critical row:** Fill=`If(ThisItem.IsCritical, #fffbeb, White)`

### Create Batch Button
- OnSelect:
```powerapps
If(
    IsBlank(drpRecipe.Selected) Or IsBlank(txtBatchSize.Text),
    Notify("Select recipe and batch size first", NotificationType.Error),

    Set(varNewBatch,
        Patch(fi_batchrecord, Defaults(fi_batchrecord), {
            fi_recipemasterid:  drpRecipe.Selected,
            fi_recipeversionid: varActiveVersion,
            fi_customerid:      drpCustomer.Selected,
            fi_batchdate:       dtpDate.SelectedDate,
            fi_batchsize:       Value(txtBatchSize.Text),
            fi_batchunittype:   drpUnit.Selected.Value,
            fi_crewlead:        drpCrew.Selected.Value,
            fi_tankline:        drpTank.Selected.Value,
            fi_status:          'fi_status (fi_batchrecord)'.Planned
        })
    );
    // Flow generates lot code automatically via Dataverse trigger
    Set(varSelectedBatch, varNewBatch);
    Navigate(scnBatchDetail, Cover)
)
```
