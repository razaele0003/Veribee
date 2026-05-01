# Veribee Design System

> **Source of truth** for all design tokens. `constants/colors.ts`, `constants/typography.ts`, `constants/spacing.ts`, and `constants/radii.ts` mirror this file exactly. Do not hardcode values in components — always import from constants.

---

## Brand Identity

| Token | Value | Notes |
|---|---|---|
| Brand Name | **Veribee** | Always title-case |
| Tagline | *Verified. Trusted. Delivered.* | |
| Mascot | Bee icon (SVG, `assets/bee.svg`) | Used in Logo component |

---

## Color Palette

### Surface & Background

| Token | Hex | Usage |
|---|---|---|
| `surface` | `#fcf9f8` | Page background (warm cream) |
| `surfaceDim` | `#dcd9d9` | Dimmed overlay backgrounds |
| `surfaceBright` | `#fcf9f8` | Elevated surfaces (same as surface) |
| `surfaceContainerLowest` | `#ffffff` | Cards, inputs, sheets |
| `surfaceContainerLow` | `#f6f3f2` | Tonal card fills |
| `surfaceContainer` | `#f0eded` | Dividers, tonal areas |
| `surfaceContainerHigh` | `#eae7e7` | Pressed state fills |
| `surfaceContainerHighest` | `#e5e2e1` | Borders, chips |
| `background` | `#fcf9f8` | Root background (alias of surface) |
| `surfaceVariant` | `#e5e2e1` | Subtle dividers |

### On-Surface (Text & Icons)

| Token | Hex | Usage |
|---|---|---|
| `onSurface` | `#1c1b1b` | Primary text, headings |
| `onSurfaceVariant` | `#59413d` | Secondary text, metadata |
| `inverseSurface` | `#313030` | Modal scrims (at 60% opacity) |
| `inverseOnSurface` | `#f3f0ef` | Text on dark surfaces |
| `outline` | `#8d706c` | Input placeholders, icons |
| `outlineVariant` | `#e1bfb9` | Input borders, hairlines |
| `surfaceTint` | `#b02d21` | Tonal surface tint color |

### Primary — Heritage Red

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#9e2016` | Brand color, CTAs, active icons |
| `onPrimary` | `#ffffff` | Text/icons on primary |
| `primaryContainer` | `#c0392b` | Hero card backgrounds |
| `onPrimaryContainer` | `#ffe5e1` | Text on primaryContainer |
| `inversePrimary` | `#ffb4a9` | Links on dark backgrounds |
| `primaryFixed` | `#ffdad5` | Light tonal fills (avatars, chips) |
| `primaryFixedDim` | `#ffb4a9` | Slightly stronger tonal fills |
| `onPrimaryFixed` | `#410000` | Text on primaryFixed |
| `onPrimaryFixedVariant` | `#8e130c` | Secondary text on primaryFixed |

### Secondary — Honey Gold

| Token | Hex | Usage |
|---|---|---|
| `secondary` | `#735c00` | VSI score labels, gold accents |
| `onSecondary` | `#ffffff` | Text on secondary |
| `secondaryContainer` | `#fed65b` | Trusted/elite badge fills |
| `onSecondaryContainer` | `#745c00` | Text on secondaryContainer |
| `secondaryFixed` | `#ffe088` | Avatar ring, gold highlights |
| `secondaryFixedDim` | `#e9c349` | Slightly deeper gold |
| `onSecondaryFixed` | `#241a00` | Dark text on gold |
| `onSecondaryFixedVariant` | `#574500` | Muted text on gold |

### Tertiary — Sky Blue

| Token | Hex | Usage |
|---|---|---|
| `tertiary` | `#005875` | Links, informational states |
| `onTertiary` | `#ffffff` | Text on tertiary |
| `tertiaryContainer` | `#007296` | Info badge backgrounds |
| `onTertiaryContainer` | `#d3eeff` | Text on tertiaryContainer |
| `tertiaryFixed` | `#c0e8ff` | Light info fills |
| `tertiaryFixedDim` | `#80d0f8` | Medium info fills |
| `onTertiaryFixed` | `#001e2b` | Dark text on light info |
| `onTertiaryFixedVariant` | `#004d66` | Muted text on light info |

### Semantic

| Token | Hex | Usage |
|---|---|---|
| `error` | `#ba1a1a` | Error text, destructive actions |
| `onError` | `#ffffff` | Text on error |
| `errorContainer` | `#ffdad6` | Error banner background |
| `onErrorContainer` | `#93000a` | Text in error banners |

---

## Typography

All text should be sentence-case unless it is a brand name or acronym (e.g., VSI, PHP).

| Token | Family | Weight | Size | Line Height | Usage |
|---|---|---|---|---|---|
| `h1` | Epilogue | Bold 700 | 28px | 34px | Screen titles, hero names |
| `h2` | Epilogue | SemiBold 600 | 22px | 28px | Section headings |
| `h3` | Epilogue | SemiBold 600 | 18px | 24px | Card titles, screen sub-headers |
| `bodyLg` | Manrope | Regular 400 | 16px | 24px | Body copy, descriptions |
| `bodyMd` | Manrope | Regular 400 | 14px | 20px | Metadata, labels |
| `bodySm` | Manrope | Regular 400 | 12px | 16px | Captions, timestamps |
| `labelCaps` | Manrope | Bold 700 | 11px | 16px | Section headers, badge text |
| `labelMd` | Manrope | Medium 500 | 13px | 18px | Input labels, micro-copy |

