# Power Fx Formula Patterns — Functional Infusion Canvas App

## App.OnStart — Role Detection

```powerapps
Set(varCurrentUser, User());
Set(
    varIsQALead,
    !IsEmpty(
        Filter('Role Assignments',
            UserID = varCurrentUser.Email And RoleName = "FI - QA Lead")
    )
);
// Temp fallback until role table exists:
// Set(varIsQALead, varCurrentUser.Email in ["tom@functionalinfusion.com","dana@functionalinfusion.com"]);
Set(varSelectedBatch, Blank());
Set(varSelectedVersion, Blank());
Set(varSelectedMaster, Blank());
```

## Navigation — Screen Routing

```powerapps
// Navigate with context
Navigate(scnRecipeDetail, ScreenTransition.None, {navRecipeMaster: ThisItem});

// Back with cleanup
Navigate(scnHome, ScreenTransition.None);
Set(varSelectedVersion, Blank());
```

## Dataverse — Filter Active Recipes

```powerapps
// All active recipe masters for a customer
Filter(
    fi_recipemasters,
    fi_customerid = varSelectedCustomer.fi_customerid,
    fi_isactive = true
)
```

## Dataverse — Get Active Version

```powerapps
// The ONE active version for a recipe master
LookUp(
    fi_recipeversions,
    fi_recipemasterid = varSelectedMaster.fi_recipemasterid
    And fi_status = 'fi_recipeversionstatus'.Active
)
```

## Dataverse — Recipe Ingredients Sorted

```powerapps
Sort(
    Filter(
        fi_recipeingredients,
        fi_recipeversionid = varSelectedVersion.fi_recipeversionid
    ),
    fi_sortorder,
    SortOrder.Ascending
)
```

## Audit Log — Write Entry

```powerapps
// Call from OnSelect after any state change
Patch(
    fi_auditlogs,
    Defaults(fi_auditlogs),
    {
        fi_name: "Submit-" & varSelectedVersion.fi_name & "-" & Text(Now(), "yyyy-mm-dd hh:mm"),
        fi_entityname: "fi_recipeversion",
        fi_recordid: Text(varSelectedVersion.fi_recipeversionid),
        fi_recordname: varSelectedVersion.fi_name,
        fi_action: 'fi_auditaction'.Submit,
        fi_oldvalue: "Draft",
        fi_newvalue: "Pending Approval",
        fi_changedbyname: varCurrentUser.FullName,
        fi_changedon: Now()
    }
)
```

## Status Badge — Conditional Color

```powerapps
// Use on a label or container Fill property
Switch(
    ThisItem.fi_status,
    'fi_recipeversionstatus'.Draft,            RGBA(209, 213, 219, 1),
    'fi_recipeversionstatus'.'Pending Approval', RGBA(245, 158, 11, 1),
    'fi_recipeversionstatus'.Active,           RGBA(150, 201, 168, 1),
    'fi_recipeversionstatus'.Superseded,       RGBA(153, 153, 153, 1),
    'fi_recipeversionstatus'.Archived,         RGBA(107, 114, 128, 1),
    'fi_recipeversionstatus'.Rejected,         RGBA(217, 79, 79, 1),
    RGBA(240, 240, 240, 1)
)
```

## Status Row Tint — Gallery TemplateFill

```powerapps
// Subtle background tint per status (use on gallery TemplateFill or container Fill)
Switch(
    ThisItem.fi_status,
    'fi_status (fi_recipeversion)'.Draft,              ColorValue("#e8edeb"),
    'fi_status (fi_recipeversion)'.'Pending Approval', ColorValue("#fffbeb"),
    'fi_status (fi_recipeversion)'.Active,             ColorValue("#f0fdf4"),
    'fi_status (fi_recipeversion)'.Superseded,         ColorValue("#f4f6f5"),
    'fi_status (fi_recipeversion)'.Archived,           ColorValue("#fef2f2"),
    ColorValue("#f4f6f5")
)
```

## Status Badge — Text Color

```powerapps
Switch(
    ThisItem.fi_status,
    'fi_recipeversionstatus'.Draft,            RGBA(74, 74, 74, 1),
    'fi_recipeversionstatus'.'Pending Approval', RGBA(255, 255, 255, 1),
    'fi_recipeversionstatus'.Active,           RGBA(26, 26, 26, 1),
    'fi_recipeversionstatus'.Superseded,       RGBA(255, 255, 255, 1),
    'fi_recipeversionstatus'.Archived,         RGBA(255, 255, 255, 1),
    'fi_recipeversionstatus'.Rejected,         RGBA(255, 255, 255, 1),
    RGBA(26, 26, 26, 1)
)
```

## Submit for Approval — Button

