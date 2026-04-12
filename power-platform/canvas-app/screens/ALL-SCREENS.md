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

---

## scnScanLookup

### Controls
- **BarcodeReader1:** BarcodeType=BarcodeType.Any
  - OnScan: *(see FORMULA-PATTERNS.md — Barcode Scanner section)*
- **Manual entry:** TextInput, placeholder="Enter lot code manually"
- **Lookup button:** `Set(varScannedRaw, txtManualLot.Text);` *(run same lookup logic)*

### Result Panel
- Visible=`!IsBlank(varMatchedLot)`
- **Fields displayed:**
  - Ingredient name
  - Lot code
  - On-hand qty
  - Needed qty
  - COA status
  - Expiry date
- **Confirm button:** *(see FORMULA-PATTERNS.md — Lot Assignment section)*
- **Wrong button:** `Set(varMatchedLot, Blank()); Reset(BarcodeReader1)`

---

## scnRecipeMasterList

### Gallery
- **Items:** `SortByColumns(Filter(fi_recipemaster, fi_isactive=true), "fi_name", Ascending)`
- **Each row:** recipe name, customer name, active version label, chevron
- OnSelect: `Set(varSelectedMaster, ThisItem); Navigate(scnRecipeVersionList, Cover)`

### New Recipe Button
- Visible=varIsQALead

---

## scnRecipeVersionList

### Header
- **Back:** `Navigate(scnRecipeMasterList, UnCover)`
- **Title:** `varSelectedMaster.fi_name`

### Gallery
- **Items:** `SortByColumns(Filter(fi_recipeversion, fi_recipemasterid.fi_recipemasterid=varSelectedMaster.fi_recipemasterid), "fi_versionnumber", Descending)`
- **Each row:** version label, status badge, approved by, effective date
- OnSelect: `Set(varSelectedVersion, ThisItem); Navigate(scnRecipeVersionDetail, Cover)`

### New Version Button
- Visible=varIsQALead
- OnSelect: `FI_CloneRecipeVersion.Run(…)` *(see FORMULA-PATTERNS.md — Clone section)*

---

## scnRecipeVersionDetail

### All Inputs DisplayMode
```powerapps
If(varSelectedVersion.fi_status = 'fi_status (fi_recipeversion)'.Draft And varIsQALead, DisplayMode.Edit, DisplayMode.View)
```

### Fields
- **Version label** (txtVersionLabel)
- **Change reason** (txtChangeReason) — required, multiline
- **Status badge** (read-only)
- **Approved by, approved date** (read-only)

### Action Buttons
*(see FORMULA-PATTERNS.md — Button Visibility / State Machine section)*
- **Save Draft**
- **Submit for Approval**
- **Approve** — calls `FI_ApproveRecipeVersion` flow
- **Reject** — shows rejection reason input, patches status to Draft
- **New Version** — calls `FI_CloneRecipeVersion` flow

### Ingredient Sub-Gallery
- **Items:** `SortByColumns(Filter(fi_recipeingredient, fi_recipeversionid.fi_recipeversionid=varSelectedVersion.fi_recipeversionid), "fi_sortorder", Ascending)`
- **Edit button:** Visible=`varIsQALead And varSelectedVersion.fi_status='Draft'`
  - OnSelect: `Set(varSelectedIngredient, ThisItem); Navigate(scnIngredientEditor, Cover)`
- **Add Ingredient:** Visible=`varIsQALead And varSelectedVersion.fi_status='Draft'`

---

## scnIngredientEditor

### Fields
- **Ingredient dropdown:** Items=`SortByColumns(Filter(fi_ingredient, fi_isactive=true), "fi_name", Ascending)`
- **Qty per base unit:** TextInput, numeric
- **UOM:** dropdown — same choice set as fi_baseuomtype
- **Sort order:** TextInput, numeric
- **Is Critical:** Toggle
- **Notes:** TextInput, multiline

### Save Button
```powerapps
Patch(fi_recipeingredient,
    If(IsBlank(varSelectedIngredient), Defaults(fi_recipeingredient), varSelectedIngredient),
    {
        fi_recipeversionid: varSelectedVersion,
        fi_ingredientid:    drpIngredient.Selected,
        fi_qtyperbaseunit:  Value(txtQty.Text),
        fi_uom:             drpUOM.Selected.Value,
        fi_sortorder:       Value(txtSortOrder.Text),
        fi_iscritical:      togCritical.Value,
        fi_notes:           txtNotes.Text,
        fi_name:            drpIngredient.Selected.fi_name & " - " & varSelectedVersion.fi_name
    }
);
Navigate(scnRecipeVersionDetail, UnCover)
```

