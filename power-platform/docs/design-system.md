# Functional Infusion — Power Apps Design System

All design tokens for the canvas app. Use these RGBA values directly in
control properties. This mirrors the website CSS variables in
`css/variables.css`.

## Color palette

### Brand

| Token | Hex | RGBA | Usage |
|-------|-----|------|-------|
| Primary | `#96C9A8` | `RGBA(150, 201, 168, 1)` | Buttons, accents, active states |
| PrimaryDark | `#698C75` | `RGBA(105, 140, 117, 1)` | Hover states, active nav, links |
| PrimaryLight | `#CAE4D3` | `RGBA(202, 228, 211, 1)` | Inactive dots (light theme) |
| PrimaryXLight | `#EDF6F0` | `RGBA(237, 246, 240, 1)` | Icon badge backgrounds, tint fills |

### Neutrals

| Token | Hex | RGBA | Usage |
|-------|-----|------|-------|
| Black | `#000000` | `RGBA(0, 0, 0, 1)` | — |
| Charcoal | `#1A1A1A` | `RGBA(26, 26, 26, 1)` | Primary text, dark backgrounds |
| White | `#FFFFFF` | `RGBA(255, 255, 255, 1)` | Card fills, light backgrounds |
| Neutral | `#F4F4F2` | `RGBA(244, 244, 242, 1)` | Page background |

### Gray scale

| Token | Hex | RGBA |
|-------|-----|------|
| Gray900 | `#1A1A1A` | `RGBA(26, 26, 26, 1)` |
| Gray800 | `#333333` | `RGBA(51, 51, 51, 1)` |
| Gray700 | `#4A4A4A` | `RGBA(74, 74, 74, 1)` |
| Gray600 | `#646464` | `RGBA(100, 100, 100, 1)` |
| Gray500 | `#808080` | `RGBA(128, 128, 128, 1)` |
| Gray400 | `#999999` | `RGBA(153, 153, 153, 1)` |
| Gray300 | `#C0C0C0` | `RGBA(192, 192, 192, 1)` |
| Gray200 | `#D1D5DB` | `RGBA(209, 213, 219, 1)` |
| Gray100 | `#F0F0F0` | `RGBA(240, 240, 240, 1)` |
| Gray50 | `#F8F8F8` | `RGBA(248, 248, 248, 1)` |

### Extended

| Token | Hex | RGBA | Usage |
|-------|-----|------|-------|
| Yellow | `#FFE600` | `RGBA(255, 230, 0, 1)` | Highlights |
| Teal | `#00A3AE` | `RGBA(0, 163, 174, 1)` | Links |
| Purple | `#91278F` | `RGBA(145, 39, 143, 1)` | Accent |
| Lilac | `#AC98DB` | `RGBA(172, 152, 219, 1)` | Accent |

### Semantic

| Token | Hex | RGBA | Usage |
|-------|-----|------|-------|
| Danger | `#D94F4F` | `RGBA(217, 79, 79, 1)` | Errors, destructive actions |
| Warning | `#F59E0B` | `RGBA(245, 158, 11, 1)` | Warnings |
| Success | `#16A34A` | `RGBA(22, 163, 74, 1)` | Success, positive metrics |
| Info | `#0EA5E9` | `RGBA(14, 165, 233, 1)` | Informational |

### Faded variants (50%)

Use `ColorFade()` in Power Apps formulas:

```
ColorFade(RGBA(150, 201, 168, 1), 50%)   // PrimaryFade
ColorFade(RGBA(255, 230, 0, 1), 50%)     // YellowFade
ColorFade(RGBA(0, 163, 174, 1), 50%)     // TealFade
ColorFade(RGBA(145, 39, 143, 1), 50%)    // PurpleFade
ColorFade(RGBA(172, 152, 219, 1), 50%)   // LilacFade
```

**Do not** use 8-digit hex in `ColorValue()` — Power Apps does not support it.

## Typography

### Font families

| Token | Power Apps value | Usage |
|-------|-----------------|-------|
| Display | `Font.'Lato Black'` | Headings, logo letter, stat values |
| Body | `Font.'Lato'` | Body text, labels, buttons |
| Light | `Font.'Lato Light'` | Subtle text |
| Mono | `Font.'Courier New'` | Code, IDs |

For HtmlViewer controls:
```
font-family: Lato, Helvetica Neue, Helvetica, sans-serif
```

### Type scale

| Token | Size (px) | Usage |
|-------|-----------|-------|
| XS | 10 | Stat labels, version text, footer nav labels |
| SM | 12 | Form labels, subtitles, timestamps, badge text |
| Base | 14 | Body text, button text, list item titles |
| LG | 16 | Header title (mobile), larger body |
| XL | 18 | Header title (desktop), large buttons |
| XXL | 22 | Section headings |
| H3 | 20 | Card section headings |
| H2 | 26 | Stat card values, page headings |
| H1 | 32 | Hero headings |

## Spacing (4px grid)