```powerapps
// Visible — only show for Draft versions when user is QA Lead
varSelectedVersion.fi_status = 'fi_status (fi_recipeversion)'.Draft And varIsQALead

// OnSelect
If(
    IsBlank(txtChangeReason.Text),
    Notify("Change reason is required before submitting.", NotificationType.Error),

    Patch(fi_recipeversion, varSelectedVersion,
        {fi_status: 'fi_status (fi_recipeversion)'.'Pending Approval'});

    Patch(fi_auditlog, Defaults(fi_auditlog), {
        fi_name:          "Submit-" & varSelectedVersion.fi_name & "-" & Text(Now(),"[$-en-US]yyyymmddhhmmss"),
        fi_entityname:    "fi_recipeversion",
        fi_recordid:      Text(varSelectedVersion.fi_recipeversionid),
        fi_recordname:    varSelectedVersion.fi_name,
        fi_action:        'fi_action (fi_auditlog)'.'Submit for Approval',
        fi_oldvalue:      "Draft",
        fi_newvalue:      "Pending Approval",
        fi_changedbyname: varCurrentUser.FullName,
        fi_changedon:     Now(),
        fi_changereason:  txtChangeReason.Text
    });

    Notify("Submitted for approval.", NotificationType.Success);
    Navigate(RecipeVersionList, ScreenTransition.Fade)
)
```

## Approve — Call Flow Button

```powerapps
// Visible — only for Pending Approval versions when user is QA Lead
varSelectedVersion.fi_status = 'fi_status (fi_recipeversion)'.'Pending Approval'
And varIsQALead

// OnSelect
Set(varApproving, true);
FI_ApproveRecipeVersion.Run(
    varSelectedVersion.fi_recipeversionid,
    varCurrentUser.Email,
    varCurrentUser.FullName,
    Text(Now(), "[$-en-US]yyyy-mm-ddThh:mm:ss")
);
Set(varApproving, false);
Notify("Recipe version approved and activated.", NotificationType.Success);
Navigate(RecipeVersionList, ScreenTransition.Fade)
```

## Clone — Call Flow

```powerapps
Set(
    varCloneResult,
    'FI-CloneRecipeVersion'.Run(
        Text(varSelectedVersion.fi_recipeversionid),
        varCurrentUser.FullName,
        varCurrentUser.Email
    )
);
Notify("New draft v" & varCloneResult.newVersionLabel & " created.", NotificationType.Success);
Navigate(scnVersionDetail, ScreenTransition.None, {navVersion: LookUp(fi_recipeversions, fi_recipeversionid = GUID(varCloneResult.newRecipeVersionId))});
```

## Responsive Helpers

```powerapps
// Screen size band (use in App.Formulas)
screenSize = If(App.Width <= 768, "Small", App.Width <= 991, "Medium", "Large");

// Conditional padding
=If(screenSize = "Small", 16, 24)

// Stack direction
=If(screenSize = "Small", LayoutDirection.Vertical, LayoutDirection.Horizontal)
```

## Delegation-Safe Search

```powerapps
// Text search on fi_name (delegable with StartsWith)
Sort(
    Filter(
        fi_recipemasters,
        StartsWith(fi_name, txtSearch.Value),
        fi_isactive = true
    ),
    fi_name,
    SortOrder.Ascending
)
```

## Calculated Fields

```powerapps
// Total ingredient weight for a version
Sum(
    Filter(fi_recipeingredients, fi_recipeversionid = varSelectedVersion.fi_recipeversionid),
    fi_qtyperbaseunit
)

// Ingredient count
CountRows(
    Filter(fi_recipeingredients, fi_recipeversionid = varSelectedVersion.fi_recipeversionid)
)

// Critical ingredient count
CountRows(
    Filter(
        fi_recipeingredients,
        fi_recipeversionid = varSelectedVersion.fi_recipeversionid,
        fi_iscritical = true
    )
)
```

## Gallery — Recipe Master List

```powerapps
// Gallery Items — all active recipe masters sorted A-Z
SortByColumns(
    Filter(fi_recipemaster, fi_isactive = true),
    "fi_name", SortOrder.Ascending
)

// Active version label per row (use in a label inside the gallery)
LookUp(
    fi_recipeversion,
    fi_recipemasterid.fi_recipemasterid = ThisItem.fi_recipemasterid
    And fi_status = 'fi_status (fi_recipeversion)'.Active,
    fi_name
)
```

## Form DisplayMode — Draft + QA Lead Gate

```powerapps
// Only allow editing when version is Draft AND user is QA Lead
If(
    varSelectedVersion.fi_status = 'fi_status (fi_recipeversion)'.Draft
    And varIsQALead,
    DisplayMode.Edit,
    DisplayMode.View
)
```

## Batch Receipt — Scale Ingredients to Collection

```powerapps
// Call on navigate to batch receipt screen
// Builds a local collection with scaled quantities and empty lot fields for operator entry
ClearCollect(colBatchReceipt,
    ForAll(
        SortByColumns(
            Filter(fi_recipeingredient,
                fi_recipeversionid.fi_recipeversionid = varActiveVersion.fi_recipeversionid),
            "fi_sortorder", SortOrder.Ascending
        ),
        {
            IngredientName: fi_ingredientid.fi_name,
            IngredientId:   fi_ingredientid.fi_ingredientid,
            BaseQty:        fi_qtyperbaseunit,
            ScaledQty:      fi_qtyperbaseunit * varBatchSize,
            UOM:            Text(fi_uom),
            IsCritical:     fi_iscritical,
            SortOrder:      fi_sortorder,
            Notes:          fi_notes,
            LotCode:        "",
            InventoryLotId: ""
        }
    )
)
```