---

## scnInventory

### Sections

**1. Low Stock Alerts**
- `Filter(fi_inventorylot, fi_remainingqty / fi_receivedqty < 0.25)`

**2. All Lots Gallery**
- **Items:** fi_inventorylot sorted by fi_expirationdate ascending (FEFO)
- **Each row:** ingredient name, supplier lot, internal lot, remaining qty, expiry, status badge

**3. Recent Lot Usage**
- **Items:** fi_batchingredientactual sorted by createdon descending
- **Shows:** lot code → batch → customer → date

### Forward Trace
```powerapps
// Given a selected lot, find which batches used it and which customers received those batches
Filter(fi_batchingredientactual,
    fi_inventorylotid.fi_inventorylotid = varSelectedLot.fi_inventorylotid)
```

### Backward Trace
```powerapps
// Given a selected batch, find which lots went into it and which vendors supplied those lots
Filter(fi_batchingredientactual,
    fi_batchrecordid.fi_batchrecordid = varSelectedBatch.fi_batchrecordid)
```

---

## scnBatchQueue

### Header
- **Rectangle:** Fill=#96C9A8, H=110, W=App.Width
- **Label "Batch Queue":** Font=DM Serif Display, Size=26, Color=White
- **Label subtitle:** Text="All production runs", Size=13, Color=RGBA(255,255,255,0.75)
- **FI logo badge:** same as scnHome

### Filter Chips (horizontal scroll gallery)
- **Items:** `["All","Planned","In Progress","Pending QA","Complete","On Hold"]`
- Selected chip: Fill=#edf7f1, Color=#5a9b72, BorderColor=#c8e6d4
- Unselected: Fill=White, Color=#8fa89a, BorderColor=#e8edeb
- OnSelect: `UpdateContext({locQueueFilter: ThisItem.Value})`
- Store selection: `UpdateContext({locQueueFilter: "All"})` on scnBatchQueue.OnVisible

### Search Bar
- **TextInput:** Placeholder="Search lot code or product…", Fill=White, BorderRadius=10
- **Icon:** Search, Color=#8fa89a
- Clears on screen navigate: `Reset(txtQueueSearch)` in OnVisible

### Batch Gallery
- **Items:**
```powerapps
Filter(
    fi_batchrecord,
    (locQueueFilter = "All" Or Text(fi_status) = locQueueFilter)
    And (IsBlank(txtQueueSearch.Text)
         Or fi_lotcode exactin txtQueueSearch.Text
         Or fi_name exactin txtQueueSearch.Text)
)
// SortByColumns by fi_batchdate Descending
```

- **Group rows by date** using a separate label above each date group:
  - `Text(ThisItem.fi_batchdate, "[$-en-US]dddd, mmmm d")`
  - Show label only when `ThisItem.fi_batchdate <> previous row date`
  - (In Power Apps: use a calculated column in the collection or separate gallery per date bucket)

- Row height: 72
- Row layout: `| Icon (36x36 rounded) | Body (flex) | Badge + Chevron |`

- **Icon fill by product type:**
```powerapps
Switch(Left(ThisItem.fi_lotcode, 6),
    "FI-CAN", #fffbeb,
    "FI-GUM", #edf7f1,
    "FI-SHT", #eff6ff,
    #f4f6f5
)
```

- **Row title:** `ThisItem.fi_name` (recipe name)
- **Row subtitle:**
  `ThisItem.fi_lotcode & " · " & ThisItem.fi_crewlead & " · " & Text(ThisItem.fi_batchsize,"[$-en-US]0.##") & " " & Text(ThisItem.fi_batchunittype)`

- **Status badge Fill/Color:**
```powerapps
Switch(ThisItem.fi_status,
    'Planned':      Fill=#f4f6f5,  Color=#4f6b5c,
    'In Progress':  Fill=#fffbeb,  Color=#d97706,
    'Pending QA':   Fill=#edf7f1,  Color=#5a9b72,
    'Complete':     Fill=#f0fdf4,  Color=#16a34a,
    'On Hold':      Fill=#fef2f2,  Color=#dc2626
)
```