| Token | Value (px) | Common use |
|-------|-----------|------------|
| S1 | 4 | Tight gaps (dot gallery, stat label-to-value) |
| S2 | 8 | Icon-to-label in footer, small padding |
| S3 | 12 | Icon-to-text in list items, card header gaps |
| S4 | 16 | Standard padding, gaps between cards (mobile) |
| S6 | 24 | Standard padding (desktop), gaps between cards (desktop) |
| S8 | 32 | Section padding |
| S12 | 48 | Large section padding |
| S16 | 64 | Page-level padding |
| S24 | 96 | Hero spacing |

## Border radius

| Token | Value (px) | Usage |
|-------|-----------|-------|
| SM | 4 | Small elements, hamburger button |
| MD | 8 | Cards, buttons, inputs, icon badges, containers |
| LG | 16 | Modals, large containers |

## Icon sizing

| Token | Value (px) | Usage |
|-------|-----------|-------|
| SM | 16 | Tab icons, inline indicators |
| MD | 24 | Button icons, nav icons, footer icons |
| LG | 32 | Card icons |
| XL | 48 | Hero icons, empty state icons |
| TouchMin | 48 | Minimum interactive element size (WCAG) |

## Component tokens

### Buttons

#### Primary (sage green fill)

| Property | Value |
|----------|-------|
| Height | 48 |
| MinWidth | 140 |
| Fill | `RGBA(150, 201, 168, 1)` |
| Color | `RGBA(26, 26, 26, 1)` |
| Font | `Font.'Lato'` |
| Size | 14 |
| FontWeight | `FontWeight.Semibold` |
| BorderColor | `RGBA(150, 201, 168, 1)` |
| BorderThickness | 2 |
| BorderRadius | 8 (all corners) |
| Padding | 12 top/bottom, 24 left/right |
| HoverFill | `RGBA(105, 140, 117, 1)` |
| HoverColor | `RGBA(255, 255, 255, 1)` |
| DisabledFill | `RGBA(209, 213, 219, 1)` |
| DisabledColor | `RGBA(153, 153, 153, 1)` |

#### Secondary (white, gray border)

| Property | Value |
|----------|-------|
| Fill | `RGBA(255, 255, 255, 1)` |
| Color | `RGBA(26, 26, 26, 1)` |
| BorderColor | `RGBA(192, 192, 192, 1)` |
| HoverFill | `RGBA(237, 246, 240, 1)` |

#### Tertiary (charcoal fill)

| Property | Value |
|----------|-------|
| Fill | `RGBA(51, 51, 51, 1)` |
| Color | `RGBA(255, 255, 255, 1)` |
| HoverFill | `RGBA(26, 26, 26, 1)` |

#### Danger (red fill)

| Property | Value |
|----------|-------|
| Fill | `RGBA(217, 79, 79, 1)` |
| Color | `RGBA(255, 255, 255, 1)` |
| HoverFill | `RGBA(185, 28, 28, 1)` |

#### Size variants

| Variant | Height | MinWidth | Size | Padding |
|---------|--------|----------|------|---------|
| Small | 36 | 100 | 12 | 8/16 |
| Default | 48 | 140 | 14 | 12/24 |
| Large | 56 | 180 | 18 | 16/32 |

### Inputs

| Property | Value |
|----------|-------|
| Height | 48 |
| Fill | `RGBA(255, 255, 255, 1)` |
| Color | `RGBA(26, 26, 26, 1)` |
| BorderColor | `RGBA(192, 192, 192, 1)` |
| BorderThickness | 1 |
| BorderRadius | 8 (all corners) |
| PaddingLeft/Right | 16 |
| FocusBorderColor | `RGBA(105, 140, 117, 1)` |
| ErrorBorderColor | `RGBA(217, 79, 79, 1)` |

### Cards

| Property | Value |
|----------|-------|
| Fill | `RGBA(255, 255, 255, 1)` |
| BorderColor | `RGBA(209, 213, 219, 1)` |
| BorderThickness | 1 |
| BorderRadius | 8 (all corners) |
| DropShadow | `DropShadow.Light` |
| Padding (mobile) | 16 |
| Padding (desktop) | 24 |

### Header

| Property | Mobile (<=768) | Desktop (>768) |
|----------|---------------|----------------|
| Height | 56 | 72 |
| Fill | `RGBA(255, 255, 255, 1)` |
| PaddingX | 16 | 24 |
| TitleFont | `Font.'Lato Black'` |
| TitleSize | 16 | 18 |
| DropShadow | `DropShadow.Light` |

## Responsive breakpoints

| Name | Condition | Layout |
|------|-----------|--------|
| Small | `Parent.Width <= 768` | Single column, stacked, 16px padding |
| Medium | `Parent.Width <= 991` | 2-column grids, 24px padding |
| Large | `Parent.Width >= 992` | Full layout, sidebar (260px), 24px padding |

### Common responsive patterns

```
// Padding
=If(Parent.Width <= 768, 16, 24)

// LayoutDirection (stack on mobile, row on desktop)
=If(Parent.Width <= 768, LayoutDirection.Vertical, LayoutDirection.Horizontal)

// Header height
=If(Parent.Width <= 768, 56, 72)

// Sidebar width
=If(Parent.Width <= 768, 0, If(Parent.Width <= 991, 72, 260))
```