### Font Families

| Alias | Font Name | Weights |
|---|---|---|
| `Fonts.epilogueBold` | Epilogue | Bold 700 |
| `Fonts.epilogueSemiBold` | Epilogue | SemiBold 600 |
| `Fonts.manropeBold` | Manrope | Bold 700 |
| `Fonts.manropeMedium` | Manrope | Medium 500 |
| `Fonts.manropeRegular` | Manrope | Regular 400 |

---

## Spacing

All spacing is in points (1pt ≈ 1dp on Android, 1pt on iOS).

| Token | Value | Usage |
|---|---|---|
| `Spacing.xs` | 2px | Icon gaps, micro padding |
| `Spacing.base` | 4px | Inner chip padding |
| `Spacing.sm` | 8px | Icon-to-label gaps |
| `Spacing.md` | 12px | Card padding, list item gaps |
| `Spacing.lg` | 16px | Section gaps, inner card padding |
| `Spacing.xl` | 24px | Section spacing |
| `Spacing.containerMargin` | 20px | Page horizontal margin |

---

## Shape (Border Radius)

| Token | Value | Usage |
|---|---|---|
| `Radii.sm` | 4px | Tiny chips, small badges |
| `Radii.DEFAULT` | 8px | Search bars, menu rows |
| `Radii.md` | 12px | Image thumbnails, inner cards |
| `Radii.lg` | 16px | Standard cards (legacy) |
| `Radii.input` | 14px | Input fields |
| `Radii.card` | 20px | Hero cards, primary surface cards |
| `Radii.xl` | 24px | Bottom sheets (top corners) |
| `Radii.full` | 9999px | Pills, avatars, FABs |

---

## Elevation (Shadow)

All shadows use Heritage Red tint for warmth.

| Token | Usage |
|---|---|
| `Shadow.card` | Standard cards, list items |
| `Shadow.fab` | FABs, hero bento cards |
| `Shadow.sheet` | Bottom sheets, floating cards |
| `Shadow.input` | Focused input fields |

### Shadow Values

```ts
Shadow.card   = { shadowColor: '#9e2016', offset: (0,4), opacity: 0.05, radius: 12, elevation: 2 }
Shadow.fab    = { shadowColor: '#9e2016', offset: (0,6), opacity: 0.18, radius: 16, elevation: 6 }
Shadow.sheet  = { shadowColor: '#1c1b1b', offset: (0,-4), opacity: 0.10, radius: 24, elevation: 16 }
Shadow.input  = { shadowColor: '#9e2016', offset: (0,0), opacity: 0.15, radius: 6, elevation: 2 }
```

---

## Component Patterns

### Buttons
- **Primary**: `backgroundColor: primary`, `borderRadius: Radii.full`, height 52px
- **Outlined**: transparent background, `borderColor: primary`, `borderWidth: 1.5`
- **Ghost**: no border, no background, label in `primary` color
- All labels: `fontFamily: Fonts.manropeBold, fontSize: 16`
- Use Reanimated spring animation on press (`scale: 0.96`)

### Inputs
- Height: 56px minimum
- `borderRadius: Radii.input` (14px)
- Default border: `outlineVariant`
- Focus: `borderColor: primary` + `Shadow.input`
- Label: sentence-case, `Fonts.manropeMedium`

### Cards
- `borderRadius: Radii.card` (20px)
- No border (shadow only)
- Background: `surfaceContainerLowest`
- Shadow: `Shadow.card`
- Exception: legacy 16px cards still use `Radii.lg`

### Bottom Sheets
- `borderTopLeftRadius: Radii.xl`, `borderTopRightRadius: Radii.xl`
- Background: `Colors.surface`
- Shadow: `Shadow.sheet`
- Scrim: `Colors.inverseSurface` at 60% opacity

### Badges
- `Radii.sm` (square corners)
- Verified: `secondaryContainer` / `onSecondaryContainer`
- Pending: `primaryFixed` / `primary`
- Rejected: `errorContainer` / `onErrorContainer`
- Elite: `secondaryContainer` with `verified` icon

### Tab Bars
- Buyer: Home · Orders · Profile (3 tabs — Search is inline on Home)
- Seller: Dashboard · Products · Orders · Account
- Rider: Job Feed · Active Job · Earnings · Account
- Active tint: `primary`
- Inactive tint: `onSurfaceVariant`

---

## Screen Groups

| Route Group | Role | Primary Color |
|---|---|---|
| `(auth)` | All | Heritage Red |
| `(buyer)/(tabs)` | Buyer | Heritage Red |
| `(seller)/(tabs)` | Seller | Heritage Red |
| `(rider)/(tabs)` | Rider | Heritage Red |

---

## Design Principles

1. **Warm, not cold** — Cream surfaces over pure white; red over blue.
2. **Verified trust** — Gold honey accents signal authenticity (VSI, badges).
3. **Legible hierarchy** — Epilogue for impact, Manrope for readability.
4. **Borderless elevation** — Cards use shadow, not borders.
5. **Sentence case** — All labels, buttons, tabs use sentence case.
6. **Rounded, not square** — `Radii.card` (20px) for primary surfaces.