- OnSelect: `Set(varSelectedBatch, ThisItem); Navigate(scnBatchDetail, ScreenTransition.Cover)`

### Empty State (Visible when gallery is empty)
- Icon: clipboard (large, opacity 0.4)
- Label: "No batches found"
- Sublabel: "Adjust filters or start a new batch"
- New Batch button: `Navigate(scnNewBatch, Cover)`

### Floating Action Button (bottom right)
- Circle, Fill=#96C9A8, W=52, H=52
- Label: "+", Color=White, Size=28
- OnSelect: `Navigate(scnNewBatch, Cover)`
- Shadow: `DropShadow(5, 5, 10, RGBA(90,155,114,0.3))`

---

## scnBatchDetail (4-tab: Recipe / Actuals / QA / Audit)

### Header
- **Back button:** Text="<- Queue", Color=#5a9b72
  - OnSelect: `Navigate(scnBatchQueue, ScreenTransition.UnCover)`
- **Center title:** varSelectedBatch.fi_name, Size=15, FontWeight=Semibold
- **Center subtitle:** varSelectedBatch.fi_lotcode, Size=11, Color=#8fa89a
- **Right badge:** status badge (same color logic as queue)
- Background: White, BorderBottom=1px #e8edeb

### Hero Card (white card, margin 12px, BorderRadius=14)
- **Eyebrow:** varSelectedBatch.fi_customerid.fi_name, Size=11, Color=#5a9b72, Uppercase
- **Title:** varSelectedBatch.fi_name, Font=DM Serif Display, Size=20
- **Chip row** (horizontal, wrap):
  - Batch size chip: `Text(fi_batchsize,"0.##") & " " & Text(fi_batchunittype)`
  - Recipe version chip: `"Recipe " & varSelectedBatch.fi_recipeversionid.fi_name`
  - Crew chip: `varSelectedBatch.fi_crewlead`
  - Tank chip: `varSelectedBatch.fi_tankline`
  - Chip style: Fill=#edf7f1, Color=#5a9b72, BorderColor=#c8e6d4, BorderRadius=20, Padding=4x10
- Status badge below chips

### Tab Bar
- 4 label controls in a row, each W=App.Width/4, H=44
- Bottom border rectangle: W=App.Width/4, H=2, Y=tab bottom
  - `Fill=If(locTab="recipe", #96C9A8, Transparent)` — one per tab
- Tab labels: **"Recipe" | "Actuals" | "QA" | "Audit"**
- Active tab: Color=#5a9b72, FontWeight=Semibold
- Inactive tab: Color=#8fa89a, FontWeight=Normal
- OnSelect each tab: `UpdateContext({locTab: "recipe"})` // or actuals / qa / audit

---

### TAB 1: Recipe

#### Size Banner
- **Rectangle:** Fill=#96C9A8, BorderRadius=12, Margin=14px 16px 0
- Left label: `"Batch Size · Recipe " & varSelectedBatch.fi_recipeversionid.fi_name`, Size=12, Color=RGBA(255,255,255,0.8)
- Large number: `Text(varSelectedBatch.fi_batchsize,"[$-en-US]0.##")`, Font=DM Serif Display, Size=28, Color=White
- Unit: `Text(varSelectedBatch.fi_batchunittype)`, Size=14, Color=RGBA(255,255,255,0.8)
- Right: ingredient count + critical count, Size=11, Color=RGBA(255,255,255,0.7)

#### Ingredient Gallery
- **Items:**
```powerapps
SortByColumns(
    Filter(fi_recipeingredient,
        fi_recipeversionid.fi_recipeversionid =
        varSelectedBatch.fi_recipeversionid.fi_recipeversionid),
    "fi_sortorder", SortOrder.Ascending
)
```

- Row height: 68
- Row Fill: `If(ThisItem.fi_iscritical, #fffbeb, White)`
- BorderBottom: 1px #e8edeb (except last row)

- **Color dot** (W=10, H=10, BorderRadius=5):
  `Fill=If(ThisItem.fi_iscritical, #d97706, #c8e6d4)`

