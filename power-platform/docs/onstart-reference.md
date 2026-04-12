# App.Formulas and App.OnStart Reference

## App.Formulas (preferred)

Place this in **App > Formulas**. Uses declarative `name = value;` syntax.
Named formulas recalculate automatically when dependencies change (e.g.
`screenSize` updates on window resize). **Do not** use `Set()` here.

```
// ============================================================
// Functional Infusion — PowerApps Design System
// Version: 1.0.0
// ============================================================

// ── 1. Responsive Layout ────────────────────────────────────

screenSize =
    If(
        App.Width <= 768, "Small",
        App.Width <= 991, "Medium",
        "Large"
    );

isLandscape = App.Width > App.Height;

// ── 2. Color Palette ────────────────────────────────────────

AppColors = {
    Primary:        ColorValue("#96C9A8"),
    PrimaryDark:    ColorValue("#698C75"),
    PrimaryLight:   ColorValue("#CAE4D3"),
    PrimaryXLight:  ColorValue("#EDF6F0"),
    Black:          ColorValue("#000000"),
    Charcoal:       ColorValue("#1A1A1A"),
    White:          ColorValue("#FFFFFF"),
    Neutral:        ColorValue("#F4F4F2"),
    Gray900:        ColorValue("#1A1A1A"),
    Gray800:        ColorValue("#333333"),
    Gray700:        ColorValue("#4A4A4A"),
    Gray600:        ColorValue("#646464"),
    Gray500:        ColorValue("#808080"),
    Gray400:        ColorValue("#999999"),
    Gray300:        ColorValue("#C0C0C0"),
    Gray200:        ColorValue("#D1D5DB"),
    Gray100:        ColorValue("#F0F0F0"),
    Gray50:         ColorValue("#F8F8F8"),
    Yellow:         ColorValue("#FFE600"),
    Teal:           ColorValue("#00A3AE"),
    Purple:         ColorValue("#91278F"),
    Lilac:          ColorValue("#AC98DB"),
    Danger:         ColorValue("#D94F4F"),
    Warning:        ColorValue("#F59E0B"),
    Success:        ColorValue("#16A34A"),
    Info:           ColorValue("#0EA5E9"),
    LinkBlue:       ColorValue("#00A3AE"),
    PrimaryFade:    ColorFade(ColorValue("#96C9A8"), 50%),
    YellowFade:     ColorFade(ColorValue("#FFE600"), 50%),
    TealFade:       ColorFade(ColorValue("#00A3AE"), 50%),
    PurpleFade:     ColorFade(ColorValue("#91278F"), 50%),
    LilacFade:      ColorFade(ColorValue("#AC98DB"), 50%)
};

// ── 3. Typography ───────────────────────────────────────────

AppFonts = {
    Display:    Font.'Lato Black',
    Body:       Font.'Lato',
    Light:      Font.'Lato Light',
    Mono:       Font.'Courier New'
};

txtSize = {
    XS:     10,
    SM:     12,
    Base:   14,
    LG:     16,
    XL:     18,
    XXL:    22,
    H3:     20,
    H2:     26,
    H1:     32
};

// ── 4. Spacing (4px grid) ───────────────────────────────────

gap = {
    S1:     4,
    S2:     8,
    S3:     12,
    S4:     16,
    S6:     24,
    S8:     32,
    S12:    48,
    S16:    64,
    S24:    96
};

// ── 5. Border Radius ────────────────────────────────────────

AppRadius = {
    SM:     4,
    MD:     8,
    LG:     16
};

// ── 6. Icon Sizing ──────────────────────────────────────────

iconSize = {
    SM:         16,
    MD:         24,
    LG:         32,
    XL:         48,
    TouchMin:   48
};

// ── 7. Button Styles ────────────────────────────────────────

btnPrimary = {
    Height:             48,
    MinWidth:           140,
    Fill:               AppColors.Primary,
    Color:              AppColors.Charcoal,
    Font:               AppFonts.Body,
    Size:               14,
    Weight:             FontWeight.Semibold,
    BorderColor:        AppColors.Primary,
    BorderThickness:    2,
    RadiusTopLeft:      8,
    RadiusTopRight:     8,
    RadiusBottomLeft:   8,
    RadiusBottomRight:  8,
    PaddingTop:         12,
    PaddingBottom:      12,
    PaddingLeft:        24,
    PaddingRight:       24,
    HoverFill:          AppColors.PrimaryDark,
    HoverColor:         AppColors.White,
    PressedFill:        AppColors.PrimaryDark,
    PressedColor:       AppColors.White,
    DisabledFill:       AppColors.Gray200,
    DisabledColor:      AppColors.Gray400
};

btnSecondary = {
    Height:             48,
    MinWidth:           140,
    Fill:               AppColors.White,
    Color:              AppColors.Charcoal,
    Font:               AppFonts.Body,
    Size:               14,
    Weight:             FontWeight.Semibold,
    BorderColor:        AppColors.Gray300,
    BorderThickness:    2,
    RadiusTopLeft:      8,
    RadiusTopRight:     8,
    RadiusBottomLeft:   8,
    RadiusBottomRight:  8,
    PaddingTop:         12,
    PaddingBottom:      12,
    PaddingLeft:        24,
    PaddingRight:       24,
    HoverFill:          AppColors.PrimaryXLight,
    HoverColor:         AppColors.Charcoal,
    PressedFill:        AppColors.PrimaryLight,
    PressedColor:       AppColors.Charcoal,
    DisabledFill:       AppColors.Gray100,
    DisabledColor:      AppColors.Gray400
};

btnTertiary = {
    Height:             48,
    MinWidth:           140,
    Fill:               AppColors.Gray800,
    Color:              AppColors.White,
    Font:               AppFonts.Body,
    Size:               14,
    Weight:             FontWeight.Semibold,
    BorderColor:        AppColors.Gray800,
    BorderThickness:    2,
    RadiusTopLeft:      8,
    RadiusTopRight:     8,
    RadiusBottomLeft:   8,
    RadiusBottomRight:  8,
    PaddingTop:         12,
    PaddingBottom:      12,
    PaddingLeft:        24,
    PaddingRight:       24,
    HoverFill:          AppColors.Charcoal,
    HoverColor:         AppColors.White,
    PressedFill:        AppColors.Black,
    PressedColor:       AppColors.White,
    DisabledFill:       AppColors.Gray200,
    DisabledColor:      AppColors.Gray400
};

btnDanger = {
    Height:             48,
    MinWidth:           140,
    Fill:               AppColors.Danger,
    Color:              AppColors.White,
    Font:               AppFonts.Body,
    Size:               14,
    Weight:             FontWeight.Semibold,
    BorderColor:        AppColors.Danger,
    BorderThickness:    2,
    RadiusTopLeft:      8,
    RadiusTopRight:     8,
    RadiusBottomLeft:   8,
    RadiusBottomRight:  8,
    PaddingTop:         12,
    PaddingBottom:      12,
    PaddingLeft:        24,
    PaddingRight:       24,
    HoverFill:          ColorValue("#B91C1C"),
    HoverColor:         AppColors.White,
    PressedFill:        ColorValue("#991B1B"),
    PressedColor:       AppColors.White,
    DisabledFill:       AppColors.Gray200,
    DisabledColor:      AppColors.Gray400
};

btnSmall = {
    Height:         36,
    MinWidth:       100,
    Size:           12,
    PaddingTop:     8,
    PaddingBottom:  8,
    PaddingLeft:    16,
    PaddingRight:   16
};

btnLarge = {
    Height:         56,
    MinWidth:       180,
    Size:           18,
    PaddingTop:     16,
    PaddingBottom:  16,
    PaddingLeft:    32,
    PaddingRight:   32
};

// ── 8. Input / Form Styles ─────────────────────────────────

inputStyle = {
    Height:             48,
    Font:               AppFonts.Body,
    Size:               14,
    Color:              AppColors.Charcoal,
    Fill:               AppColors.White,
    BorderColor:        AppColors.Gray300,
    BorderThickness:    1,
    RadiusTopLeft:      8,
    RadiusTopRight:     8,
    RadiusBottomLeft:   8,
    RadiusBottomRight:  8,
    PaddingLeft:        16,
    PaddingRight:       16,
    FocusBorderColor:   AppColors.PrimaryDark,
    HoverBorderColor:   AppColors.Gray400,
    PlaceholderColor:   AppColors.Gray400,
    ErrorBorderColor:   AppColors.Danger
};

labelStyle = {
    Font:       AppFonts.Body,
    Size:       12,
    Color:      AppColors.Charcoal,
    Weight:     FontWeight.Semibold,
    Height:     24
};

// ── 9. Header / Navigation ────────────────────────────────

AppHeader = {
    Height:         If(screenSize = "Small", 56, 72),
    Fill:           AppColors.White,
    BorderColor:    AppColors.Gray200,
    PaddingX:       If(screenSize = "Small", 16, 24),
    TitleFont:      AppFonts.Display,
    TitleSize:      If(screenSize = "Small", 16, 18),
    TitleColor:     AppColors.Charcoal,
    BackBtnSize:    40,
    IconColor:      AppColors.Charcoal
};

// ── 10. Card Styles ─────────────────────────────────────────

cardStyle = {
    Fill:               AppColors.White,
    BorderColor:        AppColors.Gray200,
    BorderThickness:    1,
    RadiusTopLeft:      8,
    RadiusTopRight:     8,
    RadiusBottomLeft:   8,
    RadiusBottomRight:  8,
    PaddingAll:         If(screenSize = "Small", 16, 24),
    HeaderPadding:      16,
    FooterPadding:      16
};

// ── 11. Sidebar ─────────────────────────────────────────────

sidebarStyle = {
    Width:          If(
                        screenSize = "Small",  0,
                        screenSize = "Medium", 72,
                        260
                    ),
    Fill:           AppColors.Charcoal,
    LinkColor:      RGBA(255, 255, 255, 0.65),
    ActiveColor:    AppColors.White,
    ActiveFill:     RGBA(255, 255, 255, 0.1),
    AccentColor:    AppColors.Primary
};
```

## App.OnStart (imperative only)

Place this in **App > OnStart**. Only use for things that must run once.

```
Set(CurrentUserEmail, User().Email);
Set(CurrentUserName,  User().FullName);
```

## App.OnStart alternative (if App.Formulas is not available)

If your environment does not support `App.Formulas`, wrap every token
block in `Set()` and place it all in `App.OnStart`. See the
[original OnStart discussion](#) for the full `Set()` version.

**Important:** `Set()` is a behavior function and can only be used in
behavior properties (`OnStart`, `OnSelect`, `OnChange`, etc.). Placing
`Set()` in `App.Formulas` causes:

> "Behavior function in a non-behavior property"
