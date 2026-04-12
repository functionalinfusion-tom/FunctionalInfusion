# cmpLoadingScreen — Usage Guide

Branded loading screen component for the Functional Infusion canvas app.

## Features

- Animated logo mark with pulsing ring
- Two-tone wordmark (name + accent word)
- Uppercase subtitle
- Indeterminate progress bar
- Step-based status messages with dot indicators
- Configurable minimum display time
- OnReady event for navigation
- Light/Dark theme support
- Error message display

## Component properties

### Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| AccentColor | Color | `RGBA(150, 201, 168, 1)` | Primary accent color |
| AppName | Text | `"Functional"` | First word of wordmark |
| AppNameAccent | Text | `"Infusion"` | Second word in accent color |
| AppSubtitle | Text | `"Batch App"` | Uppercase subtitle below wordmark |
| AppVersion | Text | `"v2.1"` | Version badge text |
| CompanyName | Text | `"Functional Infusion LLC"` | Company badge text |
| CurrentStep | Number | `0` | 1-based active loading step |
| ErrorMessage | Text | `""` | Error text (hides progress when set) |
| LoadingSteps | Table | 4 rows | `{msg: Text}` table of step labels |
| LogoLetter | Text | `"F"` | Character in logo mark |
| MinDisplayTime | Number | `1500` | Milliseconds before OnReady fires |
| Theme | Text | `"Light"` | `"Dark"` or `"Light"` |

### Outputs

| Property | Type | Description |
|----------|------|-------------|
| IsReady | Boolean | True once MinDisplayTime has elapsed |

### Events

| Property | Description |
|----------|-------------|
| OnReady | Fires once MinDisplayTime elapses. Wire to Navigate(). |

## Wiring to navigate after 3 seconds

### 1. Set MinDisplayTime

On the component instance:

```
MinDisplayTime = 3000
```

### 2. Wire OnReady

On the component instance:

```
OnReady = Navigate(scrHome, ScreenTransition.Fade)
```

### 3. Add a step timer on the host screen

Add a Timer control to the screen that contains the component:

| Property | Value |
|----------|-------|
| Name | `tmrSteps` |
| AutoStart | `true` |
| Duration | `750` |
| Repeat | `true` |
| Visible | `false` |
| OnTimerEnd | `UpdateContext({locStep: Min(locStep + 1, CountRows(cmpLoadingScreen1.LoadingSteps))})` |

### 4. Initialize step counter

On the host screen's `OnVisible`:

```
UpdateContext({locStep: 1})
```

### 5. Bind CurrentStep

On the component instance:

```
CurrentStep = locStep
```

### Result

| Time | Step | Message |
|------|------|---------|
| 0.0s | 1 | Getting things ready... |
| 0.75s | 2 | Connecting to data... |
| 1.5s | 3 | Loading rate tables... |
| 2.25s | 4 | Preparing workspace... |
| 3.0s | — | OnReady fires, navigates to scrHome |

## Showing errors

Set `ErrorMessage` to a non-blank string to hide the progress bar and
dots and display the error in red:

```
ErrorMessage = If(
    IsError(varConfig),
    "Failed to load configuration. Please try again.",
    ""
)
```

## Theme switching

The component supports `"Dark"` and `"Light"` themes:

- **Light:** White background `RGBA(237, 246, 240, 1)`, charcoal text
- **Dark:** Charcoal background `RGBA(26, 26, 26, 1)`, light text

Both themes include ambient SVG glow effects using the AccentColor.

## YAML source

The full component YAML is in `canvas-app/screens/loading-screen.yaml`.