- **Ingredient name:** fi_ingredientid.fi_name, Size=15, FontWeight=Medium
- **Base qty line:**
  `Text(fi_qtyperbaseunit,"[$-en-US]0.###") & " " & Text(fi_uom) & " per base unit"`
  Size=12, Color=#8fa89a — append `" · " & fi_notes` if fi_notes is not blank

- **Lot code line** (Phase 2):
  `LookUp(colBatchReceipt, IngredientId=ThisItem.fi_ingredientid.fi_ingredientid, LotCode)`
  Size=11, Color=#2563eb, FontFamily=Courier New
  Visible: `!IsBlank(above lookup result)`

- **Scaled quantity** (right-aligned):
  `Text(fi_qtyperbaseunit * varSelectedBatch.fi_batchsize, "[$-en-US]0.###")`
  Font=DM Serif Display, Size=20, Color=`If(ThisItem.fi_iscritical, #d97706, #5a9b72)`
- **UOM label:** `Text(fi_uom)`, Size=11, Color=#8fa89a

#### Record Actuals Button
- Fill=#96C9A8, Color=White, BorderRadius=12, W=App.Width-32, H=50
- OnSelect: `UpdateContext({locTab: "actuals"})`

---

### TAB 2: Actuals

#### Purpose
Operators enter actual quantities used during production.
Each row shows theoretical (calculated from recipe) vs actual (entered by operator).
Variance is calculated and flagged automatically.

#### Actuals Gallery
- **Items:**
  `Filter(fi_batchingredientactual, fi_batchrecordid.fi_batchrecordid = varSelectedBatch.fi_batchrecordid)`

- **If empty** (batch just created): show message
  "Actuals not yet created. Tap below to initialize from recipe."
  - **Button: "Initialize Actuals"**
```powerapps
ForAll(
    Filter(fi_recipeingredient,
        fi_recipeversionid.fi_recipeversionid=varSelectedBatch.fi_recipeversionid.fi_recipeversionid),
    Patch(fi_batchingredientactual, Defaults(fi_batchingredientactual), {
        fi_batchrecordid:   varSelectedBatch,
        fi_ingredientid:    fi_ingredientid,
        fi_theoreticalqty:  fi_qtyperbaseunit * varSelectedBatch.fi_batchsize,
        fi_uom:             fi_uom,
        fi_iscritical:      fi_iscritical
    })
);
Notify("Actuals initialized", NotificationType.Success)
```

- Row height: 90
- **Row Fill:**
```powerapps
If(ThisItem.fi_iscritical And
   Abs(ThisItem.fi_actualqty - ThisItem.fi_theoreticalqty) / ThisItem.fi_theoreticalqty > 0.05,
   #fef2f2,
   If(ThisItem.fi_iscritical, #fffbeb, White)
)
```

- **Row header:**
  - Left: ingredient name (fi_ingredientid.fi_name), Size=15, FontWeight=Medium
  - Right: variance badge:
```powerapps
If(IsBlank(fi_actualqty), "Pending",
   Text(Round((fi_actualqty-fi_theoreticalqty)/fi_theoreticalqty*100, 1), "+0.#;-0.#;0") & "%")
```
  - Badge Fill:
```powerapps
If(IsBlank(fi_actualqty), #f4f6f5,
   If(Abs((fi_actualqty-fi_theoreticalqty)/fi_theoreticalqty) < 0.02, #f0fdf4,
      If(Abs((fi_actualqty-fi_theoreticalqty)/fi_theoreticalqty) < 0.05, #fffbeb,
         #fef2f2)))
```

- **Two-column inputs below header:**
  - Left column — "Theoretical" (read-only):
    - Label: "THEORETICAL", Size=10, Color=#8fa89a, Uppercase
    - Value: `Text(fi_theoreticalqty,"[$-en-US]0.###") & " " & Text(fi_uom)`, Size=17, FontWeight=Medium, Color=#4f6b5c

  - Right column — "Actual Used" (editable):
    - Label: "ACTUAL USED", Size=10, Color=#8fa89a, Uppercase
    - TextInput:
      - Default=`If(IsBlank(fi_actualqty),"",Text(fi_actualqty,"[$-en-US]0.###"))`
      - Fill=`If(ThisItem.fi_iscritical, #fffbeb, #edf7f1)`
      - BorderColor=`If(ThisItem.fi_iscritical, #fde68a, #c8e6d4)`
      - Color=`If(ThisItem.fi_iscritical, #d97706, #5a9b72)`
      - FontWeight=Semibold, Size=17
      - OnChange: `Patch(fi_batchingredientactual, ThisItem, {fi_actualqty: Value(Self.Text)})`

- **Lot code row** (Phase 2, below inputs):
  `If(!IsBlank(fi_inventorylotid), fi_inventorylotid.fi_internallotcode & " · " & fi_inventorylotid.fi_supplierlot, "No lot scanned")`
  Size=11, Color=#2563eb (if scanned) or #8fa89a (if not)

#### Save Actuals Button
- Fill=#96C9A8, Color=White, BorderRadius=12
- OnSelect: `Notify("Actuals saved", NotificationType.Success)`
  - All changes already patched inline via OnChange — this button serves as confirmation UX only

---

### TAB 3: QA Tests

#### QA Status Summary Banner
- Show only if any critical test exists
- **Green banner** (all critical pass): Fill=#f0fdf4, Text="All critical tests passing", Color=#16a34a
- **Amber banner** (critical tests pending): Fill=#fffbeb, Text="Critical tests pending", Color=#d97706
- **Red banner** (critical test failed): Fill=#fef2f2, Text="Critical test failed — batch on hold", Color=#dc2626

- **Banner logic:**
```powerapps
If(CountIf(fi_qatest, fi_batchrecordid.fi_batchrecordid=varSelectedBatch.fi_batchrecordid
           And fi_iscritical And fi_passfail="Fail") > 0, "fail",
   If(CountIf(fi_qatest, fi_batchrecordid.fi_batchrecordid=varSelectedBatch.fi_batchrecordid
              And fi_iscritical And IsBlank(fi_actualresult)) > 0, "pending",
      "pass")
)
```

#### QA Tests Gallery
- **Items:**
```powerapps
SortByColumns(
    Filter(fi_qatest,
        fi_batchrecordid.fi_batchrecordid = varSelectedBatch.fi_batchrecordid),
    "fi_iscritical", SortOrder.Descending,
    "fi_testdatetime", SortOrder.Ascending
)
```

- Row height: 110
- Row Fill: `If(ThisItem.fi_iscritical And fi_passfail="Fail", #fef2f2, If(ThisItem.fi_iscritical, #fffbeb, White))`

- **Row header:**
  - Left: test type name (fi_testtype), Size=15, FontWeight=Medium
  - Right: pass/fail badge:
    - Pending: Fill=#f4f6f5, Text="Pending", Color=#8fa89a
    - Pass: Fill=#f0fdf4, Text="Pass", Color=#16a34a, BorderColor=#bbf7d0
    - Fail: Fill=#fef2f2, Text="Fail", Color=#dc2626, BorderColor=#fecaca

- **Two input columns:**
  - Left — "Result":
    - TextInput: Default=fi_actualresult, Placeholder="0.00"
    - Fill=`If(fi_iscritical, #fffbeb, #f4f6f5)`
    - OnChange:
```powerapps
Patch(fi_qatest, ThisItem, {
    fi_actualresult: Self.Text,
    fi_passfail: If(And(Value(Self.Text)>=fi_expectedmin, Value(Self.Text)<=fi_expectedmax), "Pass", "Fail"),
    fi_testdatetime: Now(),
    fi_testedby: varCurrentUser.FullName
})
```

  - Right — "Tested By":
    - TextInput: Default=fi_testedby, Placeholder="Name"
    - OnChange: `Patch(fi_qatest, ThisItem, {fi_testedby: Self.Text})`

- **Range info below inputs:**
  `"Range: " & Text(fi_expectedmin,"0.###") & " – " & Text(fi_expectedmax,"0.###") & If(!IsBlank(fi_testdatetime), " · " & Text(fi_testdatetime, "[$-en-US]h:mm AM/PM"), "")`
  Size=11, Color=`If(fi_iscritical, #d97706, #8fa89a)`

#### Add Test Button
- Fill=Transparent, BorderStyle=Dashed, BorderColor=#c8e6d4, Color=#5a9b72
- Text="+ Add Test", BorderRadius=12
- OnSelect: `UpdateContext({locShowAddTestForm: true})`

#### Add Test Overlay Form (Visible=locShowAddTestForm)
- Dim background rectangle: Fill=RGBA(0,0,0,0.4), W=App.Width, H=App.Height
- White card: W=App.Width-32, BorderRadius=16, centered
- **Fields:**
  - Test Type dropdown: `["pH","Brix","Potency (THC mg/mL)","Microbial","Viscosity","Color/Appearance","Weight per Unit","Other"]`
  - Expected Min: TextInput, numeric
  - Expected Max: TextInput, numeric
  - Is Critical: Toggle
  - Notes: TextInput, multiline
- **Save button:**
```powerapps
Patch(fi_qatest, Defaults(fi_qatest), {
    fi_batchrecordid:  varSelectedBatch,
    fi_testtype:       drpTestType.Selected.Value,
    fi_expectedmin:    Value(txtExpMin.Text),
    fi_expectedmax:    Value(txtExpMax.Text),
    fi_iscritical:     togCritical.Value,
    fi_notes:          txtQANotes.Text
});
UpdateContext({locShowAddTestForm: false});
Notify("Test added", NotificationType.Success)
```
- **Cancel:** `UpdateContext({locShowAddTestForm: false})`

#### Submit for Release Button
- Visible: varIsQALead
- Fill: `If(locQAStatus="pass", #96C9A8, #e8edeb)`
- Color: `If(locQAStatus="pass", White, #8fa89a)`
- Text: "Submit for Release"
- OnSelect:
```powerapps
If(locQAStatus <> "pass",
   Notify("All critical QA tests must pass before release.", NotificationType.Error),

   Patch(fi_batchrecord, varSelectedBatch, {fi_status: 'fi_status (fi_batchrecord)'.Complete});

   Patch(fi_auditlog, Defaults(fi_auditlog), {
       fi_name:          "Complete-" & varSelectedBatch.fi_lotcode & "-" & Text(Now(),"yyyymmddhhmmss"),
       fi_entityname:    "fi_batchrecord",
       fi_recordid:      Text(varSelectedBatch.fi_batchrecordid),
       fi_recordname:    varSelectedBatch.fi_lotcode,
       fi_action:        'fi_action (fi_auditlog)'.Update,
       fi_oldvalue:      "Pending QA",
       fi_newvalue:      "Complete",
       fi_changedbyname: varCurrentUser.FullName,
       fi_changedon:     Now(),
       fi_changereason:  "All critical QA tests passed. Batch released."
   });

   Notify("Batch marked Complete and released.", NotificationType.Success);
   Navigate(scnBatchQueue, ScreenTransition.UnCover)
)
```

---

### TAB 4: Audit Log

#### Timeline Gallery
- **Items:**
```powerapps
SortByColumns(
    Filter(fi_auditlog,
        fi_recordid = Text(varSelectedBatch.fi_batchrecordid)),
    "fi_changedon", SortOrder.Descending
)
```

- Row height: 80
- No row separator — use timeline dot + connecting line instead

- **Timeline dot** (W=10, H=10, BorderRadius=5, X=16):
```powerapps
Fill=Switch(ThisItem.fi_action,
    'Create':     #96C9A8,
    'Submit':     #d97706,
    'Approve':    #16a34a,
    'Reject':     #dc2626,
    'Update':     #d97706,
    'QA Entry':   #96C9A8,
    'Complete':   #16a34a,
    #8fa89a
)
```

- **Connecting line** (W=2, X=19, Y=dot bottom, H=row height - dot size):
  Fill=#e8edeb, Visible: `ThisItem <> Last(Self.Items)` (hide on last row)

- **Action label** (X=36):
  Text=`Upper(Text(ThisItem.fi_action))`, Size=11, FontWeight=Semibold
  Color=same logic as dot fill above, LetterSpacing=0.06em

- **Description** (X=36, below action):
  `ThisItem.fi_newvalue & If(!IsBlank(ThisItem.fi_changereason), " · " & ThisItem.fi_changereason, "")`
  Size=13, Color=#1e3028

- **Meta** (X=36, below description):
  `ThisItem.fi_changedbyname & " · " & Text(ThisItem.fi_changedon, "[$-en-US]mmm d, h:mm AM/PM")`
  Size=12, Color=#8fa89a

#### Export Audit Button (QA Lead only)
- Visible=varIsQALead
- Text="Export Audit Log"
- Fill=White, BorderColor=#e8edeb, Color=#4f6b5c
- OnSelect: `Notify("Audit export — connect Power Automate flow in Phase 2", NotificationType.Information)`
