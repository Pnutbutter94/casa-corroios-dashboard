# Casa Corroios Dashboard — Multi-Section Design System
# Generated: 2026-06-17
#
# HOW TO USE:
# Each dashboard tab has its own design identity.
# Apply ONLY the rules for the tab you are working on.
# The SHARED FOUNDATION applies to ALL tabs.
# Cofre (:8091) uses its own section at the bottom.
#
# Section map:
#   HOME        → Linear (command center)
#   BLOCKBUSTER → Runwayml + Spotify (cinema experience)
#   VIAGENS     → Airbnb + Tesla (luxury travel)
#   SHOPPING    → Pinterest + Shopify (visual discovery)
#   COFRE       → Revolut + Stripe (personal CFO)


# ============================================================
# SHARED FOUNDATION — applies to ALL tabs
# Source: Linear (grid + spacing + type scale)
# ============================================================
---
version: alpha
name: Linear-design-analysis
description: "A near-black product-focused marketing canvas built around #010102 (the deepest dark surface of any tool in this collection), light gray text (#f7f8f8), and the signature Linear lavender-blue (#5e6ad2) used as the single chromatic accent. The system reads as software-craft documentation: dense, technical, and quietly luxurious. Display type is set in the Linear custom sans (SF Pro Display fallback) at 500–700 with measured negative tracking. Cards live as charcoal panels (#0f1011) with hairline borders. The accent lavender appears on the brand mark, focus rings, and a few intentional CTAs — never decoratively. Page rhythm leans on product UI screenshots framed in dark panels rather than atmospheric color."

colors:
  primary: "#5e6ad2"
  on-primary: "#ffffff"
  primary-hover: "#828fff"
  primary-focus: "#5e69d1"
  ink: "#f7f8f8"
  ink-muted: "#d0d6e0"
  ink-subtle: "#8a8f98"
  ink-tertiary: "#62666d"
  canvas: "#010102"
  surface-1: "#0f1011"
  surface-2: "#141516"
  surface-3: "#18191a"
  surface-4: "#191a1b"
  hairline: "#23252a"
  hairline-strong: "#34343a"
  hairline-tertiary: "#3e3e44"
  inverse-canvas: "#ffffff"
  inverse-surface-1: "#f5f6f6"
  inverse-surface-2: "#f6f7f7"
  inverse-ink: "#000000"
  brand-secure: "#7a7fad"
  semantic-success: "#27a644"
  semantic-overlay: "#000000"

typography:
  display-xl:
    fontFamily: Linear Display
    fontSize: 80px
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: -3.0px
  display-lg:
    fontFamily: Linear Display
    fontSize: 56px
    fontWeight: 600
    lineHeight: 1.10
    letterSpacing: -1.8px
  display-md:
    fontFamily: Linear Display
    fontSize: 40px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -1.0px
  headline:
    fontFamily: Linear Display
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.20
    letterSpacing: -0.6px
  card-title:
    fontFamily: Linear Display
    fontSize: 22px
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: -0.4px
  subhead:
    fontFamily: Linear Display
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.40
    letterSpacing: -0.2px
  body-lg:
    fontFamily: Linear Text
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: -0.1px
  body:
    fontFamily: Linear Text
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: -0.05px
  body-sm:
    fontFamily: Linear Text
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: 0
  caption:
    fontFamily: Linear Text
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.40
    letterSpacing: 0
  button:
    fontFamily: Linear Text
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.20
    letterSpacing: 0
  eyebrow:
    fontFamily: Linear Text
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.30
    letterSpacing: 0.4px
  mono:
    fontFamily: Linear Mono
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: 0

rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  xxl: 24px
  pill: 9999px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 96px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 8px 14px
  button-primary-pressed:
    backgroundColor: "{colors.primary-focus}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
  button-secondary:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 8px 14px
  button-tertiary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 8px 14px
  button-inverse:
    backgroundColor: "{colors.inverse-canvas}"
    textColor: "{colors.inverse-ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 8px 14px
  pricing-card:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 24px
  pricing-card-featured:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 24px
  feature-card:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 24px
  product-screenshot-card:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    padding: 24px
  testimonial-card:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.lg}"
    padding: 32px
  customer-logo-tile:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-subtle}"
    typography: "{typography.caption}"
    rounded: "{rounded.xs}"
    padding: 16px
  text-input:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 8px 12px
  text-input-focused:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 8px 12px
  pricing-tab-default:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-subtle}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: 6px 14px
  pricing-tab-selected:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: 6px 14px
  cta-banner:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.headline}"
    rounded: "{rounded.lg}"
    padding: 48px
  changelog-row:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.xs}"
    padding: 24px 0
  status-badge:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 2px 8px
  top-nav:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.xs}"
    height: 56px
  footer:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-subtle}"
    typography: "{typography.caption}"
    rounded: "{rounded.xs}"
    padding: 64px 32px
---

## Overview

Linear's marketing canvas is the deepest dark surface in this collection — `{colors.canvas}` is #010102, essentially pure black with a faint blue tint. On top sits a four-step surface ladder (`{colors.surface-1}` through `{colors.surface-4}`) for cards, panels, and lifted tiles, with hairline borders running from `{colors.hairline}` (#23252a) up through `{colors.hairline-strong}` and `{colors.hairline-tertiary}`. Light gray text (`{colors.ink}` #f7f8f8) carries the body and headlines.

The single chromatic accent is **Linear lavender-blue** `{colors.primary}` (#5e6ad2) — used on the brand mark, focus rings, and the primary CTA button. A lighter hover state (`{colors.primary-hover}` #828fff) and a focus-tinted variant (`{colors.primary-focus}` #5e69d1) extend the same hue. Linear avoids saturated greens, oranges, reds, etc. on the marketing canvas — the only semantic color is `{colors.semantic-success}` (#27a644) for status pills and the rare success indicator.

Display type runs Linear's custom sans (with `SF Pro Display` fallback) at weight 500–700 with negative letter-spacing scaling from -3.0px at 80px down to 0 at body. The body family is Linear's text cut, and a Linear Mono is reserved for code snippets in product screenshots.

The page rhythm is **dense product screenshots** — Linear's marketing leads with high-fidelity captures of the product UI (issue list, project view, dashboard) framed in `{colors.surface-1}` panels with `{rounded.xl}` 16px corners. The chrome is intentionally minimal so the app screenshots can do the heavy lifting.

**Key Characteristics:**
- **Dark-canvas marketing system** — `{colors.canvas}` (#010102) is the deepest dark in this collection.
- **Lavender-blue brand accent** (`{colors.primary}` #5e6ad2) — used scarcely on brand mark, focus, and the primary CTA.
- Four-step surface ladder (canvas → surface-1 → surface-2 → surface-3 → surface-4) carries hierarchy without shadow.
- Display tracking pulls aggressively negative (-3.0px at 80px); body holds at -0.05px.
- Cards use `{rounded.lg}` 12px corners with 1px hairline borders — never pill, rarely 16px.
- **Product UI screenshots** dominate the page. The marketing chrome is a dark frame for the app.
- No second chromatic color. No atmospheric gradients. No spotlight cards.

## Colors

> Source pages: linear.app (home), /intake, /pricing, /contact/sales, /build.

### Brand & Accent
- **Lavender-Blue** ({colors.primary}): The signature Linear accent — primary CTA, brand mark, link emphasis.
- **Lavender Hover** ({colors.primary-hover}): Lighter lavender (#828fff) — hovered state of the primary CTA.
- **Lavender Focus** ({colors.primary-focus}): Focus-ring tint (#5e69d1) — focused inputs, focused buttons.
- **Brand Secure** ({colors.brand-secure}): Muted lavender-gray (#7a7fad) — used in "Linear Security" surfaces.

### Surface
- **Canvas** ({colors.canvas}): Default page background — #010102, near-pure black with a faint blue tint.
- **Surface 1** ({colors.surface-1}): One step above canvas — feature cards, pricing cards, product screenshot panels.
- **Surface 2** ({colors.surface-2}): Two steps above — featured pricing card, hovered cards.
- **Surface 3** ({colors.surface-3}): Three steps above — line-tertiary backgrounds, sub-nav.
- **Surface 4** ({colors.surface-4}): Four steps above — bg-level-3, deepest lifted surface.
- **Hairline** ({colors.hairline}): 1px borders on cards and dividers.
- **Hairline Strong** ({colors.hairline-strong}): Stronger 1px borders — input focus rings.
- **Hairline Tertiary** ({colors.hairline-tertiary}): Tertiary borders for nested surfaces.
- **Inverse Canvas** ({colors.inverse-canvas}): Pure white — surface of the inverse pill CTA on a small set of section openers.
- **Inverse Surface 1** ({colors.inverse-surface-1}): One step above inverse canvas.
- **Inverse Surface 2** ({colors.inverse-surface-2}): Two steps above inverse canvas.

### Text
- **Ink** ({colors.ink}): All headlines and emphasized body type — light gray #f7f8f8.
- **Ink Muted** ({colors.ink-muted}): Secondary type at #d0d6e0 — meta info on hero panels.
- **Ink Subtle** ({colors.ink-subtle}): Tertiary type at #8a8f98 — deselected pricing tabs, footer columns.
- **Ink Tertiary** ({colors.ink-tertiary}): Quaternary at #62666d — disabled, footnotes.

### Semantic
- **Success Green** ({colors.semantic-success}): Status pills, success indicators. The only semantic color on marketing.
- **Overlay** ({colors.semantic-overlay}): Pure black overlay scrim for modals.

## Typography

### Font Family

- **Linear Display** — Linear's custom display sans; fallback `SF Pro Display, -apple-system, system-ui, Segoe UI, Roboto`. Carries display-xl through subhead.
- **Linear Text** — Linear's custom text sans (a slightly different cut tuned for body sizes); same fallback stack. Carries body sizes, button labels, captions.
- **Linear Mono** — Linear's custom mono; fallback `ui-monospace, SF Mono, Menlo`. Used for code snippets in product screenshots and for status / ID tokens.

The marketing surface treats Display and Text as one continuous voice; the family change is silent.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.display-xl}` | 80px | 600 | 1.05 | -3.0px | Largest hero headline |
| `{typography.display-lg}` | 56px | 600 | 1.10 | -1.8px | Section opener headlines |
| `{typography.display-md}` | 40px | 600 | 1.15 | -1.0px | Sub-section headlines |
| `{typography.headline}` | 28px | 600 | 1.20 | -0.6px | Pricing tier titles, CTA banner heading |
| `{typography.card-title}` | 22px | 500 | 1.25 | -0.4px | Feature card title |
| `{typography.subhead}` | 20px | 400 | 1.40 | -0.2px | Lead body, intro paragraphs |
| `{typography.body-lg}` | 18px | 400 | 1.50 | -0.1px | Hero subhead, lead paragraphs |
| `{typography.body}` | 16px | 400 | 1.50 | -0.05px | Default body |
| `{typography.body-sm}` | 14px | 400 | 1.50 | 0 | Card body, footer columns |
| `{typography.caption}` | 12px | 400 | 1.40 | 0 | Captions, meta, status |
| `{typography.button}` | 14px | 500 | 1.20 | 0 | All button labels |
| `{typography.eyebrow}` | 13px | 500 | 1.30 | 0.4px | Section eyebrow (slight positive tracking) |
| `{typography.mono}` | 13px | 400 | 1.50 | 0 | Linear Mono for code in product screenshots |

### Principles

- **Aggressive negative tracking on display** (-3.0px at 80px ≈ 4% of size).
- **Single voice from display to body.** Display-xl at 600 → body at 400 — same family, narrower weights.
- **Eyebrow uses positive tracking** (+0.4px) — contrast against the negative-tracked display marks the eyebrow as taxonomy.
- **Mono only in code contexts.** Linear Mono lives inside product screenshots — not on marketing chrome.

### Note on Font Substitutes

Linear's custom typeface isn't publicly distributed; the documented fallback `SF Pro Display, -apple-system, system-ui` is the recommended substitute on macOS. For cross-platform implementation, **Inter** at weight 500 / 600 / 700 is the closest free substitute. **Geist Sans** is also viable. For mono, **JetBrains Mono** or **Geist Mono** at weight 400 closely approximates Linear Mono.

## Layout

### Spacing System

- **Base unit**: 4px.
- **Tokens (front matter)**: `{spacing.xxs}` 4px · `{spacing.xs}` 8px · `{spacing.sm}` 12px · `{spacing.md}` 16px · `{spacing.lg}` 24px · `{spacing.xl}` 32px · `{spacing.xxl}` 48px · `{spacing.section}` 96px.
- Card interior padding: `{spacing.lg}` 24px on feature/pricing cards; `{spacing.xl}` 32px on testimonial cards; `{spacing.xxl}` 48px on CTA banners.
- Pill button padding: 8px vertical · 14px horizontal — Linear's compact button spec.
- Form input padding: 8px vertical · 12px horizontal.

### Grid & Container

- Max content width sits around 1280px.
- Card grids are 3-up at desktop, 2-up at tablet, 1-up at mobile.
- Pricing tier grid is 3-up; comparison strip below shows checkmarks per tier.
- Product screenshot panels span full content width — they're the protagonist.

### Whitespace Philosophy

The dark canvas IS the whitespace. Sections separate by lift onto surface-1 panels, not by gaps in white. Within a panel, generous `{spacing.lg}` 24px gaps between content blocks; `{spacing.section}` 96px between sections.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| 0 (flat) | No shadow, no border | Default for body type, hero text, footer |
| 1 (charcoal lift) | `{colors.surface-1}` background on canvas, 1px `{colors.hairline}` | Default cards, product panels |
| 2 (surface-2 lift) | `{colors.surface-2}` background, 1px `{colors.hairline-strong}` | Featured pricing card, hovered cards |
| 3 (surface-3 lift) | `{colors.surface-3}` background | Sub-nav, dropdown menus |
| 4 (focus ring) | 2px `{colors.primary-focus}` outline at 50% opacity | Focused input, focused button |

Linear's depth is carried by surface ladder + hairline borders. The brand resists drop shadows on dark almost entirely.

### Decorative Depth

- **Product UI screenshots** dominate as decorative depth.
- **No atmospheric gradients, no spotlight cards.**
- **Subtle white edge highlight** on the top edge of lifted panels — gives the dark surface a faint "pixel rendered" feel.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.xs}` | 4px | Small chips, status badges |
| `{rounded.sm}` | 6px | Inline tags |
| `{rounded.md}` | 8px | All buttons, form inputs |
| `{rounded.lg}` | 12px | Pricing cards, feature cards, testimonial cards |
| `{rounded.xl}` | 16px | Product screenshot panels |
| `{rounded.xxl}` | 24px | Oversized CTA banners (rare) |
| `{rounded.pill}` | 9999px | Pricing tab toggles, status pills |
| `{rounded.full}` | 9999px | Avatar circles |

### Photography & Illustration Geometry

- Product UI screenshots dominate; they sit in `{rounded.xl}` 16px tiles with `{spacing.lg}` 24px outer padding.
- Customer logo tiles render at small sizes (~24px logo height) on `{colors.canvas}` with no border.
- Avatar circles in testimonial cards use `{rounded.full}` at 32–40px sizes.

## Components

### Buttons

**`button-primary`** — Lavender CTA. The default primary CTA across all pages.
- Background `{colors.primary}`, text `{colors.on-primary}`, type `{typography.button}`, padding 8px 14px, rounded `{rounded.md}`.
- Pressed state lives in `button-primary-pressed` (background shifts to `{colors.primary-focus}`).
- Hover state lives in `button-primary-hover` (background shifts to `{colors.primary-hover}` lighter lavender).

**`button-secondary`** — Charcoal button. Used for secondary CTAs ("Sign in", "Read changelog").
- Background `{colors.surface-1}`, text `{colors.ink}`, type `{typography.button}`, padding 8px 14px, rounded `{rounded.md}`. 1px `{colors.hairline}` border.

**`button-tertiary`** — Plain text button.
- Background `{colors.canvas}`, text `{colors.ink}`, type `{typography.button}`, rounded `{rounded.md}`, padding 8px 14px.

**`button-inverse`** — White-on-dark inverse CTA.
- Background `{colors.inverse-canvas}`, text `{colors.inverse-ink}`, type `{typography.button}`, rounded `{rounded.md}`, padding 8px 14px.

### Pricing Tabs

**`pricing-tab-default`** + **`pricing-tab-selected`** — Pill-toggle on `/pricing`.
- Default: `{colors.canvas}` background, `{colors.ink-subtle}` text, rounded `{rounded.pill}`, padding 6px 14px.
- Selected: `{colors.surface-2}` background, `{colors.ink}` text — selected = surface lift.

### Cards & Containers

**`pricing-card`** — Each tier on `/pricing`.
- Background `{colors.surface-1}`, text `{colors.ink}`, type `{typography.body}`, rounded `{rounded.lg}`, padding 24px. 1px `{colors.hairline}` border.

**`pricing-card-featured`** — Recommended tier — surface lift to surface-2.
- Background `{colors.surface-2}`, otherwise identical structure.

**`feature-card`** — Generic feature highlight tile.
- Background `{colors.surface-1}`, text `{colors.ink}`, type `{typography.body}`, rounded `{rounded.lg}`, padding 24px.

**`product-screenshot-card`** — The dominant card type — frames a high-fidelity Linear app UI screenshot.
- Background `{colors.surface-1}`, text `{colors.ink}`, type `{typography.body}`, rounded `{rounded.xl}`, padding 24px.

**`testimonial-card`** — Customer quote with avatar + name + role.
- Background `{colors.surface-1}`, text `{colors.ink}`, type `{typography.body-lg}`, rounded `{rounded.lg}`, padding 32px.

**`customer-logo-tile`** — Small tile in the customer marquee.
- Background `{colors.canvas}`, text `{colors.ink-subtle}`, type `{typography.caption}`, rounded `{rounded.xs}`, padding 16px.

**`cta-banner`** — Closing CTA panel near page bottom.
- Background `{colors.surface-1}`, text `{colors.ink}`, type `{typography.headline}`, rounded `{rounded.lg}`, padding 48px.

### Inputs & Forms

**`text-input`** + **`text-input-focused`** — Form fields on `/contact/sales` and signup overlays.
- Background `{colors.surface-1}`, text `{colors.ink}`, type `{typography.body}`, rounded `{rounded.md}`, padding 8px 12px.
- Focused state retains the same surface; the focus ring is a 2px `{colors.primary-focus}` outline at 50% opacity.

### Status & Build Page

**`changelog-row`** — Each row in `/build` (changelog page) listing version, date, and changes.
- Background `{colors.canvas}`, text `{colors.ink}`, type `{typography.body}`, rounded `{rounded.xs}`, padding 24px 0. 1px `{colors.hairline}` bottom rule.

**`status-badge`** — Small status pill.
- Background `{colors.surface-2}`, text `{colors.ink-muted}`, type `{typography.caption}`, rounded `{rounded.pill}`, padding 2px 8px.

### Navigation

**`top-nav`** — Sticky dark bar with the Linear wordmark left, primary nav links centered, and a `button-secondary` ("Sign in") + `button-primary` ("Get started") pair right.
- Background `{colors.canvas}`, text `{colors.ink}`, type `{typography.body-sm}`, height 56px.

### Footer

**`footer`** — Dense link grid on `{colors.canvas}` with the Linear wordmark left.
- Background `{colors.canvas}`, text `{colors.ink-subtle}`, type `{typography.caption}`, padding 64px 32px.

## Do's and Don'ts

### Do

- Reserve `{colors.canvas}` (#010102) as the system's anchor surface — the faint blue tint is intentional.
- Use `{colors.primary}` lavender ONLY for: brand mark, primary CTA, focus ring, link emphasis.
- Use the four-step surface ladder for hierarchy. Avoid skipping levels.
- Pair display weight 600 with body weight 400 — Linear resists 700+ display weights.
- Apply negative letter-spacing aggressively on display.
- Use product UI screenshots as the protagonist of every section.
- Compose CTAs as `{rounded.md}` 8px corners.

### Don't

- Don't ship a light-mode marketing page.
- Don't use lavender as a section background or card fill.
- Don't introduce a second chromatic accent (orange, pink, green for marketing).
- Don't add atmospheric gradients or spotlight cards.
- Don't pill-round CTAs.
- Don't use `#000000` true black as the canvas.
- Don't combine multiple bright accents in product screenshot mockups.

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Desktop-XL | 1440px | Default desktop layout |
| Desktop | 1280px | Card grid 3-up maintained |
| Tablet | 1024px | Card grid 3-up → 2-up |
| Mobile-Lg | 768px | Pricing comparison becomes accordion; nav hamburger |
| Mobile | 480px | Single-column; display-xl scales 80px → ~36px |

### Touch Targets

- CTAs hold ≥40px tap height across viewports.
- Pricing tab pills hold ≥36px tap height; touch viewports grow to ≥44px.
- Form inputs hold ≥44px tap target on touch.

### Collapsing Strategy

- **Top nav**: links collapse to hamburger below 768px.
- **Card grids**: 3-up → 2-up at 1024px → 1-up below 768px.
- **Pricing comparison**: per-tier accordion below 768px.
- **Display type**: `{typography.display-xl}` 80px scales toward `{typography.display-md}` 40px on mobile.

### Image Behavior

- Product UI screenshots maintain aspect ratio and never crop.
- Customer logos in the marquee may collapse from 6-up to 3-up below 768px.

## Iteration Guide

1. Focus on ONE component at a time and reference it by its `components:` token name.
2. When introducing a section, decide first which surface lift it lives on.
3. Default body to `{typography.body}` at weight 400.
4. Run `npx @google/design.md lint DESIGN.md` after edits.
5. Add new variants as separate component entries.
6. Treat lavender as scarce: brand mark, primary CTA, focus, link emphasis.
7. Lead every section with a product UI screenshot.

## Known Gaps

- The four-step surface ladder values are extracted directly from Linear's `--color-bg-level-3`, `--color-line-tint`, etc. CSS variables; they are Linear's canonical surface spec.
- Form-field error and validation styling is not visible on the inspected pages.
- Light mode is not documented because the marketing site does not ship a light theme.
- Linear's actual product UI uses a richer color-tag palette (red, orange, yellow, green, blue, purple) for issue priorities and project labels — those colors live in the in-product surfaces shown in mockups.
- The custom display, text, and mono families are proprietary; an open-source substitute is acceptable.

# ============================================================
# TAB: HOME — Command center overview
# Primary: Linear already included in SHARED FOUNDATION
# Accent: Notion (warm serif labels, soft surfaces for widgets)
# ============================================================
---
version: alpha
name: Notion Analysis
description: An analysis of Notion's design language — a warm, paper-calm productivity system built on an off-white canvas, near-black Inter type, and a single confident blue, punctuated by a playful multi-color sticker palette that does all the personality work while the chrome stays quiet.

colors:
  primary: "#0075de"
  primary-active: "#005bab"
  secondary: "#213183"
  on-primary: "#ffffff"
  canvas: "#ffffff"
  canvas-soft: "#f6f5f4"
  surface: "#ffffff"
  ink: "#000000"
  ink-secondary: "#31302e"
  ink-muted: "#615d59"
  ink-faint: "#a39e98"
  hairline: "#e6e6e6"
  accent-sky: "#62aef0"
  accent-purple: "#d6b6f6"
  accent-purple-deep: "#391c57"
  accent-pink: "#ff64c8"
  accent-orange: "#dd5b00"
  accent-orange-deep: "#793400"
  accent-teal: "#2a9d99"
  accent-green: "#1aae39"
  accent-brown: "#523410"

typography:
  display-1:
    fontFamily: NotionInter
    fontSize: 64px
    fontWeight: 700
    lineHeight: 1.0
    letterSpacing: -2.125px
  display-2:
    fontFamily: NotionInter
    fontSize: 54px
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: -1.875px
  heading-1:
    fontFamily: NotionInter
    fontSize: 40px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -1px
  heading-2:
    fontFamily: NotionInter
    fontSize: 26px
    fontWeight: 700
    lineHeight: 1.23
    letterSpacing: -0.625px
  heading-3:
    fontFamily: NotionInter
    fontSize: 22px
    fontWeight: 700
    lineHeight: 1.27
    letterSpacing: -0.25px
  title:
    fontFamily: NotionInter
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: -0.125px
  body-md:
    fontFamily: NotionInter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  body-sm:
    fontFamily: NotionInter
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.33
    letterSpacing: 0
  button:
    fontFamily: NotionInter
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: 0
  caption:
    fontFamily: NotionInter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.43
    letterSpacing: 0
  eyebrow:
    fontFamily: NotionInter
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.33
    letterSpacing: 0.125px

rounded:
  xs: 4px
  sm: 5px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 28px
  xxl: 32px

components:
  nav-bar:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    padding: 16px
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
  button-primary-pressed:
    backgroundColor: "{colors.primary-active}"
    textColor: "{colors.on-primary}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
  button-utility:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 4px 14px
  button-icon-circular:
    backgroundColor: "rgba(0, 0, 0, 0.05)"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.full}"
  badge-pill:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.eyebrow}"
    rounded: "{rounded.full}"
    padding: 4px 8px
  feature-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 24px
  feature-card-elevated:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: 24px
  pricing-plan-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 24px
  pricing-plan-card-featured:
    backgroundColor: "{colors.canvas-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: 24px
  text-input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.xs}"
    padding: 6px
  hero-band:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.display-1}"
    padding: 32px
  footer:
    backgroundColor: "{colors.canvas-soft}"
    textColor: "{colors.ink-secondary}"
    typography: "{typography.caption}"
    padding: 32px

  # ─── Examples (illustrative) — auto-derived; resolve any TO_FILL markers below ───
  ex-pricing-tier:
    description: "Default Pricing tier card. Re-uses feature-card chrome with brand canvas-soft surface."
    backgroundColor: "{colors.canvas-soft}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
  ex-pricing-tier-featured:
    description: "Featured/highlighted tier — polarity-flipped surface (dark fill + light text in light mode, light fill + dark text in dark mode)."
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
  ex-product-selector:
    description: "What's Included summary card — re-purposed for SaaS / B2B verticals (NOT a literal product gallery)."
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
  ex-cart-drawer:
    description: "Subscription summary — re-purposed for SaaS / B2B (line items per add-on, not literal cart)."
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
    item-divider: "{colors.hairline}"
  ex-app-shell-row:
    description: "Sidebar nav row inside the App Shell example. Active state uses brand primary as the indicator."
    backgroundColor: "{colors.canvas}"
    activeIndicator: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: "{spacing.sm} {spacing.md}"
  ex-data-table-cell:
    description: "Default data-table th + td chrome. Header uses mono-caps eyebrow typography; body uses body-sm."
    headerBackground: "{colors.canvas-soft}"
    headerTypography: "{typography.eyebrow}"
    bodyTypography: "{typography.body-sm}"
    cellPadding: "{spacing.sm} {spacing.md}"
    rowBorder: "{colors.hairline}"
  ex-auth-form-card:
    description: "Sign-in / sign-up card. Re-uses feature-card chrome with text-input primitives inside."
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
  ex-modal-card:
    description: "Modal dialog surface — same chrome as feature-card with elevated shadow."
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
  ex-empty-state-card:
    description: "Empty-state illustration frame."
    backgroundColor: "{colors.canvas-soft}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xxl}"
    captionTypography: "{typography.body-md}"
  ex-toast:
    description: "Toast notification surface — feature-card shape + medium shadow."
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "{spacing.sm} {spacing.md}"
    typography: "{typography.body-sm}"

---


## Overview

Notion looks like a well-organized desk in good daylight. The dominant surface is not pure white but a warm, paper-soft off-white — `{colors.canvas-soft}` (#f6f5f4) — that takes the clinical edge off the screen and makes long pages feel like a document rather than an app. Type is set in `NotionInter` (a tuned Inter) in near-black `{colors.ink}` at large, tightly-tracked weights, so headlines read as confident statements with very little letter-spacing slack at display sizes (`{typography.display-1}` pulls −2.125px of tracking at 64px). The whole system whispers in greys and blacks, then says exactly one thing in colour: a single, dependable blue, `{colors.primary}` (#0075de), reserved almost entirely for the primary call-to-action and inline links.

Against that quiet chrome, Notion lets a **playful multi-colour sticker palette** carry all of the brand's personality — purple, pink, orange, teal, green and sky-blue appear as small illustrated blocks, app-icon stickers, and category dots scattered through the marketing pages. These colours never structure the layout or paint a CTA; they decorate. The discipline is deliberate: the interface stays monochrome-plus-blue so the content (and the cheerful illustrations) can breathe. The one exception to the bright daylight is the homepage hero, which inverts into a deep indigo "night" band (`{colors.secondary}`) with white type and glowing sticker constellations — a single dark island in an otherwise light document.

Surfaces are defined by hairlines and the faintest layered shadows rather than heavy elevation. Cards round at a friendly 12px (`{rounded.lg}`), the marketing CTAs are fully-pill-shaped (`{rounded.full}`), and utility buttons round at a tighter 8px (`{rounded.md}`). Nothing is loud; the brand's character comes from restraint plus one well-placed splash of joy.

**Key Characteristics:**
- Warm paper-soft canvas `{colors.canvas-soft}` over pure white, never clinical
- Near-black `{colors.ink}` `NotionInter` type with tight negative tracking at display sizes (`{typography.display-1}`)
- Exactly one structural accent — Notion blue `{colors.primary}` — reserved for CTAs and links
- A decorative-only multi-colour sticker palette (`{colors.accent-purple}`, `{colors.accent-pink}`, `{colors.accent-orange}`, `{colors.accent-teal}`, `{colors.accent-green}`, `{colors.accent-sky}`) that adds personality without ever painting structure
- Pill-shaped marketing CTAs (`{rounded.full}`) contrasted with 8px utility buttons (`{rounded.md}`)
- Elevation by hairline + barely-there layered shadow, not heavy drop-shadows
- A single dark indigo hero "night" band (`{colors.secondary}`) inverting the otherwise daylight page rhythm

## Colors

> Source pages analysed: the Notion home page plus Pricing, Enterprise, Product (AI), Product (Agents), and Startups. Every secondary page resolved to the same core palette — Notion runs one tightly-scoped system across the marketing site.

### Brand & Accent
- **Notion Blue** (`{colors.primary}` — #0075de): the single structural accent. Primary CTA fill ("Get Notion free"), inline link colour, active-tab and focus signal. This is the only colour that ever paints an action.
- **Pressed Blue** (`{colors.primary-active}` — #005bab): the darker press state of the primary CTA.
- **Deep Indigo** (`{colors.secondary}` — #213183): the dark hero "night" band background and its sticker-constellation field; a deep brand-blue used for full-bleed inverted sections.

The remaining colours form Notion's **decorative sticker palette** — they appear only as illustrated blocks, app stickers and category dots, never as CTAs or structural fills:
- **Sticker Sky** (`{colors.accent-sky}` — #62aef0)
- **Sticker Purple** (`{colors.accent-purple}` — #d6b6f6) / **Deep Purple** (`{colors.accent-purple-deep}` — #391c57)
- **Sticker Pink** (`{colors.accent-pink}` — #ff64c8)
- **Sticker Orange** (`{colors.accent-orange}` — #dd5b00) / **Deep Orange** (`{colors.accent-orange-deep}` — #793400)
- **Sticker Teal** (`{colors.accent-teal}` — #2a9d99)
- **Sticker Green** (`{colors.accent-green}` — #1aae39)
- **Sticker Brown** (`{colors.accent-brown}` — #523410)

### Surface
- **White** (`{colors.canvas}` / `{colors.surface}` — #ffffff): card and panel surfaces, nav bar, form fields.
- **Warm Paper** (`{colors.canvas-soft}` — #f6f5f4): the signature page canvas and the footer band — a warm off-white that gives the whole site its document-like calm.
- **Hairline** (`{colors.hairline}` — #e6e6e6): 1px card borders and dividers, a black-at-10%-on-white blend kept solid for token reuse.

### Text
- **Ink** (`{colors.ink}` — #000000): primary headings and body text (rendered at ~95% alpha for a soft true-black).
- **Warm Charcoal** (`{colors.ink-secondary}` — #31302e): secondary body copy and footer text.
- **Stone** (`{colors.ink-muted}` — #615d59): supporting / muted copy.
- **Ash** (`{colors.ink-faint}` — #a39e98): captions, metadata, placeholder text.

### Semantic
Notion's marketing surfaces do not expose a dedicated error/success palette in the system chrome — status is carried by the sticker palette (e.g. `{colors.accent-green}` for affirmative ticks) rather than a separate semantic ramp.

## Typography

### Font Family
The entire system is set in **`NotionInter`** — Notion's tuned cut of Inter — with a fallback stack of `Inter, -apple-system, system-ui, "Segoe UI", Helvetica, Arial`. A single family carries everything from 64px display headlines to 12px eyebrows; there is no serif, no monospace display face. OpenType `lnum` (lining numerals) and `locl` features are enabled on body and heading roles.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.display-1}` | 64px | 700 | 1.0 | −2.125px | Hero headline ("Meet the night shift") |
| `{typography.display-2}` | 54px | 700 | 1.04 | −1.875px | Large section headlines |
| `{typography.heading-1}` | 40px | 700 | 1.1 | −1px | Section headlines ("Plans and features") |
| `{typography.heading-2}` | 26px | 700 | 1.23 | −0.625px | Sub-section headings |
| `{typography.heading-3}` | 22px | 700 | 1.27 | −0.25px | Card titles |
| `{typography.title}` | 20px | 600 | 1.4 | −0.125px | Feature titles, callouts |
| `{typography.body-md}` | 16px | 400 | 1.5 | 0 | Default body copy |
| `{typography.body-sm}` | 15px | 400 | 1.33 | 0 | Dense body, table rows, nav |
| `{typography.button}` | 16px | 500 | 1.5 | 0 | Button labels |
| `{typography.caption}` | 14px | 400 | 1.43 | 0 | Captions, footnotes |
| `{typography.eyebrow}` | 12px | 600 | 1.33 | +0.125px | Pill badges, small labels |

### Principles
Notion's type voice is **tight, heavy, and quiet-confident**. Headlines lean on weight 700 and aggressive negative tracking (more negative the larger the size) so display copy feels set, not stretched. Body copy stays at a comfortable 1.5 line-height for document readability. The contrast between a heavy 700 headline and a calm 400 body is the primary expressive lever — there is no decorative typography, only a clear hierarchy.

### Note on Font Substitutes
`NotionInter` is a proprietary tuning of the open-source **Inter** family — substitute Inter directly. To approximate Notion's display tightness, apply the negative letter-spacing values in the table above explicitly (Inter at default tracking will read looser than `NotionInter`).

## Layout

### Spacing System
- **Base unit**: 8px.
- **Tokens (front matter)**: `{spacing.xxs}` 4px · `{spacing.xs}` 8px · `{spacing.sm}` 12px · `{spacing.md}` 16px · `{spacing.lg}` 24px · `{spacing.xl}` 28px · `{spacing.xxl}` 32px.
- Card interior padding lands around `{spacing.lg}` (24px); utility buttons use a tight 4px/14px; form fields pad at `{spacing.xxs}`-scale 6px. Section gaps stack the larger steps.

### Grid & Container
Content is centred in a wide max-width column (~1080–1300px on desktop per the extracted breakpoints) with generous outer gutters. Feature sections alternate between full-width text blocks and 2-up / 3-up card grids; the pricing page widens to a 4-column plan table. The dark hero spans full-bleed edge to edge while body sections respect the centred container.

### Whitespace Philosophy
Whitespace is the primary grouping device. Sections are separated by large vertical gaps rather than rules, and cards sit on the warm canvas with quiet hairlines instead of heavy frames. The effect is document-like: airy, scannable, and never crowded.

### Responsive Strategy

#### Breakpoints
| Name | Width | Key Changes |
|---|---|---|
| Wide | 1440px+ | Full multi-column grids, widest container |
| Desktop | 1080–1300px | Standard centred container, 3-up card grids |
| Tablet | 768–840px | Grids collapse to 2-up, nav begins condensing |
| Mobile | ≤600px | Single-column stacks, hamburger nav, full-width CTAs |

#### Touch Targets
Pill CTAs (`button-primary`, `button-secondary`) and utility buttons (`button-utility`) carry comfortable tap padding; aim for a 44×44px minimum hit area on mobile by preserving vertical padding even as labels shrink.

#### Collapsing Strategy
The top nav condenses to a hamburger below the tablet breakpoint; multi-column card grids collapse to a single stacked column; the pricing plan table reflows from 4 side-by-side columns into stacked plan cards. Section padding tightens but the warm-canvas rhythm is preserved.

#### Image Behavior
Product screenshots and illustration tiles sit inside rounded `{rounded.lg}` frames and scale fluidly within their grid cell. Sticker illustrations are small fixed-scale decorative assets that re-flow but do not crop.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| 0 — Flat | Hairline border `{colors.hairline}`, no shadow | Default cards on the warm canvas |
| 1 — Soft | Layered micro-shadow: `rgba(0,0,0,0.01) 0 0.175px 1.041px`, `0.02 0 0.8px 2.925px`, `0.027 0 2.025px 7.847px`, `0.04 0 4px 18px` | Raised feature cards, floating buttons |
| 2 — Elevated | Deeper 5-stop stack ending in `rgba(0,0,0,0.05) 0 23px 52px` | Modals, popovers, the elevated white pill on the dark hero |

Notion's elevation philosophy is **barely-there**: shadows are built from many near-transparent layers so surfaces feel gently lifted off the paper rather than dramatically dropped. Most cards rely on a hairline alone.

### Decorative Depth
The brand's real depth cue is **illustration**, not shadow. The dark indigo hero (`{colors.secondary}`) uses glowing sticker stickers and a starfield to create a sense of a lit night scene, and feature sections layer small colourful app-icon stickers over plain surfaces to add playful dimensionality. Colour-blocked illustration tiles (purple, pink, orange, teal headers on otherwise-white cards) provide visual rhythm.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.xs}` | 4px | Form fields, small tags, inline chips |
| `{rounded.sm}` | 5px | Menu items, list rows, status pills |
| `{rounded.md}` | 8px | Utility / nav buttons, smaller cards |
| `{rounded.lg}` | 12px | Feature cards, illustration frames, content tiles |
| `{rounded.xl}` | 16px | Large containers, image wells |
| `{rounded.full}` | 9999px | Marketing pill CTAs, badges, circular icon buttons |

### Photography Geometry
Product screenshots are framed in rounded `{rounded.lg}` / `{rounded.xl}` wells, typically full-bleed within their container with a hairline edge. Illustration tiles use colour-blocked header bands above white card bodies. Avatars and app-icon stickers are small, sometimes fully circular (`{rounded.full}`). There is no heavy art-direction crop — images scale within their rounded frame.

## Components

> **No hover states documented.** Every spec below documents Default and Active/Pressed states only. Variants live as separate `components:` front-matter entries and are described in their own sub-blocks.

### Navigation

**`nav-bar`** — Top navigation
- White surface `{colors.canvas}`, `{colors.ink}` link text at `{typography.body-sm}`, padding `{spacing.md}`. Sits as a slim sticky bar; left wordmark, centre product/solutions menu links, right "Log in" text link plus a `button-utility` "Get Notion free" CTA. Condenses to a hamburger below the tablet breakpoint.

### Buttons

**`button-primary`** — Primary CTA ("Get Notion free")
- Background `{colors.primary}`, text `{colors.on-primary}`, type `{typography.button}`, fully pill-shaped `{rounded.full}`. The single blue action on any page.
- Pressed state lives in `button-primary-pressed` (background `{colors.primary-active}`); marketing buttons also apply a brief `scale(0.9)` press transform.

**`button-primary-pressed`**
- Background `{colors.primary-active}`, text `{colors.on-primary}` — the depressed state of the primary CTA.

**`button-secondary`** — Secondary CTA ("Request a demo")
- White surface `{colors.surface}`, text `{colors.ink}`, type `{typography.button}`, pill `{rounded.full}`, carried by the soft Level-1 shadow. Pairs beside `button-primary` in the hero.

**`button-utility`** — Nav / plan-select button
- White surface `{colors.surface}`, text `{colors.ink}`, type `{typography.button}`, tighter `{rounded.md}` (8px), padding `4px 14px`, 1px `{colors.hairline}` border. Used for the nav CTA and pricing plan-select buttons where the marketing pill would be too large.

**`button-icon-circular`** — Carousel / media control
- Circular `{rounded.full}` control with a translucent `rgba(0,0,0,0.05)` fill and `{colors.on-primary}` glyph, used for slide and play/pause controls; applies a `scale(0.9)` press transform.

### Cards & Containers

**`feature-card`** — Content / feature card
- White surface `{colors.surface}`, `{colors.ink}` text, `{typography.body-md}`, rounded `{rounded.lg}` (12px), padding `{spacing.lg}` (24px). The workhorse marketing card; often topped by a colour-blocked illustration band from the sticker palette. Default elevation is flat (hairline only).

**`feature-card-elevated`** — Raised feature card
- Same chrome as `feature-card` with the soft Level-1 layered shadow for cards that float above the canvas (testimonials, floating product panels).

**`pricing-plan-card`** — Pricing plan column
- White surface `{colors.surface}`, `{colors.ink}` text, `{typography.body-sm}`, rounded `{rounded.md}` (8px), padding `{spacing.lg}`. A bordered column listing a plan's price and feature checklist, with a `button-utility` select action.

**`pricing-plan-card-featured`** — Highlighted plan column
- Warm `{colors.canvas-soft}` fill to lift the recommended tier off the white siblings, same `{rounded.md}` shape and padding. Distinguished by surface tint rather than a coloured border.

### Inputs & Forms

**`text-input`** — Text / number field
- White surface `{colors.surface}`, `{colors.ink}` text, `{typography.body-sm}`, 1px `rgb(221,221,221)` border, rounded `{rounded.xs}` (4px), padding `6px`. Square-ish corners deliberately tighter than the pill CTAs. Focus adds the soft Level-1 shadow.

### Signature Components

**`hero-band`** — Dark "night" hero
- Full-bleed deep indigo `{colors.secondary}` band carrying `{typography.display-1}` white headline, sticker-constellation field, and a `button-primary` + `button-secondary` CTA pair. The single inverted dark island in an otherwise daylight page.

**`badge-pill`** — Eyebrow / category pill
- White surface `{colors.surface}`, `{colors.primary}` text, `{typography.eyebrow}` (12px / 600), fully pill `{rounded.full}`, padding `4px 8px`. Small labels such as the pricing "Essential for staying organized" eyebrow and category tags.

**`footer`** — Site footer
- Warm `{colors.canvas-soft}` band, `{colors.ink-secondary}` link text at `{typography.caption}`, padding `{spacing.xxl}`. Multi-column link directory closing every page.

### Examples (illustrative)

> Kit-mirror demonstration surfaces. Each `ex-*` entry references brand-native primitives so downstream consumers (`/preview-design`, `/generate-kit`) re-skin the same 10 surfaces consistently.

**`ex-pricing-tier`** — Default Pricing tier card. Re-uses feature-card chrome with brand canvas-soft surface.
- Properties: `backgroundColor`, `textColor`, `borderColor`, `rounded`, `padding`

**`ex-pricing-tier-featured`** — Featured/highlighted tier — polarity-flipped surface (dark fill + light text in light mode, light fill + dark text in dark mode).
- Properties: `backgroundColor`, `textColor`, `rounded`, `padding`

**`ex-product-selector`** — What's Included summary card — re-purposed for SaaS / B2B verticals (NOT a literal product gallery).
- Properties: `backgroundColor`, `rounded`, `padding`

**`ex-cart-drawer`** — Subscription summary — re-purposed for SaaS / B2B (line items per add-on, not literal cart).
- Properties: `backgroundColor`, `rounded`, `padding`, `item-divider`

**`ex-app-shell-row`** — Sidebar nav row inside the App Shell example. Active state uses brand primary as the indicator.
- Properties: `backgroundColor`, `activeIndicator`, `rounded`, `padding`

**`ex-data-table-cell`** — Default data-table th + td chrome. Header uses mono-caps eyebrow typography; body uses body-sm.
- Properties: `headerBackground`, `headerTypography`, `bodyTypography`, `cellPadding`, `rowBorder`

**`ex-auth-form-card`** — Sign-in / sign-up card. Re-uses feature-card chrome with text-input primitives inside.
- Properties: `backgroundColor`, `rounded`, `padding`

**`ex-modal-card`** — Modal dialog surface — same chrome as feature-card with elevated shadow.
- Properties: `backgroundColor`, `rounded`, `padding`

**`ex-empty-state-card`** — Empty-state illustration frame.
- Properties: `backgroundColor`, `rounded`, `padding`, `captionTypography`

**`ex-toast`** — Toast notification surface — feature-card shape + medium shadow.
- Properties: `backgroundColor`, `rounded`, `padding`, `typography`


## Do's and Don'ts

### Do
- Reserve `{colors.primary}` for the primary action, inline links, and the active/focus signal — nothing decorative.
- Keep the page on the warm `{colors.canvas-soft}` canvas; use pure white `{colors.surface}` for cards and fields to create gentle figure/ground.
- Let the sticker palette (`{colors.accent-pink}`, `{colors.accent-teal}`, `{colors.accent-orange}`, …) live only in illustrations, icon tiles and category dots.
- Set headlines in heavy `{typography.display-1}`/`{typography.heading-1}` with their negative tracking applied explicitly.
- Use pill `{rounded.full}` for marketing CTAs and tighter `{rounded.md}` for nav/utility buttons — the contrast is intentional.
- Define surfaces with `{colors.hairline}` and the barely-there Level-1 shadow rather than heavy drop-shadows.
- Reserve the deep indigo `{colors.secondary}` "night" treatment for a single hero moment, not repeated bands.

### Don't
- Don't paint a CTA or structural fill in any sticker-palette colour — those are decoration only.
- Don't introduce a second structural accent alongside `{colors.primary}`.
- Don't put pill `{rounded.full}` radii on form fields — inputs stay tight at `{rounded.xs}` (4px).
- Don't drop heavy shadows; Notion's elevation is many near-transparent layers, never a hard cast.
- Don't set body copy in a heavy weight — keep 400 for readability and let weight 700 belong to headlines.
- Don't place type on pure clinical white for full pages; the warm `{colors.canvas-soft}` is core to the brand calm.

# ============================================================
# TAB: BLOCKBUSTER — Cinema / streaming experience
# Primary: Runwayml (cinematic dark, media-rich layout)
# Accent: Spotify (content-art grid, bold type on dark)
# Goal: feels like browsing a world-class streaming service
# ============================================================
---
version: alpha
name: Runwai-design-analysis
description: An inspired interpretation of Runwai's design language — an editorial, gallery-grade marketing system for an AI creative-tools company. Cinematic photographic heroes give way to crisp white reading surfaces, a tight monochrome neutral ladder, and a single proprietary sans (abcNormal) carrying every level of the hierarchy. The system reads like a film festival programme more than a SaaS site: black ink on paper-white, generous air, hairline dividers, and reserved use of restrained slate-blue for secondary text. Pure black solid pills serve every primary action, with no accent colour competing for attention.

colors:
  primary: "#000000"
  on-primary: "#ffffff"
  ink: "#030303"
  ink-soft: "#1a1a1a"
  graphite: "#404040"
  slate: "#676f7b"
  slate-soft: "#727a85"
  mute: "#6b7280"
  stone: "#939393"
  ash: "#999999"
  hairline: "#e7eaf0"
  hairline-soft: "#c9ccd1"
  surface-cool: "#d0d4d4"
  canvas: "#ffffff"
  canvas-warm: "#fefefe"
  scrim: "#1a1a1a"
  footer: "#030303"

typography:
  display:
    fontFamily: abcNormal
    fontSize: 48px
    fontWeight: 400
    lineHeight: 1
    letterSpacing: -1.2px
  display-sm:
    fontFamily: abcNormal
    fontSize: 40px
    fontWeight: 400
    lineHeight: 1
    letterSpacing: -1px
  heading-md:
    fontFamily: abcNormal
    fontSize: 36px
    fontWeight: 400
    lineHeight: 1
    letterSpacing: -0.9px
  heading-sm:
    fontFamily: abcNormal
    fontSize: 24px
    fontWeight: 400
    lineHeight: 1
  subtitle:
    fontFamily: abcNormal
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1
  body:
    fontFamily: abcNormal
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body-strong:
    fontFamily: abcNormal
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.5
  body-tight:
    fontFamily: abcNormal
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: -0.16px
  link-sm:
    fontFamily: abcNormal
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.43
  meta:
    fontFamily: abcNormal
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: -0.26px
  eyebrow:
    fontFamily: abcNormal
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.43
    letterSpacing: 0.35px
  micro-caps:
    fontFamily: abcNormal
    fontSize: 11px
    fontWeight: 450
    lineHeight: 1.3
    letterSpacing: 0.2px
  button:
    fontFamily: abcNormal
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.43

rounded:
  none: 0px
  xs: 4px
  sm: 6px
  md: 8px
  lg: 16px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 64px
  section-lg: 96px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    padding: 12px
    height: 40px
  button-primary-on-dark:
    backgroundColor: "{colors.on-primary}"
    textColor: "{colors.primary}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    padding: 12px
    height: 40px
  button-ghost:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    padding: 12px
    height: 40px
  button-text-link:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.link-sm}"
    rounded: "{rounded.xs}"
    padding: 4px
  nav-bar:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.link-sm}"
    height: 64px
    padding: 24px
  nav-link:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-soft}"
    typography: "{typography.link-sm}"
    padding: 8px
  pricing-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: 24px
    width: 224px
  pricing-card-featured:
    backgroundColor: "{colors.hairline}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: 24px
    width: 224px
  pricing-tier-name:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.heading-md}"
  pricing-amount:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.display}"
  research-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 16px
  media-thumbnail:
    backgroundColor: "{colors.surface-cool}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
  hero-photo:
    backgroundColor: "{colors.scrim}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.lg}"
    padding: 48px
  studios-tile:
    backgroundColor: "{colors.canvas-warm}"
    textColor: "{colors.ink}"
    typography: "{typography.body-tight}"
    rounded: "{rounded.md}"
    padding: 16px
  studios-tag:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.slate}"
    typography: "{typography.micro-caps}"
    rounded: "{rounded.full}"
    padding: 6px
  form-field:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: 12px
  form-field-focused:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: 12px
  alert-banner:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-tight}"
    rounded: "{rounded.lg}"
    padding: 16px
  footer:
    backgroundColor: "{colors.footer}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body}"
    padding: 64px
  footer-link:
    backgroundColor: "{colors.footer}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body}"
  footer-eyebrow:
    backgroundColor: "{colors.footer}"
    textColor: "{colors.stone}"
    typography: "{typography.eyebrow}"
---

## Overview

Runwai treats its marketing site as a curatorial space — closer in feeling to the programme guide of a film festival than to a typical AI-tooling site. Photography sets the temperature: cinematic, atmospheric stills (a forest at dusk, a lone figure under an indigo night sky) anchor full-bleed hero modules in `{colors.scrim}`, while the rest of the document drops onto pure `{colors.canvas}` for unbroken reading. The colour story is restraint to the point of austerity — black ink on paper-white, with five tiers of grey carrying every nuance from caption to divider, and a single slate-blue (`{colors.slate-soft}` / `{colors.slate}`) reserved for secondary text on rare occasions.

Typography does almost all of the heavy lifting. A single proprietary sans, `abcNormal`, carries every level from 11px micro-caps to 48px editorial display, with negative letter-spacing on every heading (`-0.9px` to `-1.2px`) tightening the headline silhouette into something that reads as deliberate and quiet rather than punchy. There is no decorative ornament, no card glow, no gradient buttons — every primary action is a black solid pill (`{colors.primary}` background, `{colors.on-primary}` text, `{rounded.full}` corners), reused with absolute consistency across hero CTAs, pricing subscriptions, and form submissions.

The layout discipline is editorial: hairline dividers (`{colors.hairline}`), uppercase eyebrows (`{typography.eyebrow}`), and an 8-px spacing grid that resolves to large 64–96px section gutters. Sections cycle through a tight rhythm — dark photographic hero → white reading band → research grid on canvas → photographic full-width interlude → dark CTA strip → black footer — letting black ink and black-and-white photography do the dramatic work that other sites delegate to colour.

**Key Characteristics:**
- Cinematic dark photographic heroes (`{colors.scrim}` over editorial stills) bookending crisp `{colors.canvas}` reading bands
- A single proprietary sans (`abcNormal`) covering every typographic role, with tight negative tracking on display sizes
- Black-only primary action language: every CTA is `{button-primary}` (`{colors.primary}` pill with `{rounded.full}` corners and 14px/600 button text)
- Five-tier neutral ladder (`{colors.ink}` → `{colors.graphite}` → `{colors.slate}` → `{colors.stone}` → `{colors.hairline}`) carries the entire UI without accent colour
- 5-column pricing grid where the featured tier is signalled by a `{colors.hairline}` infill rather than a coloured border
- Hairline dividers and uppercase `{typography.eyebrow}` lock-ups give marketing sections an editorial, exhibition-catalogue cadence
- Photography is treated as content, not decoration — full-bleed, cinematic, and tonal rather than vivid

## Colors

### Brand & Accent
- **Black** (`{colors.primary}`): The single brand action colour. Every primary CTA, every pricing-tier subscription button, every form submit pill resolves to this exact black. Used as the footer canvas as well, which extends the brand voice through the bottom of every page.
- **Paper White** (`{colors.on-primary}`): Type colour on `{colors.primary}` surfaces; canvas of every reading section.

### Surface
- **Canvas** (`{colors.canvas}`): Primary reading-page background.
- **Canvas Warm** (`{colors.canvas-warm}`): Near-imperceptible off-white used to lift studios-page tiles a half-tone above pure white without losing the paper feel.
- **Featured Surface** (`{colors.hairline}`): The infill behind the featured pricing tier ("Pro") and behind certain table-style banners — chosen for its near-zero saturation so it reads as a tonal step rather than a fill.
- **Hairline Soft** (`{colors.hairline-soft}`): 1-pixel column dividers in the pricing grid and table separators.
- **Cool Surface** (`{colors.surface-cool}`): Default placeholder fill for media thumbnails and image-loading frames before the asset paints.
- **Scrim** (`{colors.scrim}`): The atmospheric dark layer that cinematic hero photography is laid into; behaves as the "stage" colour for full-bleed image modules.
- **Footer** (`{colors.footer}`): Near-pure black footer canvas, one notch warmer than `{colors.primary}` so it sits visually distinct when the two stack.

### Text
- **Ink** (`{colors.ink}`): Primary heading and body text on `{colors.canvas}`; closest the system gets to absolute black for type.
- **Ink Soft** (`{colors.ink-soft}`): Nav links, secondary headings, body emphasis — one click softer than ink.
- **Graphite** (`{colors.graphite}`): Standard body copy across marketing sections, balancing readability with calm.
- **Slate** (`{colors.slate}`) / **Slate Soft** (`{colors.slate-soft}`): The system's only tinted neutrals — barely-blue greys reserved for tertiary metadata, footer-section headings on dark, and small-caps labels.
- **Mute** (`{colors.mute}`): Lighter neutral for inline disabled or fine-print copy.
- **Stone** (`{colors.stone}`): Footer eyebrow caps and field placeholders.
- **Ash** (`{colors.ash}`): The lightest readable neutral — captions on tiles, pricing fine-print.

### Semantic
The system does not introduce signal colours (red, green, yellow). Validation states in forms rely on borders and copy rather than colour shifts. Where the contact form indicates a required field, the only visual cue is an asterisk in `{colors.ink}` paired with helper text in `{colors.graphite}`.

## Typography

### Font Family
The entire system runs on a single proprietary sans, **abcNormal**, with `abcNormal Fallback` declared as the substitute. It is a humanist neo-grotesque in the lineage of ABC Diatype — uniform stroke contrast, flat terminals, slightly compressed counters, and a confident lowercase that suits Runwai's all-lowercase wordmark. The face is used at every level; there is no second display font, no monospace, no italic specimen across marketing pages.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.display}` | 48px | 400 | 1.0 | -1.2px | Page-level editorial display ("Runwai Pricing", "Looking to get in touch?") |
| `{typography.display-sm}` | 40px | 400 | 1.0 | -1px | Pricing tier amount, hero secondary headlines |
| `{typography.heading-md}` | 36px | 400 | 1.0 | -0.9px | Section headlines ("Our latest Research and Products"), tier names |
| `{typography.heading-sm}` | 24px | 400 | 1.0 | 0 | Card titles, sub-section heads, link text in featured cards |
| `{typography.subtitle}` | 20px | 400 | 1.0 | 0 | Hero sub-copy and lead paragraphs |
| `{typography.body}` | 16px | 400 | 1.5 | 0 | Default body copy, form fields, footer link list |
| `{typography.body-strong}` | 16px | 600 | 1.5 | 0 | Inline emphasis, "Get Started"-class label text |
| `{typography.body-tight}` | 16px | 400 | 1.3 | -0.16px | Tight-leading body for marketing cards and CTA cards |
| `{typography.link-sm}` | 14px | 600 | 1.43 | 0 | Nav links, button labels, "Learn More" text links |
| `{typography.eyebrow}` | 14px | 500 | 1.43 | 0.35px | Uppercase eyebrows above section headings |
| `{typography.meta}` | 13px | 400 | 1.3 | -0.26px | Tertiary metadata (dates, fine print, table footnotes) |
| `{typography.micro-caps}` | 11px | 450 | 1.3 | 0.2px | Footer column headings, small-caps tags ("PRESS", "RESOURCES") |
| `{typography.button}` | 14px | 600 | 1.43 | 0 | Every button label across the system |

### Principles
- **One face, every level.** Hierarchy is articulated through size, weight, and tracking — never through a contrasting display family. The result is a uniform editorial cadence that reads as confident rather than expressive.
- **Negative tracking on display, neutral tracking on body.** Headings 24–48px sit at -0.9 to -1.2px to tighten silhouettes; body copy stays at 0 for legibility.
- **Tight leading on display, generous leading on body.** Display sizes lock to `line-height: 1.0`; body relaxes to `1.5`. The contrast gives sections a clear "headline-then-paragraph" rhythm.
- **Uppercase reserved for two roles.** `{typography.eyebrow}` for section labels, `{typography.micro-caps}` for footer columns and small tags. Body copy is never set in uppercase.

### Note on Font Substitutes
If `abcNormal` is unavailable, the closest open-source substitutes are **ABC Diatype** (commercial) or **Inter** at -0.02em tracking on display sizes. When using Inter, lift display sizes by ~1px and pull `letter-spacing` slightly tighter (-1.4px at 48px) to recover the compressed silhouette of the original.

## Layout

### Spacing System
- **Base unit**: 8px (with 4px and 6px micro-steps for inline element gaps).
- **Tokens (front matter)**: `{spacing.xxs}` 4px · `{spacing.xs}` 8px · `{spacing.sm}` 12px · `{spacing.md}` 16px · `{spacing.lg}` 24px · `{spacing.xl}` 32px · `{spacing.xxl}` 48px · `{spacing.section}` 64px · `{spacing.section-lg}` 96px.
- Card internal padding sits at `{spacing.lg}` (24px). Section vertical rhythm alternates between `{spacing.section}` (64px) for tight reading bands and `{spacing.section-lg}` (96px) for editorial breaks between major modules. Inline button padding is `{spacing.sm}` vertical / `{spacing.lg}` horizontal.

### Grid & Container
- Marketing pages render inside a centred container that caps near 1280px on widescreen breakpoints; the document maintains generous left/right gutters (~`{spacing.xxl}`) at every breakpoint above 1024px.
- The pricing surface is a 5-column equal-width grid (Free / Standard / Pro / Unlimited / Enterprise) on widescreen; each column is a vertical strip separated by 1-pixel `{colors.hairline-soft}` rules rather than gaps.
- Research/products listings use a 12-column underlying grid where each row presents a 5/7 split: media thumbnail on the left (5 columns), aligned text block on the right (7 columns).
- Studios pages break the discipline deliberately: a dense, irregular masonry of editorial poster tiles, captioned in `{typography.body-tight}`, with no consistent column count — the page is meant to read as a programme grid.

### Whitespace Philosophy
Whitespace at Runwai is structural, not decorative. Sections are separated by 64–96px verticals; cards inside a section are separated by 16–24px gaps. There are no card shadows or coloured surfaces standing in for layout — `{colors.canvas}` carries through, and rhythm comes from line-height and section spacing alone. The studios pages are the exception; their dense poster grids feel almost cluttered by contrast, which is the point — they read like a printed catalogue.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| Flat | No shadow, optional 1px `{colors.hairline}` divider | Default state for cards, pricing columns, research rows, footer surfaces |
| Photographic | Full-bleed image laid into `{colors.scrim}`, no border, `{rounded.lg}` corners on contained variants | Hero modules, "We are building foundational simulation World Models" interlude, mid-page CTA panels |
| Subtle Surface Lift | `{colors.hairline}` infill behind a card on a `{colors.canvas}` page | The featured pricing tier ("Pro") — the only "elevation" cue in the entire pricing module |

The system avoids drop shadows entirely. Depth is created by photographic layering and tonal surface shifts, never by blurred shadows. This is a deliberate aesthetic choice — Runwai communicates polish through editorial restraint, not material affordance.

### Decorative Depth
- **Cinematic photography as backdrop.** The hero on the homepage uses an indigo night-sky photograph; the mid-page interlude uses a fog-and-trees forest scene rendered into `{colors.scrim}`. Both function as atmospheric surfaces that the next white reading band breaks against, creating a perceived "stage" depth without any CSS effect.
- **Tonal surface stepping.** Pricing's featured-tier infill (`{colors.hairline}` against `{colors.canvas}`) is the system's quietest possible "this one is special" cue — perceptible, never loud.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.none}` | 0px | Pricing-grid cells, table rows, form fields, footer link blocks |
| `{rounded.xs}` | 4px | Small inline accents, focus rings, secondary link chips |
| `{rounded.sm}` | 6px | Tag chips, secondary link buttons |
| `{rounded.md}` | 8px | Research-card thumbnails, studios poster tiles, media containers |
| `{rounded.lg}` | 16px | Alert banners, hero-photograph containers, full-bleed CTA panels |
| `{rounded.full}` | 9999px | Every primary button (CTA pills), studios tag pills |

### Photography Geometry
- **Hero stills** are full-bleed, no rounding — they extend to the page edges to feel cinematic rather than card-like.
- **Contained hero panels** (mid-page interludes) take `{rounded.lg}` corners, signalling "module" rather than "page".
- **Research thumbnails** are 16:9 with `{rounded.md}` corners and a `{colors.surface-cool}` placeholder fill.
- **Studios poster tiles** vary in aspect ratio (square, 4:5, landscape) and use `{rounded.md}` corners; the deliberate aspect-ratio inconsistency is what gives the studios grid its programme-catalogue feel.
- **Avatar/logo lockups** in the partner row are rendered without rounding, in flat black wordmarks on `{colors.canvas}`, evenly spaced.

## Components

### Buttons

**`button-primary`** — every primary CTA across the marketing surface ("Try Runwai", "Get Started", "Subscribe Now", "Send Message", "Learn More" filled variant)
- Background `{colors.primary}`, text `{colors.on-primary}`, type `{typography.button}`, padding `{spacing.sm}` × `{spacing.lg}`, rounded `{rounded.full}`, height 40px.
- The system uses the same pill at every scale; no large/small distinction.

**`button-primary-on-dark`** — the inverse used when the surface itself is `{colors.scrim}` (dark hero CTAs)
- Background `{colors.on-primary}`, text `{colors.primary}`, otherwise identical token set to `{button-primary}`.

**`button-ghost`** — secondary actions on light surfaces ("Schedule a Demo", "Sign Up" on the Free tier)
- Background `{colors.canvas}`, text `{colors.ink}`, type `{typography.button}`, rounded `{rounded.full}`, with a 1px `{colors.ink}` border.

**`button-text-link`** — inline secondary actions, table-row "Subscribe Now" labels, and "View More" links
- Background `{colors.canvas}`, text `{colors.ink}`, underline-on-active, type `{typography.link-sm}`.

### Navigation

**`nav-bar`** — the persistent top bar
- Background `{colors.canvas}`, height ~64px, padding `{spacing.lg}` horizontal, `{typography.link-sm}` for menu items.
- Layout: lowercase `runwai` wordmark left → centred 5-item primary menu (Research, Product, Resources, Solutions, Company) → right cluster (`Enterprise Sales` text link, `Log In` text link, `Try Runwai` `{button-primary}` pill).
- The bar sits flush against the document top and is divided from the page only by spacing, not by a hairline.

**`nav-link`** — top-bar menu items
- Background `{colors.canvas}`, text `{colors.ink-soft}`, type `{typography.link-sm}`, padding `{spacing.xs}` vertical.

### Cards & Containers

**`pricing-card`** — every standard tier (Free, Standard, Unlimited, Enterprise)
- Background `{colors.canvas}`, text `{colors.ink}`, padding `{spacing.lg}`, no rounding, separated from neighbouring tiers by 1px `{colors.hairline-soft}` column rules.
- Internal stack: tier name (`{typography.heading-md}`) → one-line description (`{typography.body}` in `{colors.graphite}`) → amount (`{typography.display-sm}`) → unit caption (`{typography.meta}` in `{colors.stone}`) → action button (`{button-primary}` for paid tiers, `{button-ghost}` for Free) → feature list (`{typography.body}` bullets).

**`pricing-card-featured`** — the "Pro" tier
- Identical structure to `{pricing-card}` but the column infill is `{colors.hairline}` instead of `{colors.canvas}`. No coloured border, no badge, no shadow — just the surface-step.

**`pricing-tier-name`** — header line of each pricing column
- Background `{colors.canvas}`, text `{colors.ink}`, type `{typography.heading-md}` set in title-case ("Free", "Standard", "Pro").

**`pricing-amount`** — large monetary display in each pricing card
- Background `{colors.canvas}`, text `{colors.ink}`, type `{typography.display}` paired with a `{typography.meta}` "per user/month" caption beside it.

**`research-card`** — each row of "Our latest Research and Products"
- Layout: `{media-thumbnail}` left (16:9) + text block right.
- Right block: title (`{typography.heading-sm}`) → description (`{typography.body}` in `{colors.graphite}`) → footer link (`{typography.link-sm}`, underlined on active).

**`studios-tile`** — poster cards on the studios index
- Background `{colors.canvas-warm}`, image fills the tile, optional caption strip below in `{typography.body-tight}` (`{colors.graphite}`).
- Tiles are deliberately heterogeneous in aspect ratio.

**`studios-tag`** — small-caps category pills on studios cards
- Background `{colors.canvas}`, text `{colors.slate}`, type `{typography.micro-caps}`, padding `{spacing.xxs}` × `{spacing.sm}`, rounded `{rounded.full}`.

**`hero-photo`** — full-bleed cinematic hero blocks
- `{colors.scrim}` background carrying a photographic still, padding `{spacing.xxl}`, rounded `{rounded.lg}` on contained variants and `{rounded.none}` on edge-to-edge variants.
- Internal stack: optional eyebrow (`{typography.eyebrow}` in `{colors.on-primary}` at 70% opacity) → display headline (`{typography.display}` in `{colors.on-primary}`) → optional sub-copy (`{typography.subtitle}` in `{colors.on-primary}`) → `{button-primary-on-dark}` CTA.

**`media-thumbnail`** — image placeholder
- Background `{colors.surface-cool}`, rounded `{rounded.md}`, ratio 16:9 by default, image lazy-loads on top.

### Inputs & Forms

**`form-field`** — every contact-form input (select, text, textarea)
- Background `{colors.canvas}`, text `{colors.ink}`, label above field in `{typography.body}` `{colors.ink}`, helper text in `{typography.meta}` `{colors.stone}`.
- The field itself is a 1px bottom rule in `{colors.hairline-soft}` (no full-border box) — placeholder ("Type your full name") sits in `{colors.stone}`.
- Padding `{spacing.sm}` vertical, no rounding.

**`form-field-focused`** — focused state
- Bottom rule deepens to `{colors.ink}`. No glow, no colour shift on the field background.

**`alert-banner`** — privacy/cookie disclosure copy
- Background `{colors.canvas}`, text `{colors.ink}`, `{typography.body-tight}`, padding `{spacing.md}`, rounded `{rounded.lg}`, 1px `{colors.hairline-soft}` border.

### Footer

**`footer`** — the system's terminal surface
- Background `{colors.footer}`, text `{colors.on-primary}`, padding `{spacing.section}` vertical, `{spacing.lg}` horizontal.
- Layout: 6-column link grid → bottom strip with the lowercase `runwai` wordmark left and legal/copyright links right.

**`footer-eyebrow`** — small-caps column headings ("Product", "Initiatives", "Company")
- Background `{colors.footer}`, text `{colors.stone}`, type `{typography.eyebrow}`.

**`footer-link`** — link-list items
- Background `{colors.footer}`, text `{colors.on-primary}`, type `{typography.body}`.

### Signature Components

**Pricing 5-Column Slab** — Runwai's pricing module is unusually flat: a 5-tier slab with no coloured borders, no shadow, no badge ribbon. The featured tier is signalled by a single tonal step (`{colors.hairline}` infill) and a slightly heavier action button. The decision to render Free → Enterprise as one continuous slab instead of separate floating cards is the page's central design move.

**Editorial Eyebrow + Display Lockup** — Across the site, headline modules follow a fixed three-part rhythm: uppercase `{typography.eyebrow}` label → 36–48px `{typography.display}` headline → `{typography.body}` lead paragraph. Section spacing locks to `{spacing.section}` between modules. The lockup is what gives marketing pages their festival-programme cadence.

**Cinematic Atmospheric Interlude** — Mid-document interludes (the "We are building foundational simulation World Models" forest scene, the "We are building AI to simulate the world…" closing strip) use a contained `{hero-photo}` panel with `{rounded.lg}` corners. They function as pacing breaks between research grids and CTA bands rather than promotional units.

## Do's and Don'ts

### Do
- Reserve `{colors.primary}` for primary actions and the footer; use `{button-primary}` for every primary CTA without varying corner radius or fill.
- Stack uppercase `{typography.eyebrow}` over `{typography.display}` for every major section opener — it is the system's signature lockup.
- Use `{colors.hairline}` infill — never a coloured border — when one item in a comparison must read as featured.
- Set body copy in `{colors.graphite}` against `{colors.canvas}` for paragraphs, and reserve `{colors.ink}` for headings and emphasis only.
- Treat photography as content: full-bleed, cinematic, aligned to the page edge in heroes; `{rounded.lg}` only when the photo is contained inside a section.
- Lock display headings to negative letter-spacing (`-0.9px` to `-1.2px`) — the tight tracking is core to the brand voice.
- Use `{rounded.full}` pills for buttons and `{rounded.none}` for table/grid cells. Never mix.

### Don't
- Don't introduce accent colours (blue, green, red) into marketing surfaces — Runwai's voice is monochrome plus photography.
- Don't apply drop shadows or glows to cards. Depth is photographic and tonal, not material.
- Don't badge the featured pricing tier with a coloured ribbon or border — the surface step is the badge.
- Don't break headings into bold + light contrast; every heading is regular weight (`400`) with tight tracking.
- Don't centre body paragraphs longer than one sentence — the system uses left-aligned reading bands almost exclusively.
- Don't use uppercase for body or button copy. Uppercase is reserved for `{typography.eyebrow}` (14px) and `{typography.micro-caps}` (11px).
- Don't render the runwai wordmark in title-case or with a brand colour. It is always lowercase, in `{colors.ink}` on light surfaces and `{colors.on-primary}` on dark.

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| 2xl | 1600px | Full editorial container; pricing 5-up; research rows 5/7 split |
| xl | 1536px | Same layout, marginally tighter gutters |
| lg | 1280px | Default desktop reading view |
| md | 1200px | Pricing grid still 5-up but tier text tightens |
| sm | 1024px | Pricing collapses to 3 → 2 tier rows; research rows stack at certain breakpoints |
| xs | 768px | Top nav collapses to a hamburger; section padding drops to `{spacing.section}` |
| xxs | 640px | Single-column reading; hero display drops to `{typography.display-sm}`; pricing tiers stack 1-up |

### Touch Targets
- Every `{button-primary}` is 40px tall — at the lower edge of the 44×44 WCAG target. On mobile the buttons grow to 48px height (still `{rounded.full}`, still `{typography.button}`).
- `{nav-link}` items get `{spacing.sm}` vertical padding inside the mobile menu, expanding the tap target without changing typography.
- Pricing-tier `{button-primary}` extends full-column-width on mobile.

### Collapsing Strategy
- **Nav.** Centred desktop menu collapses into a single hamburger that opens an overlay sheet; the right-side `{button-primary}` "Try Runwai" stays visible above the hamburger as the persistent action.
- **Pricing.** 5-column slab collapses to single-column stacked cards at xxs; the featured `{colors.hairline}` infill is preserved on the Pro card so the tonal cue survives the stack.
- **Research grid.** 5/7 split collapses to image-on-top, text-below at sm; thumbnail rounding (`{rounded.md}`) is preserved.
- **Footer.** 6-column link grid collapses to 2-column at sm and 1-column at xxs; the lowercase `runwai` wordmark stays bottom-left, legal links stack underneath.

### Image Behavior
- Hero photographs swap to a tighter crop on mobile (vertical-leaning) so the focal subject stays centred at xxs widths.
- `{media-thumbnail}` containers preserve their 16:9 ratio at every breakpoint; the `{colors.surface-cool}` placeholder fill paints during lazy-load.
- Studios poster tiles preserve their original aspect ratios at every breakpoint — the masonry simply re-flows into fewer columns.

## Iteration Guide

1. Focus on ONE component at a time. Start with `{button-primary}` and `{nav-bar}` — they appear on every page and anchor the system.
2. Reference component names and tokens directly (`{colors.ink}`, `{button-primary-on-dark}`, `{rounded.full}`) — do not paraphrase or substitute hex values.
3. Run `npx @google/design.md lint DESIGN.md` after edits — `broken-ref`, `contrast-ratio`, and `orphaned-tokens` warnings flag drift automatically.
4. Add new variants as separate `components:` entries (`-pressed`, `-disabled`, `-focused`) — never bury them inside prose.
5. Default body copy to `{typography.body}` and emphasis to `{typography.body-strong}`. Reserve `{typography.eyebrow}` and `{typography.micro-caps}` for their two specific roles (section openers and footer columns).
6. Keep `{colors.primary}` scarce — if more than one black-pill action appears in a single viewport, neutralise the secondary one to `{button-ghost}`.
7. When introducing photography, lay it into `{colors.scrim}` and let the next white band break against it. Avoid mid-section photographic accents that don't span the full content width — they read as off-system.

# --- Blockbuster accent: Spotify content-art patterns ---
# Design System Inspired by Spotify

## 1. Visual Theme & Atmosphere

Spotify's web interface is a dark, immersive music player that wraps listeners in a near-black cocoon (`#121212`, `#181818`, `#1f1f1f`) where album art and content become the primary source of color. The design philosophy is "content-first darkness" — the UI recedes into shadow so that music, podcasts, and playlists can glow. Every surface is a shade of charcoal, creating a theater-like environment where the only true color comes from the iconic Spotify Green (`#1ed760`) and the album artwork itself.

The typography uses SpotifyMixUI and SpotifyMixUITitle — proprietary fonts from the CircularSp family (Circular by Lineto, customized for Spotify) with an extensive fallback stack that includes Arabic, Hebrew, Cyrillic, Greek, Devanagari, and CJK fonts, reflecting Spotify's global reach. The type system is compact and functional: 700 (bold) for emphasis and navigation, 600 (semibold) for secondary emphasis, and 400 (regular) for body. Buttons use uppercase with positive letter-spacing (1.4px–2px) for a systematic, label-like quality.

What distinguishes Spotify is its pill-and-circle geometry. Primary buttons use 500px–9999px radius (full pill), circular play buttons use 50% radius, and search inputs are 500px pills. Combined with heavy shadows (`rgba(0,0,0,0.5) 0px 8px 24px`) on elevated elements and a unique inset border-shadow combo (`rgb(18,18,18) 0px 1px 0px, rgb(124,124,124) 0px 0px 0px 1px inset`), the result is an interface that feels like a premium audio device — tactile, rounded, and built for touch.

**Key Characteristics:**
- Near-black immersive dark theme (`#121212`–`#1f1f1f`) — UI disappears behind content
- Spotify Green (`#1ed760`) as singular brand accent — never decorative, always functional
- SpotifyMixUI/CircularSp font family with global script support
- Pill buttons (500px–9999px) and circular controls (50%) — rounded, touch-optimized
- Uppercase button labels with wide letter-spacing (1.4px–2px)
- Heavy shadows on elevated elements (`rgba(0,0,0,0.5) 0px 8px 24px`)
- Semantic colors: negative red (`#f3727f`), warning orange (`#ffa42b`), announcement blue (`#539df5`)
- Album art as the primary color source — the UI is achromatic by design

## 2. Color Palette & Roles

### Primary Brand
- **Spotify Green** (`#1ed760`): Primary brand accent — play buttons, active states, CTAs
- **Near Black** (`#121212`): Deepest background surface
- **Dark Surface** (`#181818`): Cards, containers, elevated surfaces
- **Mid Dark** (`#1f1f1f`): Button backgrounds, interactive surfaces

### Text
- **White** (`#ffffff`): `--text-base`, primary text
- **Silver** (`#b3b3b3`): Secondary text, muted labels, inactive nav
- **Near White** (`#cbcbcb`): Slightly brighter secondary text
- **Light** (`#fdfdfd`): Near-pure white for maximum emphasis

### Semantic
- **Negative Red** (`#f3727f`): `--text-negative`, error states
- **Warning Orange** (`#ffa42b`): `--text-warning`, warning states
- **Announcement Blue** (`#539df5`): `--text-announcement`, info states

### Surface & Border
- **Dark Card** (`#252525`): Elevated card surface
- **Mid Card** (`#272727`): Alternate card surface
- **Border Gray** (`#4d4d4d`): Button borders on dark
- **Light Border** (`#7c7c7c`): Outlined button borders, muted links
- **Separator** (`#b3b3b3`): Divider lines
- **Light Surface** (`#eeeeee`): Light-mode buttons (rare)
- **Spotify Green Border** (`#1db954`): Green accent border variant

### Shadows
- **Heavy** (`rgba(0,0,0,0.5) 0px 8px 24px`): Dialogs, menus, elevated panels
- **Medium** (`rgba(0,0,0,0.3) 0px 8px 8px`): Cards, dropdowns
- **Inset Border** (`rgb(18,18,18) 0px 1px 0px, rgb(124,124,124) 0px 0px 0px 1px inset`): Input border-shadow combo

## 3. Typography Rules

### Font Families
- **Title**: `SpotifyMixUITitle`, fallbacks: `CircularSp-Arab, CircularSp-Hebr, CircularSp-Cyrl, CircularSp-Grek, CircularSp-Deva, Helvetica Neue, helvetica, arial, Hiragino Sans, Hiragino Kaku Gothic ProN, Meiryo, MS Gothic`
- **UI / Body**: `SpotifyMixUI`, same fallback stack

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Section Title | SpotifyMixUITitle | 24px (1.50rem) | 700 | normal | normal | Bold title weight |
| Feature Heading | SpotifyMixUI | 18px (1.13rem) | 600 | 1.30 (tight) | normal | Semibold section heads |
| Body Bold | SpotifyMixUI | 16px (1.00rem) | 700 | normal | normal | Emphasized text |
| Body | SpotifyMixUI | 16px (1.00rem) | 400 | normal | normal | Standard body |
| Button Uppercase | SpotifyMixUI | 14px (0.88rem) | 600–700 | 1.00 (tight) | 1.4px–2px | `text-transform: uppercase` |
| Button | SpotifyMixUI | 14px (0.88rem) | 700 | normal | 0.14px | Standard button |
| Nav Link Bold | SpotifyMixUI | 14px (0.88rem) | 700 | normal | normal | Navigation |
| Nav Link | SpotifyMixUI | 14px (0.88rem) | 400 | normal | normal | Inactive nav |
| Caption Bold | SpotifyMixUI | 14px (0.88rem) | 700 | 1.50–1.54 | normal | Bold metadata |
| Caption | SpotifyMixUI | 14px (0.88rem) | 400 | normal | normal | Metadata |
| Small Bold | SpotifyMixUI | 12px (0.75rem) | 700 | 1.50 | normal | Tags, counts |
| Small | SpotifyMixUI | 12px (0.75rem) | 400 | normal | normal | Fine print |
| Badge | SpotifyMixUI | 10.5px (0.66rem) | 600 | 1.33 | normal | `text-transform: capitalize` |
| Micro | SpotifyMixUI | 10px (0.63rem) | 400 | normal | normal | Smallest text |

### Principles
- **Bold/regular binary**: Most text is either 700 (bold) or 400 (regular), with 600 used sparingly. This creates a clear visual hierarchy through weight contrast rather than size variation.
- **Uppercase buttons as system**: Button labels use uppercase + wide letter-spacing (1.4px–2px), creating a systematic "label" voice distinct from content text.
- **Compact sizing**: The range is 10px–24px — narrower than most systems. Spotify's type is compact and functional, designed for scanning playlists, not reading articles.
- **Global script support**: The extensive fallback stack (Arabic, Hebrew, Cyrillic, Greek, Devanagari, CJK) reflects Spotify's 180+ market reach.

## 4. Component Stylings

### Buttons

**Dark Pill**
- Background: `#1f1f1f`
- Text: `#ffffff` or `#b3b3b3`
- Padding: 8px 16px
- Radius: 9999px (full pill)
- Use: Navigation pills, secondary actions

**Dark Large Pill**
- Background: `#181818`
- Text: `#ffffff`
- Padding: 0px 43px
- Radius: 500px
- Use: Primary app navigation buttons

**Light Pill**
- Background: `#eeeeee`
- Text: `#181818`
- Radius: 500px
- Use: Light-mode CTAs (cookie consent, marketing)

**Outlined Pill**
- Background: transparent
- Text: `#ffffff`
- Border: `1px solid #7c7c7c`
- Padding: 4px 16px 4px 36px (asymmetric for icon)
- Radius: 9999px
- Use: Follow buttons, secondary actions

**Circular Play**
- Background: `#1f1f1f`
- Text: `#ffffff`
- Padding: 12px
- Radius: 50% (circle)
- Use: Play/pause controls

### Cards & Containers
- Background: `#181818` or `#1f1f1f`
- Radius: 6px–8px
- No visible borders on most cards
- Hover: slight background lightening
- Shadow: `rgba(0,0,0,0.3) 0px 8px 8px` on elevated

### Inputs
- Search input: `#1f1f1f` background, `#ffffff` text
- Radius: 500px (pill)
- Padding: 12px 96px 12px 48px (icon-aware)
- Focus: border becomes `#000000`, outline `1px solid`

### Navigation
- Dark sidebar with SpotifyMixUI 14px weight 700 for active, 400 for inactive
- `#b3b3b3` muted color for inactive items, `#ffffff` for active
- Circular icon buttons (50% radius)
- Spotify logo top-left in green

## 5. Layout Principles

### Spacing System
- Base unit: 8px
- Scale: 1px, 2px, 3px, 4px, 5px, 6px, 8px, 10px, 12px, 14px, 15px, 16px, 20px

### Grid & Container
- Sidebar (fixed) + main content area
- Grid-based album/playlist cards
- Full-width now-playing bar at bottom
- Responsive content area fills remaining space

### Whitespace Philosophy
- **Dark compression**: Spotify packs content densely — playlist grids, track lists, and navigation are all tightly spaced. The dark background provides visual rest between elements without needing large gaps.
- **Content density over breathing room**: This is an app, not a marketing site. Every pixel serves the listening experience.

### Border Radius Scale
- Minimal (2px): Badges, explicit tags
- Subtle (4px): Inputs, small elements
- Standard (6px): Album art containers, cards
- Comfortable (8px): Sections, dialogs
- Medium (10px–20px): Panels, overlay elements
- Large (100px): Large pill buttons
- Pill (500px): Primary buttons, search input
- Full Pill (9999px): Navigation pills, search
- Circle (50%): Play buttons, avatars, icons

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Base (Level 0) | `#121212` background | Deepest layer, page background |
| Surface (Level 1) | `#181818` or `#1f1f1f` | Cards, sidebar, containers |
| Elevated (Level 2) | `rgba(0,0,0,0.3) 0px 8px 8px` | Dropdown menus, hover cards |
| Dialog (Level 3) | `rgba(0,0,0,0.5) 0px 8px 24px` | Modals, overlays, menus |
| Inset (Border) | `rgb(18,18,18) 0px 1px 0px, rgb(124,124,124) 0px 0px 0px 1px inset` | Input borders |

**Shadow Philosophy**: Spotify uses notably heavy shadows for a dark-themed app. The 0.5 opacity shadow at 24px blur creates a dramatic "floating in darkness" effect for dialogs and menus, while the 0.3 opacity at 8px blur provides a more subtle card lift. The unique inset border-shadow combination on inputs creates a recessed, tactile quality.

## 7. Do's and Don'ts

### Do
- Use near-black backgrounds (`#121212`–`#1f1f1f`) — depth through shade variation
- Apply Spotify Green (`#1ed760`) only for play controls, active states, and primary CTAs
- Use pill shape (500px–9999px) for all buttons — circular (50%) for play controls
- Apply uppercase + wide letter-spacing (1.4px–2px) on button labels
- Keep typography compact (10px–24px range) — this is an app, not a magazine
- Use heavy shadows (`0.3–0.5 opacity`) for elevated elements on dark backgrounds
- Let album art provide color — the UI itself is achromatic

### Don't
- Don't use Spotify Green decoratively or on backgrounds — it's functional only
- Don't use light backgrounds for primary surfaces — the dark immersion is core
- Don't skip the pill/circle geometry on buttons — square buttons break the identity
- Don't use thin/subtle shadows — on dark backgrounds, shadows need to be heavy to be visible
- Don't add additional brand colors — green + achromatic grays is the complete palette
- Don't use relaxed line-heights — Spotify's typography is compact and dense
- Don't expose raw gray borders — use shadow-based or inset borders instead

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile Small | <425px | Compact mobile layout |
| Mobile | 425–576px | Standard mobile |
| Tablet | 576–768px | 2-column grid |
| Tablet Large | 768–896px | Expanded layout |
| Desktop Small | 896–1024px | Sidebar visible |
| Desktop | 1024–1280px | Full desktop layout |
| Large Desktop | >1280px | Expanded grid |

### Collapsing Strategy
- Sidebar: full → collapsed → hidden
- Album grid: 5 columns → 3 → 2 → 1
- Now-playing bar: maintained at all sizes
- Search: pill input maintained, width adjusts
- Navigation: sidebar → bottom bar on mobile

## 9. Agent Prompt Guide

### Quick Color Reference
- Background: Near Black (`#121212`)
- Surface: Dark Card (`#181818`)
- Text: White (`#ffffff`)
- Secondary text: Silver (`#b3b3b3`)
- Accent: Spotify Green (`#1ed760`)
- Border: `#4d4d4d`
- Error: Negative Red (`#f3727f`)

### Example Component Prompts
- "Create a dark card: #181818 background, 8px radius. Title at 16px SpotifyMixUI weight 700, white text. Subtitle at 14px weight 400, #b3b3b3. Shadow rgba(0,0,0,0.3) 0px 8px 8px on hover."
- "Design a pill button: #1f1f1f background, white text, 9999px radius, 8px 16px padding. 14px SpotifyMixUI weight 700, uppercase, letter-spacing 1.4px."
- "Build a circular play button: Spotify Green (#1ed760) background, #000000 icon, 50% radius, 12px padding."
- "Create search input: #1f1f1f background, white text, 500px radius, 12px 48px padding. Inset border: rgb(124,124,124) 0px 0px 0px 1px inset."
- "Design navigation sidebar: #121212 background. Active items: 14px weight 700, white. Inactive: 14px weight 400, #b3b3b3."

### Iteration Guide
1. Start with #121212 — everything lives in near-black darkness
2. Spotify Green for functional highlights only (play, active, CTA)
3. Pill everything — 500px for large, 9999px for small, 50% for circular
4. Uppercase + wide tracking on buttons — the systematic label voice
5. Heavy shadows (0.3–0.5 opacity) for elevation — light shadows are invisible on dark
6. Album art provides all the color — the UI stays achromatic

# ============================================================
# TAB: VIAGENS — Travel / destinations
# Primary: Airbnb (warm coral, photography-driven, rounded)
# Accent: Tesla (radical subtraction, full-viewport photography, near-zero chrome)
# Goal: luxury travel magazine — destination photos are the star
# ============================================================
---
version: alpha
name: Airbnb-design-analysis
description: A warm, generous consumer marketplace anchored on a clean white canvas and Airbnb Rausch (#ff385c), the single brand voltage that carries every primary CTA, search-button orb, and rating dot. Type runs Airbnb Cereal VF at modest weights — display sits at 22–28px in weight 500/600 rather than the heavy 700+ that fintech and enterprise systems use; the brand trusts photography and generous whitespace over typographic muscle. Three product entries (Homes, Experiences, Services) sit in the top nav with hand-illustrated 32-icon glyphs and "NEW" badges, signaling a marketplace expansion rather than a feature dump. Pill-shaped search bars (`{rounded.full}`), softly rounded property cards (`{rounded.lg}` ~14px), and 32px button radii read as friendly and human — there is no hard corner anywhere except the body grid.

colors:
  primary: "#ff385c"
  primary-active: "#e00b41"
  primary-disabled: "#ffd1da"
  primary-error-text: "#c13515"
  primary-error-text-hover: "#b32505"
  luxe: "#460479"
  plus: "#92174d"
  ink: "#222222"
  body: "#3f3f3f"
  muted: "#6a6a6a"
  muted-soft: "#929292"
  hairline: "#dddddd"
  hairline-soft: "#ebebeb"
  border-strong: "#c1c1c1"
  canvas: "#ffffff"
  surface-soft: "#f7f7f7"
  surface-card: "#ffffff"
  surface-strong: "#f2f2f2"
  on-primary: "#ffffff"
  on-dark: "#ffffff"
  legal-link: "#428bff"
  star-rating: "#222222"
  scrim: "#000000"

typography:
  display-xl:
    fontFamily: "'Airbnb Cereal VF', Circular, -apple-system, system-ui, Roboto, 'Helvetica Neue', sans-serif"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.43
    letterSpacing: 0
  display-lg:
    fontFamily: "'Airbnb Cereal VF', Circular, sans-serif"
    fontSize: 22px
    fontWeight: 500
    lineHeight: 1.18
    letterSpacing: -0.44px
  display-md:
    fontFamily: "'Airbnb Cereal VF', Circular, sans-serif"
    fontSize: 21px
    fontWeight: 700
    lineHeight: 1.43
    letterSpacing: 0
  display-sm:
    fontFamily: "'Airbnb Cereal VF', Circular, sans-serif"
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.20
    letterSpacing: -0.18px
  title-md:
    fontFamily: "'Airbnb Cereal VF', Circular, sans-serif"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: 0
  title-sm:
    fontFamily: "'Airbnb Cereal VF', Circular, sans-serif"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: 0
  rating-display:
    fontFamily: "'Airbnb Cereal VF', Circular, sans-serif"
    fontSize: 64px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -1px
  body-md:
    fontFamily: "'Airbnb Cereal VF', Circular, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  body-sm:
    fontFamily: "'Airbnb Cereal VF', Circular, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.43
    letterSpacing: 0
  caption:
    fontFamily: "'Airbnb Cereal VF', Circular, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.29
    letterSpacing: 0
  caption-sm:
    fontFamily: "'Airbnb Cereal VF', Circular, sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.23
    letterSpacing: 0
  badge:
    fontFamily: "'Airbnb Cereal VF', Circular, sans-serif"
    fontSize: 11px
    fontWeight: 600
    lineHeight: 1.18
    letterSpacing: 0
  micro-label:
    fontFamily: "'Airbnb Cereal VF', Circular, sans-serif"
    fontSize: 12px
    fontWeight: 700
    lineHeight: 1.33
    letterSpacing: 0
  uppercase-tag:
    fontFamily: "'Airbnb Cereal VF', Circular, sans-serif"
    fontSize: 8px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: 0.32px
    textTransform: uppercase
  button-md:
    fontFamily: "'Airbnb Cereal VF', Circular, sans-serif"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: 0
  button-sm:
    fontFamily: "'Airbnb Cereal VF', Circular, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.29
    letterSpacing: 0
  link:
    fontFamily: "'Airbnb Cereal VF', Circular, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.43
    letterSpacing: 0
  nav-link:
    fontFamily: "'Airbnb Cereal VF', Circular, sans-serif"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: 0

rounded:
  none: 0px
  xs: 4px
  sm: 8px
  md: 14px
  lg: 20px
  xl: 32px
  full: 9999px

spacing:
  xxs: 2px
  xs: 4px
  sm: 8px
  md: 12px
  base: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 64px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.sm}"
    padding: 14px 24px
    height: 48px
  button-primary-active:
    backgroundColor: "{colors.primary-active}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
  button-primary-disabled:
    backgroundColor: "{colors.primary-disabled}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
    rounded: "{rounded.sm}"
    padding: 13px 23px
    height: 48px
  button-tertiary-text:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
  button-pill-rausch:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-sm}"
    rounded: "{rounded.full}"
    padding: 10px 20px
  search-orb:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.full}"
    height: 48px
  icon-button-circle:
    backgroundColor: "{colors.surface-strong}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    height: 32px
  icon-button-outline:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    height: 40px
  top-nav:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.nav-link}"
    height: 80px
  product-tab-active:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.nav-link}"
    rounded: "{rounded.none}"
  product-tab-inactive:
    backgroundColor: transparent
    textColor: "{colors.muted}"
    typography: "{typography.nav-link}"
  search-bar-pill:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.full}"
    padding: 14px 24px
    height: 64px
  search-field-segment:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    padding: 8px 24px
  category-strip:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.muted}"
    typography: "{typography.button-sm}"
  category-tab-active:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.button-sm}"
    rounded: "{rounded.none}"
  property-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
  property-card-photo:
    rounded: "{rounded.md}"
  experience-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.title-md}"
    rounded: "{rounded.md}"
  city-link-block:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.title-sm}"
  rating-display-card:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.rating-display}"
  guest-favorite-badge:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.badge}"
    rounded: "{rounded.full}"
    padding: 4px 10px
  new-tag:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.uppercase-tag}"
    rounded: "{rounded.full}"
    padding: 2px 6px
  amenity-row:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    padding: 12px 0
  reviews-card:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
  host-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 24px
  reservation-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 24px
  date-picker-day:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.full}"
  date-picker-day-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.full}"
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 14px 12px
    height: 56px
  footer-light:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    padding: 48px 80px
  footer-link:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
  legal-band:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.muted}"
    typography: "{typography.caption-sm}"
---

## Overview

Airbnb is the canonical example of a generous, photography-led consumer marketplace. The base canvas is **pure white** (`{colors.canvas}` — #ffffff) with deep near-black ink (`{colors.ink}` — #222222) for headlines and body, and a single voltage of **Rausch** (`{colors.primary}` — #ff385c) carrying every primary CTA, the search-button orb, the heart save state, and inline brand links. There is no secondary brand color in mainline marketing — the **Luxe purple** (`{colors.luxe}` — #460479) and **Plus magenta** (`{colors.plus}` — #92174d) tokens are sub-brand accents that only appear inside Airbnb Luxe / Plus contexts.

Type runs **Airbnb Cereal VF** (a custom variable font Airbnb licenses), with **Circular** as the historic in-house fallback and a system stack underneath. Cereal sits at modest weights — display headlines render at 22–28px in weight 500–600, not the heavy 700+ weights that financial or enterprise systems lean on. The hero h1 ("Inspiration for future getaways") on the homepage is just 28px / 700, which would feel small on a typical SaaS page; here it works because the layout leans on photography (city collage, property cards) for visual weight rather than typographic muscle.

The shape language is **soft**. Buttons are 8px radius (`{rounded.sm}`), property cards are ~14px (`{rounded.md}`), the search bar is fully pill-shaped (`{rounded.full}`), wishlist hearts and search orbs are circles (`{rounded.full}`), and category strip rounded corners run at 32px (`{rounded.xl}`). There is essentially no hard corner anywhere except the body grid itself — every interactive element is rounded.

**Key Characteristics:**
- Single accent color: `{colors.primary}` (#ff385c — "Rausch") carries every primary CTA, the search orb, the heart save state, and the brand wordmark. Used scarcely — most pages are 90% white + ink with one or two Rausch moments.
- Custom variable type: `Airbnb Cereal VF`. Display weights sit at 500–700, body at 400. Modest weight is intentional — the system trusts photography for visual heft.
- Three-product top nav: Homes, Experiences, Services — each with a hand-illustrated 32px icon and "NEW" badges (`{component.new-tag}`) on the two newer products. Active tab uses an underline rule (`{component.product-tab-active}`).
- Pill-shaped global search bar: white surface, fully rounded (`{rounded.full}`), divided by 1px hairlines into Where / When / Who segments, terminated by a circular Rausch search orb (`{component.search-orb}`).
- Property cards are photo-first: aspect-ratio rectangles with `{rounded.md}` corner clipping, swipeable image carousel, "Guest favorite" floating badge top-left, heart icon top-right, then 4–5 lines of meta beneath.
- Editorial dropdowns (footer, language picker) are clean text columns over the white canvas — no card surface, no shadow.
- The design system caps elevation at one shadow tier (`box-shadow: rgba(0,0,0,0.02) 0 0 0 1px, rgba(0,0,0,0.04) 0 2px 6px, rgba(0,0,0,0.1) 0 4px 8px`) — used on hover-floated cards and search/account dropdowns.
- 8px base spacing system, with major sections at `{spacing.section}` (64px) — generous but not airy enough to feel editorial-magazine; the marketplace density wants more cards per scroll.

## Colors

### Brand & Accent
- **Rausch** (`{colors.primary}` — #ff385c): The single brand color. Used for primary CTA backgrounds (Reserve, Continue), the search orb, the heart save state on property cards, and inline brand links. The most recognizable color in consumer travel.
- **Rausch Active** (`{colors.primary-active}` — #e00b41): The press / pointer-down variant — slightly more saturated. Used on `{component.button-primary-active}`.
- **Rausch Disabled** (`{colors.primary-disabled}` — #ffd1da): A pale tint used on disabled CTAs.
- **Luxe Purple** (`{colors.luxe}` — #460479): Sub-brand accent for Airbnb Luxe. Only appears inside Luxe-branded surfaces — never in mainline marketing.
- **Plus Magenta** (`{colors.plus}` — #92174d): Sub-brand accent for Airbnb Plus. Same scoping as Luxe — sub-product only.

### Surface
- **Canvas** (`{colors.canvas}` — #ffffff): The default page floor for every public page. Airbnb does not have a dark mode on the public web.
- **Surface Soft** (`{colors.surface-soft}` — #f7f7f7): The lightest fill — used on disabled fields, sub-nav hover backgrounds, and the inline search filter band.
- **Surface Strong** (`{colors.surface-strong}` — #f2f2f2): Slightly heavier fill — circular icon-button surface (e.g., the breadcrumb back-arrow and listing toolbar buttons).

### Hairlines & Borders
- **Hairline** (`{colors.hairline}` — #dddddd): The default 1px border tone — search bar dividers, table separators, footer column splitters, card 1px borders.
- **Hairline Soft** (`{colors.hairline-soft}` — #ebebeb): A lighter divider used on long-scrolling editorial body separators.
- **Border Strong** (`{colors.border-strong}` — #c1c1c1): A heavier stroke used on disabled outline buttons and form input outlines after focus.

### Text
- **Ink** (`{colors.ink}` — #222222): The dominant text color on light surfaces. Display headlines, body paragraphs, primary nav links, and most inline link text. Never pure black.
- **Body** (`{colors.body}` — #3f3f3f): A secondary running-text color used inside long-form review and amenity copy where ink would feel too heavy.
- **Muted** (`{colors.muted}` — #6a6a6a): Sub-titles inside city link blocks ("Cottage rentals", "Villa rentals"), inactive product-tab labels, footer category sub-labels, "View all" links.
- **Muted Soft** (`{colors.muted-soft}` — #929292): Disabled link text. Used very sparingly.
- **Star Rating** (`{colors.star-rating}` — #222222): The same ink token — Airbnb's star icon and "4.81" rating numbers all render in ink rather than a yellow/gold color, which is a deliberate brand choice (yellow stars feel cheap in travel context).
- **On Primary** (`{colors.on-primary}` — #ffffff): White text on Rausch CTAs.

### Semantic
- **Error** (`{colors.primary-error-text}` — #c13515): Inline error text for form validation. Distinct from Rausch — slightly darker, more saturated red.
- **Error Hover** (`{colors.primary-error-text-hover}` — #b32505): Darkens on link hover.
- **Legal Link Blue** (`{colors.legal-link}` — #428bff): Inline links inside legal copy (Privacy, Terms). Only used inside the legal sub-band.

### Scrim
- **Scrim** (`{colors.scrim}` — #000000 at 50% opacity): The global modal backdrop tone — date picker, login dialog, language picker. Stored as the base hex; opacity is applied at render time.

## Typography

### Font Family
The system runs **Airbnb Cereal VF** for everything — display, body, navigation, captions, microcopy. Fallbacks walk `Circular, -apple-system, system-ui, Roboto, "Helvetica Neue", sans-serif`. **Circular** is the historic in-house typeface still kept as the first non-variable fallback; system stacks back it up.

There is no separate display family. The variable font carries the entire scale.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.rating-display}` | 64px | 700 | 1.1 | -1px | Listing detail rating display ("4.81") |
| `{typography.display-xl}` | 28px | 700 | 1.43 | 0 | Homepage h1 ("Inspiration for future getaways") |
| `{typography.display-lg}` | 22px | 500 | 1.18 | -0.44px | Listing detail h1 ("Close to Fethiye Aliyah Bali Beach…") |
| `{typography.display-md}` | 21px | 700 | 1.43 | 0 | Section heads inside listing detail ("What this place offers") |
| `{typography.display-sm}` | 20px | 600 | 1.20 | -0.18px | Sub-section titles ("Things to know") |
| `{typography.title-md}` | 16px | 600 | 1.25 | 0 | City link block titles ("Wilmington", "Athens") |
| `{typography.title-sm}` | 16px | 500 | 1.25 | 0 | Footer column heads ("Support", "Hosting", "Airbnb") |
| `{typography.body-md}` | 16px | 400 | 1.5 | 0 | Default running-text inside listing copy |
| `{typography.body-sm}` | 14px | 400 | 1.43 | 0 | Card meta lines, dates, prices, distance text |
| `{typography.caption}` | 14px | 500 | 1.29 | 0 | Search field segment labels ("Where", "When", "Who") |
| `{typography.caption-sm}` | 13px | 400 | 1.23 | 0 | Footer legal line ("© 2026 Airbnb, Inc.") |
| `{typography.badge}` | 11px | 600 | 1.18 | 0 | "Guest favorite" floating badge text |
| `{typography.micro-label}` | 12px | 700 | 1.33 | 0 | Card amenity micro-labels ("Inline 6") |
| `{typography.uppercase-tag}` | 8px | 700 | 1.25 | 0.32px (uppercase) | "NEW" badge on product nav tabs |
| `{typography.button-md}` | 16px | 500 | 1.25 | 0 | Primary CTA button labels |
| `{typography.button-sm}` | 14px | 500 | 1.29 | 0 | Pill button labels (category strip) |
| `{typography.link}` | 14px | 400 | 1.43 | 0 | Inline body links |
| `{typography.nav-link}` | 16px | 600 | 1.25 | 0 | Top product-nav labels (Homes, Experiences, Services) |

### Principles
Display weights stay modest. The homepage h1 at 28px / 700 is deliberately small — it tucks under the search bar so photography and the city-link grid carry visual hierarchy. The listing-detail h1 at 22px / 500 is even quieter; the listing photo banner does the work above it.

The single typographically loud moment in the entire system is the **rating display** (`{typography.rating-display}` — 64px / 700) on listing pages. That is the only place the system trusts type alone to carry hierarchy — rating numbers are a peak trust signal, so they get the loudest treatment.

### Note on Font Substitutes
If Airbnb Cereal VF and Circular are unavailable, **Inter** is the closest open-source substitute. Adjust display headlines down by ~2% in line-height to match Cereal's slightly tighter cap height; otherwise the proportions transfer cleanly.

## Layout

### Spacing System
- **Base unit:** 4px (with 2px micro-step).
- **Tokens:** `{spacing.xxs}` 2px · `{spacing.xs}` 4px · `{spacing.sm}` 8px · `{spacing.md}` 12px · `{spacing.base}` 16px · `{spacing.lg}` 24px · `{spacing.xl}` 32px · `{spacing.xxl}` 48px · `{spacing.section}` 64px.
- **Section padding (vertical):** `{spacing.section}` (64px) for major page bands; tighter than typical SaaS marketing (80–96px) because marketplace pages need higher card density per scroll.
- **Card internal padding:** `{spacing.lg}` (24px) for `{component.host-card}` and `{component.reservation-card}`; `{spacing.base}` (16px) for property-card meta block; `{spacing.sm}` (8px) for caption / date-row gutters.
- **Gutters:** `{spacing.base}` (16px) between cards in the homepage city grid; `{spacing.lg}` (24px) inside footer column gutters; `{spacing.xs}` (4px) on dense category-strip dividers.

### Grid & Container
- **Max content width:** ~1280px centered on the homepage and editorial pages. Listing detail pages cap closer to 1080px to keep the photo banner and reservation rail readable.
- **City link grid (homepage footer):** 6-column grid at desktop with each cell housing a city name in `{typography.title-md}` and a category sub-label in `{typography.body-sm}` muted.
- **Listing detail:** 2-column with photo / amenity body on the left (~64% width) and a sticky reservation card (`{component.reservation-card}`) on the right (~32%).
- **Footer:** 3-column link list (Support / Hosting / Airbnb) at desktop, collapsing to 1-column on mobile.

### Whitespace Philosophy
The system gives editorial bands 64px of vertical breathing room but compresses card grids — property and city-link cards sit just 16px apart. The contrast is intentional: the page reads as "open hero, dense marketplace below," reinforcing the marketplace nature without overwhelming the visitor at the fold.

## Elevation

The system has essentially **one shadow tier** plus the flat baseline.

- **Flat (no shadow):** Body, hero, footer, all editorial bands — 95% of surfaces.
- **Card hover float:** `box-shadow: rgba(0, 0, 0, 0.02) 0 0 0 1px, rgba(0, 0, 0, 0.04) 0 2px 6px 0, rgba(0, 0, 0, 0.1) 0 4px 8px 0` — applied to property cards on pointer hover, the search bar at rest, and the dropdown menus (account menu, language picker, date picker). This is the single shadow definition in the entire system.
- **Modal scrim:** `{colors.scrim}` rendered at 50% opacity — the global modal backdrop. Used on date pickers, login dialogs, language picker.

There are no progressive elevation tiers — the system either has the one shadow or none. Depth comes from photography, the white-on-white surface separation, and rounded-corner clipping rather than from layered shadows.

## Components

### Buttons

**`button-primary`** — Rausch fill, white text, 8px radius, 14×24px padding, 48px height, weight 500. The most common CTA across the system: "Reserve", "Continue", "Search", account-flow primaries.

**`button-primary-active`** — The press state. Background flips to `{colors.primary-active}`. No transform, no shadow change.

**`button-primary-disabled`** — Pale Rausch tint at #ffd1da with white text. Cursor not-allowed.

**`button-secondary`** — White fill with ink text and a 1px ink outline. 8px radius. Used for "Save", "Cancel", and inverse CTAs over Rausch surfaces.

**`button-tertiary-text`** — Plain ink text, no surface, no border. Underlined on hover. Used for "Show more" type links and modal close labels.

**`button-pill-rausch`** — A pill-shaped Rausch CTA used on featured cells (e.g., "Become a host" sub-CTA) — 9999px radius, 10×20px padding, 14px label.

### Search Surface

**`search-bar-pill`** — The signature global search bar. White fill, 9999px radius, 64px height, 1px hairline 1px-shadow border. Internally divided by vertical hairline rules into `{component.search-field-segment}` cells (Where / When / Who). Each segment holds an uppercase caption label above a placeholder line in `{typography.caption}`.

**`search-orb`** — The circular Rausch orb terminating the right edge of the search bar. 48×48px, fully rounded, white magnifying-glass icon centered. The hottest single color moment on the homepage.

### Top Navigation

**`top-nav`** — White surface, 80px height, 1px bottom hairline. The Airbnb wordmark sits flush left, the three product tabs (Homes / Experiences / Services) sit in the dead center, and account utilities (host link, language globe, account menu) sit flush right.

**`product-tab-active`** — Ink label in `{typography.nav-link}`, 32px hand-illustrated icon, 2px ink underline rule beneath the icon-label pair.

**`product-tab-inactive`** — Muted label, illustrated icon, no underline. Becomes active on click.

**`new-tag`** — A tiny rounded-pill badge (`{rounded.full}`) anchored top-right of an icon, carrying the uppercase "NEW" label in `{typography.uppercase-tag}` (8px / 700 with 0.32px tracking, uppercase). Used on Experiences and Services to signal recency.

### Listing Cards

**`property-card`** — A photo-first card. 1:1 aspect-ratio image with `{rounded.md}` corner clipping, image carousel dots overlay, "Guest favorite" floating badge top-left (`{component.guest-favorite-badge}`), and a heart icon top-right (`{component.icon-button-circle}` in default outlined state, Rausch-filled when saved). Beneath the image: 4–5 lines of meta — title (`{typography.title-md}`), distance / dates (`{typography.body-sm}` muted), and price ("$X night") right-aligned.

**`property-card-photo`** — The photo plate itself, separated as a token because some surfaces (wishlist, search results) reuse just the photo without the meta block.

**`experience-card`** — A taller-aspect card (4:5) for experience listings. Same `{rounded.md}` clipping, floating "NEW" badge top-left, heart top-right, and a single-line title beneath.

**`guest-favorite-badge`** — White rounded pill (`{rounded.full}`) at 11px / 600 weight. Sits over the photo with the system's only shadow tier applied for elevation.

### Listing Detail

**`rating-display-card`** — The signature listing-detail moment. A 64px / 700 rating number ("4.81") flanked left and right by tiny laurel-wreath SVG ornaments. Beneath the rating: "Guest favorite" tagline and a row of ink stat columns. The largest typographic weight in the whole system.

**`amenity-row`** — A 1-column list of amenity icons + ink labels in `{typography.body-md}`. 12px row padding, no border between rows; section is closed by a 1px hairline divider above and below.

**`reviews-card`** — A 2-column grid of review excerpts. Each column holds an author row (avatar, name, date) above a 3-line excerpt with "Show more" tertiary link.

**`host-card`** — A white card with `{rounded.md}` rounding and 24px padding holding a host avatar, name, "Superhost" badge, response-rate stat, and a "Contact host" `{component.button-secondary}`.

**`reservation-card`** — The sticky right-rail card on listing detail pages. White surface, `{rounded.md}` rounding, 1px hairline border, 1px shadow tier elevation, 24px padding. Contains: nightly price (`{typography.display-md}` ink), date-range selector, guest-count stepper, "Reserve" primary CTA full-width, and a fee breakdown stack beneath in `{typography.body-sm}`.

### Date Picker

**`date-picker-day`** — A 40×40px circular cell carrying the day number in `{typography.body-sm}`. Default state is transparent fill, ink text.

**`date-picker-day-selected`** — Ink fill, white text, full circle (`{rounded.full}`). Range states between two selected days carry a `{colors.surface-soft}` lozenge background that connects them.

### Forms

**`text-input`** — White surface, 1px hairline outline, `{rounded.sm}` 8px radius, 56px height, 14×12px padding. Stacked label above (in `{typography.caption}` muted), placeholder text in `{typography.body-md}` muted. On focus, the border thickens to 2px ink and the border color flips to `{colors.ink}` — no glow, no ring.

### Footer

**`footer-light`** — White surface (matches the page canvas — Airbnb has no contrast footer), 48×80px padding. Three columns of link blocks (Support / Hosting / Airbnb), separated by generous 24px gutters. Each column heads with a `{typography.title-sm}` ink label and stacks `{component.footer-link}` rows in `{typography.body-sm}` ink.

**`legal-band`** — A bottom strip beneath the footer columns carrying the copyright line, language picker (globe icon + "English (US)" link), currency picker, and social icons (Facebook, X, Instagram). All text in muted `{colors.muted}` at `{typography.caption-sm}`.

## Responsive Behavior

| Name | Width | Key Changes |
|---|---|---|
| Mobile | < 744px | Top nav collapses to logo + hamburger; product tabs hide behind a sheet; search bar collapses to a single tappable pill; property cards stack 1-up; city grid 1-column; listing detail collapses reservation card to a sticky bottom bar. |
| Tablet | 744–1128px | Top nav keeps product tabs but search bar narrows; property cards 2-up; city grid 2–3 column; reservation card stays sticky right-rail at narrower width. |
| Desktop | 1128–1440px | Full top nav with three product tabs centered; search bar at full pill width with all 3 segments visible; property cards 4-up; city grid 6-column; listing detail 2-column with reservation rail. |
| Wide | > 1440px | Content width caps at 1440px on listing/search pages and ~1280px on editorial; gutters absorb the rest. |

### Touch Targets
- Primary CTAs at minimum 48×48px (above WCAG AAA).
- Search orb is 48×48px circular — the most-tapped element on the page.
- Heart save button is 32×32px circular — borderline for AAA but compensated by a generous 12px padding inside the photo card.
- Date-picker day cells are 40×40px circular.

### Collapsing Strategy
- Top product tabs collapse into a hamburger sheet below 744px.
- Search bar's 3 segments collapse into a single-tap entry that opens a full-screen search overlay on mobile.
- Property and city-link grids drop column counts cleanly at each breakpoint — never reflow rows; always reduce columns.
- Reservation card on listing detail switches from sticky right-rail to a sticky bottom bar on mobile, carrying just the "Reserve" CTA + nightly price summary.

## Known Gaps

- **Hover state colors:** intentionally not documented per the global no-hover policy — Airbnb's actual `:hover` styling for property cards is a subtle elevation lift, but precise extraction is unreliable.
- **Loading states / skeleton screens:** not visible on the extracted surfaces.
- **Map view styling:** the search-results map uses Mapbox-tinted tiles with custom Rausch markers; not captured here.
- **Form input error states:** error text color (`{colors.primary-error-text}`) is documented, but the full input outline + helper-text combination on validation failure was not visible in the captured surfaces.
- **Sub-brand palettes:** Luxe (`{colors.luxe}`) and Plus (`{colors.plus}`) are documented as tokens, but their full sub-system (typography overrides, surface treatment) lives on separate sub-domains and is not captured here.

# --- Viagens accent: Tesla photography subtraction rules ---
# Design System Inspired by Tesla

## 1. Visual Theme & Atmosphere

Tesla's website is an exercise in radical subtraction — a digital showroom where the product is everything and the interface is almost nothing. The page opens with a full-viewport hero that fills the entire screen with cinematic car photography: three vehicles arranged on polished concrete against a hazy cityscape sky, with a single model name floating above in translucent white type. There are no decorative borders, no gradients, no patterns, no shadows. The UI exists only to provide just enough navigational structure to get out of the way. Every pixel that isn't product imagery is white space, and that restraint is the design system's most powerful statement.

The color philosophy is almost ascetic: a single blue (`#3E6AE1`) for primary calls to action, three shades of dark gray for text hierarchy, and white for everything else. The entire emotional weight is carried by photography — sprawling landscape shots, studio-lit vehicle profiles, and atmospheric environmental compositions that stretch edge-to-edge across each viewport-height section. The UI chrome dissolves into the imagery. The navigation bar floats above the hero with no visible background, border, or shadow — the TESLA wordmark and five navigation labels simply exist in the space, trusting the content beneath them to provide sufficient contrast.

Typography recently transitioned from Gotham to Universal Sans — a custom family split into "Display" for headlines and "Text" for body/UI elements — unifying the website, mobile app, and in-car software into a single typographic voice. The Display variant renders hero titles at 40px weight 500, while the Text variant handles everything from navigation (14px/500) to body copy (14px/400). The font carries a geometric precision with slightly humanist terminals that feels engineered rather than designed — exactly matching Tesla's brand identity of technology that doesn't need to announce itself. There are no text shadows, no text gradients, no decorative type treatments. Every letterform earns its place through clarity alone.

**Key Characteristics:**
- Full-viewport hero sections (100vh) dominated by cinematic car photography with minimal overlay UI
- Near-zero UI decoration: no shadows, no gradients, no borders, no patterns anywhere on the page
- Single accent color — Electric Blue (`#3E6AE1`) — used exclusively for primary CTA buttons
- Universal Sans font family (Display + Text) unifying web, app, and in-car interfaces
- Photography-first presentation where product imagery carries all emotional weight
- Frosted-glass navigation concept with transparent/white nav that floats over hero content
- 0.33s cubic-bezier transitions as the universal timing for all interactive state changes
- Carousel-driven hero with dot indicators and edge arrow navigation for multiple vehicle showcases
- "Ask a Question" persistent chatbot bar anchored to the viewport bottom

## 2. Color Palette & Roles

### Primary
- **Electric Blue** (`#3E6AE1`): Primary CTA button background — a confident, mid-saturation blue (rgb 62, 106, 225) that stands alone as the only chromatic color in the entire interface. Used exclusively for "Order Now" and other primary action buttons
- **Pure White** (`#FFFFFF`): Dominant background color for all surfaces, panels, navigation, and secondary button fills — the canvas that lets photography breathe

### Secondary & Accent
- **Promo Blue** (`#3E6AE1`): Blue also serves for promotional text ("0% APR Available") displayed over hero imagery in the same hue as the CTA — creating a visual link between incentive messaging and action
- No secondary accent colors exist. Tesla deliberately avoids color variety to maintain extreme visual discipline

### Surface & Background
- **White Canvas** (`#FFFFFF`): Page background, navigation panel, dropdown menus, and all surface containers
- **Light Ash** (`#F4F4F4`): Subtle alternate surface for section differentiation — barely perceptible shift from pure white (rgb 244, 244, 244)
- **Carbon Dark** (`#171A20`): Dark surface color for hero text overlays and potential dark-mode contexts (rgb 23, 26, 32) — a warm near-black with a blue undertone
- **Frosted Glass** (`rgba(255, 255, 255, 0.75)`): Semi-transparent white for navigation backdrop-filter effects on scroll

### Neutrals & Text
- **Carbon Dark** (`#171A20`): Primary heading and navigation text — the darkest text value (rgb 23, 26, 32), used for model names, nav labels, and hero titles on light backgrounds
- **Graphite** (`#393C41`): Body text and secondary content (rgb 57, 60, 65) — the default paragraph color, slightly warmer than pure gray
- **Pewter** (`#5C5E62`): Tertiary text for sub-links, secondary navigation links like "Learn" and "Order" (rgb 92, 94, 98)
- **Silver Fog** (`#8E8E8E`): Placeholder text in input fields and disabled states (rgb 142, 142, 142)
- **Cloud Gray** (`#EEEEEE`): Light borders and divider lines (rgb 238, 238, 238)
- **Pale Silver** (`#D0D1D2`): Subtle UI borders and delineation (rgb 208, 209, 210)

### Semantic & Accent
- Tesla's marketing site avoids semantic color coding (no green/red/yellow status indicators). Error, success, and warning states follow standard browser defaults in form contexts
- The blue CTA (`#3E6AE1`) serves as the sole interactive color signal

### Gradient System
- No gradients are used anywhere in the interface
- Depth is achieved entirely through photography, whitespace, and the binary contrast between full-bleed imagery and clean white surfaces
- The navigation achieves layering through opacity (frosted glass effect) rather than gradient or shadow

## 3. Typography Rules

### Font Family
- **Display**: `Universal Sans Display`, -apple-system, Arial, sans-serif — used for hero titles and large model names. A geometric sans-serif with precisely engineered proportions, recently replacing Gotham to unify Tesla's digital ecosystem (website, mobile app, vehicle interface)
- **Text/UI**: `Universal Sans Text`, -apple-system, Arial, sans-serif — used for navigation, body copy, buttons, and all UI text. Optimized for legibility at smaller sizes with slightly wider proportions than the Display variant
- **No OpenType features** detected — typography is completely unembellished
- **No italic variants** observed on the marketing site

### Hierarchy

| Role | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|--------|-------------|----------------|-------|
| Hero Title | 40px (2.50rem) | 500 | 48px (1.20) | normal | Universal Sans Display, white on dark hero imagery |
| Product Name | 17px (1.06rem) | 500 | 20px (1.18) | normal | Universal Sans Text, model names in nav panel and cards |
| Nav Item | 14px (0.88rem) | 500 | 16.8px (1.20) | normal | Universal Sans Text, primary navigation labels |
| Body Text | 14px (0.88rem) | 400 | 20px (1.43) | normal | Universal Sans Text, paragraph and descriptive content |
| Button Label | 14px (0.88rem) | 500 | 16.8px (1.20) | normal | Universal Sans Text, CTA button text |
| Sub-link | 14px (0.88rem) | 400 | 20px (1.43) | normal | Tertiary links (Learn, Order, Experience) |
| Promo Text | 22px (1.38rem) | 400 | 20px (0.91) | normal | White promotional text on hero ("0% APR Available") |
| Category Label | 16px (est.) | 500 | — | normal | White text labels on category cards ("Sport Sedan") |

### Principles
- **"Normal" letter-spacing everywhere**: Unlike most modern tech brands that use negative tracking for headlines, Tesla uses default letter-spacing at every level. This reflects a philosophy that the typeface should speak for itself without manipulation
- **Weight restraint**: Only two weights appear — 500 (medium) for headings/UI and 400 (regular) for body. No bold (700), no light (300). The system avoids typographic drama
- **Unified font sizing**: Most UI text clusters at 14px with only hero titles (40px) and promo text (22px) breaking away. This extreme uniformity creates a sense of engineered consistency
- **Display vs Text split**: The two-variant system (Display for hero, Text for UI) creates subtle optical correction without visible stylistic difference — they appear as the same typeface at different sizes
- **No text transforms**: No uppercase text appears in the main navigation or CTAs — the lowercase approach reinforces Tesla's understated confidence

## 4. Component Stylings

### Buttons
All buttons use barely-rounded rectangles (4px border-radius) — creating a sharp, technical aesthetic that mirrors the precision of the vehicles.

**Primary CTA** — The main action button:
- Default: bg `#3E6AE1` (Electric Blue), text `#FFFFFF`, fontSize 14px, fontWeight 500, padding 4px with inner content centering, borderRadius 4px, minHeight 40px, width 200px
- Border: 3px solid transparent (reserves space for focus/active border animation)
- Box Shadow: `rgba(0,0,0,0) 0px 0px 0px 2px inset` (invisible at rest, animates to visible on focus)
- Transition: `border-color 0.33s, background-color 0.33s, color 0.33s, box-shadow 0.25s`
- Hover: subtle darkening of blue background
- Used for: "Order Now" calls to action

**Secondary CTA** — The alternative action button:
- Default: bg `#FFFFFF`, text `#393C41` (Graphite), same dimensions and border pattern as primary
- Transition: identical timing to primary (0.33s)
- Used for: "View Inventory" alongside primary CTA

**Nav Button** — Top navigation items:
- Default: bg transparent, text `#171A20` (Carbon Dark), fontSize 14px, fontWeight 500, borderRadius 4px, padding 4px 16px, minHeight 32px
- Transition: `color 0.33s, background-color 0.33s`
- Active/expanded: subtle background highlight
- Used for: "Vehicles", "Energy", "Charging", "Discover", "Shop"

**Text Link** — In-content actions:
- Default: text `#5C5E62` (Pewter), fontSize 14px, fontWeight 400, no background, no border
- Hover: underline decoration with box-shadow transition
- Transition: `box-shadow 0.33s cubic-bezier(0.5, 0, 0, 0.75), color 0.33s`
- Used for: "Learn", "Order", "Experience", "New", "Pre-Owned" links in dropdown panel

### Cards & Containers

**Vehicle Card** (Navigation panel):
- Background: transparent (inherits panel white)
- Border: none
- Shadow: none
- Content: vehicle image (transparent PNG) + model name centered below + two text links
- Layout: 3-column grid within the dropdown panel
- No hover animation on the card itself — interaction is via the text links beneath

**Category Card** (Homepage lower section):
- Background: full-bleed landscape photography
- Border radius: approximately 12px (subtly rounded)
- Overflow: hidden (clips image to rounded corners)
- Text: white label in top-left corner ("Sport Sedan", "Midsize SUV")
- Size: large format, approximately 2:1 aspect ratio
- No shadow, no border, no overlay gradient — text relies on image darkness for contrast

### Inputs & Forms
- Background: transparent
- Text color: `#171A20` (Carbon Dark)
- Placeholder color: `#8E8E8E` (Silver Fog)
- Border: minimal, inherits from browser defaults
- Font: Universal Sans Text, 14px
- The "Ask a Question" chatbot input bar sits at the viewport bottom with a clean white background and subtle border

### Navigation
- **Desktop**: Centered horizontal nav with TESLA wordmark (spaced uppercase letters) on the left, five category buttons center-aligned, and three icon buttons (help, globe/language, account) on the right
- **Background**: White (transitions from transparent over dark hero to opaque white on scroll via class toggle `tds-site-header--white-background`)
- **Dropdown panel**: Full-width white panel with 3-column vehicle grid + right sidebar text links, no shadow, no border — appears seamlessly below the nav
- **Sticky behavior**: `sticky-without-slide` class — stays at top without slide-in animation
- **Mobile**: Hamburger collapse pattern
- **No visible separator** between nav and content — the nav blends with the hero

### Image Treatment
- **Hero**: Full-viewport (100vh) sections with cinematic photography — edge-to-edge, no padding, no margin
- **Vehicle images**: Transparent PNG renders on white background in dropdown panel, studio-quality 3/4 angle shots
- **Category cards**: Landscape photography with approximately 2:1 ratio, rounded corners (12px)
- **Carousel**: Auto-advancing with dot indicators (3 dots) and left/right arrow navigation on edges
- **Lazy loading**: Below-fold sections use lazy loading, rendering as blank white until scrolled into view

### Persistent Chat Bar
- Anchored to viewport bottom, visible across all sections
- White background with subtle border
- Contains: chat icon + "Ask a Question" label + placeholder text ("What's Dog Mode?") + send icon + "Schedule a Drive Today" secondary CTA
- Schedule CTA has a teal/blue icon accent

## 5. Layout Principles

### Spacing System
- **Base unit**: 8px
- **Common values**: 8px (0.5rem), 16px (1rem), 21.44px (1.34rem)
- **Button padding**: 4px (minimal outer) with content centering via flexbox, 4px 16px for nav items
- **Section padding**: Full-viewport sections with content centered vertically
- **Card gap**: approximately 16px between category cards

### Grid & Container
- **Max width**: approximately 1383px (full viewport width used for most content)
- **Hero**: Full-bleed, edge-to-edge, 100vh sections
- **Navigation panel**: 3-column grid for vehicle cards with right-aligned text sidebar (~70/30 split)
- **Category cards**: 2-up horizontal layout (large left card + smaller right card)

### Whitespace Philosophy
Tesla uses whitespace as a luxury signal. The generous vertical spacing between sections (each section is a full viewport height) means you can only see one "message" at a time — one car, one model name, one CTA pair. This creates a gallery-like browsing experience where each scroll is a deliberate transition, not a continuous feed. White space is not empty — it's the frame that elevates each vehicle to the status of art piece.

### Border Radius Scale
| Value | Context |
|-------|---------|
| 0px | Most elements — sharp edges are the default |
| 4px | Buttons (primary, secondary, nav items) — barely perceptible rounding |
| ~12px | Category cards — noticeable but restrained rounding on larger surfaces |
| 50% | Carousel dot indicators — perfect circles |

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Level 0 (Flat) | No shadow, no border | Default state for all elements — cards, panels, buttons at rest |
| Level 1 (Frost) | `rgba(255,255,255,0.75)` backdrop | Navigation bar on scroll — frosted glass transparency |
| Level 2 (Overlay) | `rgba(128,128,128,0.65)` | Modal overlays and region/cookie popups |
| Level 3 (Subtle) | `rgba(0,0,0,0.05)` | Minimal shadow hints on rare hover states |

### Shadow Philosophy
Tesla's approach to elevation is essentially "none." The site avoids box-shadows entirely in its primary interface. Depth is communicated through three alternative strategies:
1. **Z-index layering**: The sticky navigation sits above hero content through positioning, not shadow
2. **Opacity-based transparency**: The frosted glass nav and overlay modals use background-color opacity rather than shadow to indicate layering
3. **Photography-as-depth**: The full-bleed images create their own visual depth through perspective, lighting, and composition — making UI shadows redundant

### Decorative Depth
- No gradients, glows, or atmospheric effects on UI elements
- The hero imagery itself provides all visual richness — sunset skies, reflected light on car surfaces, ground shadows from studio lighting
- The carousel arrow buttons use a semi-transparent white background to float above the hero imagery without disrupting it

## 7. Do's and Don'ts

### Do
- Let photography dominate every screen — the product IS the design
- Use Electric Blue (`#3E6AE1`) exclusively for primary CTAs — never for decorative purposes
- Maintain viewport-height sections for major content blocks — one message per screen
- Keep typography at weight 400-500 only — no bold, no light, no extremes
- Use 4px border-radius for all interactive elements — precision over playfulness
- Trust whitespace as a luxury signal — never fill available space just because it's empty
- Keep all transitions at 0.33s — consistency in motion is as important as consistency in color
- Use transparent PNG vehicle imagery on white backgrounds for product showcases
- Center CTAs horizontally below model names — the vertical rhythm is model → subtitle → buttons
- Maintain the Display/Text font split — Display for hero-scale text only, Text for everything else

### Don't
- Add shadows to any element — elevation through shadow contradicts the flat, gallery aesthetic
- Use more than one chromatic color besides the blue CTA — the palette is intentionally monochrome-plus-one
- Apply gradients, patterns, or decorative backgrounds to surfaces — white and photography are the only backgrounds
- Use text larger than 40px on the web — the typography is deliberately restrained even at hero scale
- Add borders to cards or containers — separation is achieved through spacing, not lines
- Use uppercase text transforms — Tesla's confidence is expressed through lowercase calm
- Introduce rounded-pill buttons or large border-radii — the 4px radius is deliberate and precise
- Override the Universal Sans family with other typefaces — cross-platform consistency is a core brand value
- Add hover animations with scale/translate transforms — Tesla's interactions are color-only (background and border transitions)
- Clutter the viewport with multiple CTAs — every screen should have at most two action buttons

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | <768px | Single-column layout, hamburger nav replaces horizontal labels, hero text scales to ~28px, CTA buttons stack vertically, category cards become full-width |
| Tablet | 768-1024px | 2-column nav panel, hero maintains full-viewport height, CTAs remain side-by-side, reduced horizontal padding |
| Desktop | 1024-1440px | Full horizontal nav, 3-column vehicle grid in dropdown, hero at 40px, side-by-side CTAs at 200px/160px width |
| Large Desktop | >1440px | Content remains centered, hero photography scales to fill wider viewports, max-width container for nav panel content |

### Touch Targets
- Primary CTA buttons: 200px × 40px minimum (well above 44×44px WCAG requirement)
- Nav buttons: minimum 32px height with 4px 16px padding — adequate touch targets
- Carousel arrows: ~44px square white semi-transparent buttons at viewport edges
- Text links ("Learn", "Order"): 14px text with adequate line-height spacing for touch

### Collapsing Strategy
- **Navigation**: Horizontal category buttons (Vehicles, Energy, Charging, Discover, Shop) collapse to a hamburger/drawer menu on mobile
- **Hero CTA pair**: Side-by-side buttons on desktop stack vertically on mobile
- **Category cards**: 2-up horizontal layout collapses to single-column full-width on mobile
- **Vehicle grid**: 3-column grid in desktop nav panel becomes 2-column on tablet, single-column on mobile
- **Spacing**: Section vertical padding remains generous (viewport-height sections) but horizontal padding reduces

### Image Behavior
- Hero images are fully responsive and fill the entire viewport at every breakpoint
- Vehicle carousel images use `object-fit: cover` to maintain cinematic composition across widths
- Transparent PNG vehicle images in the nav panel scale proportionally within their grid cells
- Category card images maintain their landscape ratio and clip via `overflow: hidden` with border-radius

## 9. Agent Prompt Guide

### Quick Color Reference
- Primary CTA: "Electric Blue (#3E6AE1)"
- Background: "Pure White (#FFFFFF)"
- Heading text: "Carbon Dark (#171A20)"
- Body text: "Graphite (#393C41)"
- Tertiary text: "Pewter (#5C5E62)"
- Placeholder: "Silver Fog (#8E8E8E)"
- Alternate surface: "Light Ash (#F4F4F4)"
- Dark surface: "Carbon Dark (#171A20)"

### Example Component Prompts
- "Create a hero section with a full-viewport background image, centered 'Model Y' title in Universal Sans Display at 40px weight 500 in white, a subtitle line below, and two buttons side by side: a primary Electric Blue (#3E6AE1) 'Order Now' button and a secondary white 'View Inventory' button, both with 4px border-radius and 40px height"
- "Design a navigation bar with a spaced-letter wordmark on the left, five text buttons (14px, weight 500, Carbon Dark #171A20) centered, and three icon buttons on the right, all on a white background with no shadow or border"
- "Build a vehicle card grid with 3 columns, each card showing a transparent-background car image above a model name (17px, weight 500, Carbon Dark) and two text links (14px, weight 400, Pewter #5C5E62) labeled 'Learn' and 'Order', on a pure white surface with no borders or shadows"
- "Create a category card with full-bleed landscape photography, 12px border-radius, overflow hidden, and a white text label ('Sport Sedan') positioned in the top-left corner with no overlay gradient"
- "Design a persistent bottom bar with a chat input ('Ask a Question' placeholder), a send icon, and a secondary CTA ('Schedule a Drive Today') with a teal icon, anchored to the viewport bottom on a white background"

### Iteration Guide
When refining existing screens generated with this design system:
1. Focus on ONE component at a time — Tesla's system is so minimal that each element must be pixel-perfect
2. Reference specific color names and hex codes from this document — there are only 6-7 colors in the entire system
3. Use natural language descriptions, not CSS values — "barely rounded corners" not "border-radius: 4px"
4. Describe the desired "feel" alongside specific measurements — "gallery-like silence between sections" communicates the whitespace philosophy better than "margin-bottom: 100vh"
5. Always verify that photography is doing the emotional heavy-lifting — if the UI itself feels "designed," it's too much

# ============================================================
# TAB: SHOPPING — Visual discovery, wishlists, deals
# Primary: Pinterest (masonry grid, image-first, visual discovery)
# Accent: Shopify (dark cinematic surfaces, neon CTAs, product overlays)
# Goal: high-fashion catalog energy for product browsing
# ============================================================
---
version: alpha
name: Pinterest-design-analysis
description: |
  A photography-first discovery system organized around the Pinterest Red CTA, the masonry pin grid, and a soft warm-cream chrome that gets out of the imagery's way. The home page is a content-discovery tool wearing the chrome of a magazine publisher: 70px display headlines, friendly Pin Sans typography, fully-rounded pill buttons (16px) on a cream-tinted neutral palette, and a sticky red "Sign up" CTA that anchors every viewport. Pin imagery is the system's load-bearing visual element — square, portrait, and landscape pins tile in a column-based masonry grid where each tile is a fully-rounded 16px-radius card, separated by tight 8px gutters. The chrome is otherwise quiet: warm grays, true whites, and a single saturated red — no decorative gradients, no atmospheric backgrounds, no shadows beyond a soft modal scrim.

colors:
  primary: "#e60023"
  on-primary: "#ffffff"
  primary-pressed: "#cc001f"
  ink: "#000000"
  ink-soft: "#211922"
  body: "#33332e"
  charcoal: "#262622"
  mute: "#62625b"
  ash: "#91918c"
  stone: "#c8c8c1"
  hairline: "#dadad3"
  hairline-soft: "#e5e5e0"
  on-secondary: "#000000"
  secondary-bg: "#e5e5e0"
  secondary-pressed: "#c8c8c1"
  canvas: "#ffffff"
  surface-soft: "#fbfbf9"
  surface-card: "#f6f6f3"
  surface-elevated: "#ffffff"
  on-dark: "#ffffff"
  on-dark-mute: "rgba(255,255,255,0.7)"
  surface-dark: "#262622"
  focus-outer: "#435ee5"
  focus-inner: "#ffffff"
  accent-pressed-blue: "#617bff"
  accent-purple: "#7e238b"
  accent-purple-deep: "#6845ab"
  success-deep: "#103c25"
  success-pale: "#c7f0da"
  error: "#9e0a0a"
  error-deep: "#cc001f"

typography:
  display-xl:
    fontFamily: Pin Sans
    fontSize: 70px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -1.2px
  display-lg:
    fontFamily: Pin Sans
    fontSize: 44px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: -0.8px
  heading-xl:
    fontFamily: Pin Sans
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -1.2px
  heading-lg:
    fontFamily: Pin Sans
    fontSize: 22px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: 0
  heading-md:
    fontFamily: Pin Sans
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: 0
  body-md:
    fontFamily: Pin Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0
  body-strong:
    fontFamily: Pin Sans
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0
  body-sm:
    fontFamily: Pin Sans
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0
  body-sm-strong:
    fontFamily: Pin Sans
    fontSize: 14px
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: 0
  caption-md:
    fontFamily: Pin Sans
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: 0
  caption-sm:
    fontFamily: Pin Sans
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0
  link-md:
    fontFamily: Pin Sans
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0
  button-md:
    fontFamily: Pin Sans
    fontSize: 14px
    fontWeight: 700
    lineHeight: 1
    letterSpacing: 0
  button-sm:
    fontFamily: Pin Sans
    fontSize: 12px
    fontWeight: 700
    lineHeight: 1
    letterSpacing: 0

rounded:
  none: 0px
  sm: 8px
  md: 16px
  lg: 32px
  full: 9999px

spacing:
  xxs: 4px
  xs: 6px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
  section: 64px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
    padding: 6px 14px
    height: 40px
  button-primary-pressed:
    backgroundColor: "{colors.primary-pressed}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
  button-secondary:
    backgroundColor: "{colors.secondary-bg}"
    textColor: "{colors.on-secondary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
    padding: 6px 14px
    height: 40px
  button-secondary-pressed:
    backgroundColor: "{colors.secondary-pressed}"
    textColor: "{colors.on-secondary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
  button-tertiary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
  button-icon-circular:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    size: 40px
  button-pill-on-image:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
    rounded: "{rounded.full}"
    padding: 8px 14px
  button-disabled:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ash}"
    rounded: "{rounded.md}"
  search-bar:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.full}"
    padding: 11px 15px
    height: 48px
  search-bar-focused:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 11px 15px
    height: 44px
  text-input-focused:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
  pin-card:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: 0px
  pin-card-large:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: 0px
  pin-overlay-pill:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button-sm}"
    rounded: "{rounded.full}"
    padding: 6px 12px
  filter-chip:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
    rounded: "{rounded.full}"
    padding: 8px 16px
  filter-chip-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-dark}"
    typography: "{typography.button-md}"
    rounded: "{rounded.full}"
  category-tile:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.md}"
    padding: 16px
  feature-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.heading-xl}"
    rounded: "{rounded.md}"
    padding: 32px
  feature-card-soft:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.heading-xl}"
    rounded: "{rounded.md}"
    padding: 32px
  modal-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 32px
  hero-cta-strip:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.heading-xl}"
    rounded: "{rounded.none}"
    padding: 48px 32px
  primary-nav:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.none}"
    height: 64px
  footer-section:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.mute}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.none}"
    padding: 32px 24px
  link-inline:
    textColor: "{colors.ink-soft}"
    typography: "{typography.link-md}"
---

## Overview

Pinterest's marketing system is built around a single instructional principle: get out of the photograph's way. The chrome is a quiet warm-cream neutral palette (`{colors.surface-soft}`, `{colors.surface-card}`, `{colors.canvas}`) carrying typography in Pinterest's proprietary Pin Sans face, with Pinterest Red (`{colors.primary}` — `#e60023`) reserved exclusively for the "Sign up" CTA, the active-tab indicator, and the sticky top-nav anchor. Every other surface is allowed to fade behind the imagery — pin tiles, category tiles, content thumbnails, profile shots — that constitutes the actual product.

The design system has two distinct surface modes that alternate down the home page: the **hero/CTA chrome** (cream surfaces, large 70px Pin Sans display headlines, alternating left/right photo-illustrated feature cards) and the **content masonry** (a column-based grid of 16px-radius pin cards on `{colors.surface-card}` with no internal padding — the pin is the card). The search results page is almost pure masonry: a tight column grid of pin imagery in mixed aspect ratios, with a small filter-chip strip at the top and the sticky red Sign-up CTA in the upper-right corner. The `create.pinterest.com` business surface inverts the grid back to a more traditional editorial layout but keeps every other rule of the system: Pin Sans, cream chrome, red CTA, 16px-radius pills.

The system's signature gesture is **shape geometry**: 16px radius (`{rounded.md}`) for nearly every surface — buttons, inputs, pin cards, feature cards — and 32px radius (`{rounded.lg}`) reserved for pin-card-large and modal cards. There are exactly three radius values in active use: 16px, 32px, and pill (9999px). The system never goes flat (sharp corners) and never goes radius-medium — those two values are the entire shape vocabulary.

**Key Characteristics:**
- Single-accent CTA: Pinterest Red (`{colors.primary}`) carries every primary action; everything else is monochrome
- Pin Sans proprietary typography across every text role from `{typography.display-xl}` (70px) down to `{typography.caption-sm}` (12px) — no serif, no monospace anywhere
- Two-radius shape system: `{rounded.md}` (16px) for most components, `{rounded.lg}` (32px) for large cards and modals, `{rounded.full}` for circular elements
- Masonry pin grid as the load-bearing visual element — column-based layout where each pin's natural aspect ratio is preserved
- Warm-cream neutral chrome (`{colors.surface-card}` — #f6f6f3) that softly recedes behind imagery without competing
- Sticky top nav with the always-red Sign-up CTA anchored in the upper-right at every breakpoint
- Modal overlay (login/signup) using a soft scrim over the page content rather than a navigation jump

## Colors

> **Source pages:** `/` (home), `/search/pins/?q=bold lip` (search results), `create.pinterest.com/` (creator marketing), `create.pinterest.com/product-features/how-to-create-boards/` (creator article). The chrome palette is identical across all four pages.

### Brand & Accent
- **Pinterest Red** (`{colors.primary}` — `#e60023`): the brand's only highly-saturated color. Sign-up CTAs, sticky top-nav anchor, active state in tab strips, and the brand wordmark.
- **Pinterest Red Pressed** (`{colors.primary-pressed}` — `#cc001f`): pressed state for the primary button — a single notch deeper than brand red.

### Surface
- **Canvas** (`{colors.canvas}` — `#ffffff`): true white. The base surface for the primary nav, modals, feature cards, and content body.
- **Soft Surface** (`{colors.surface-soft}` — `#fbfbf9`): faintly cream-tinted off-white used for the page body wash on the home page hero.
- **Surface Card** (`{colors.surface-card}` — `#f6f6f3`): warm-cream card and pin-tile background. Carries category tiles, search-bar default fill, button-secondary default, and pin-card backgrounds.
- **Secondary BG** (`{colors.secondary-bg}` — `#e5e5e0`): the gray-cream used for `{component.button-secondary}` ("I already have an account") fill — a notch deeper than `{colors.surface-card}`.
- **Secondary Pressed** (`{colors.secondary-pressed}` — `#c8c8c1`): pressed state for the secondary button.
- **Surface Dark** (`{colors.surface-dark}` — `#262622`): warm near-black used in the rare dark CTA strip on `create.pinterest.com`.
- **Hairline** (`{colors.hairline}` — `#dadad3`): 1px row dividers, footer column rules.
- **Hairline Soft** (`{colors.hairline-soft}` — `#e5e5e0`): lighter inline divider; doubles as the secondary-button background.

### Text
- **Ink** (`{colors.ink}` — `#000000`): primary headlines, button text, primary nav links.
- **Ink Soft** (`{colors.ink-soft}` — `#211922`): inline-link color in body prose. The brand's only "color" beyond Pinterest Red used in chrome — a near-black with a faint warm cast.
- **Body** (`{colors.body}` — `#33332e`): default paragraph text on `{colors.canvas}`.
- **Charcoal** (`{colors.charcoal}` — `#262622`): subtly softer body where pure ink is too heavy.
- **Mute** (`{colors.mute}` — `#62625b`): metadata text, footer links, secondary captions.
- **Ash** (`{colors.ash}` — `#91918c`): disabled button text, placeholder text in inputs.
- **Stone** (`{colors.stone}` — `#c8c8c1`): least-emphasis utility text, disabled-state borders.
- **On Dark** (`{colors.on-dark}` — `#ffffff`): primary text on `{colors.surface-dark}`.

### Semantic
- **Error** (`{colors.error}` — `#9e0a0a`): validation messages, destructive confirmation copy.
- **Error Deep** (`{colors.error-deep}` — `#cc001f`): deepened error background where the regular error tone needs more contrast. Note: this matches the primary-pressed value but in error context represents semantic destructiveness.
- **Success Deep** (`{colors.success-deep}` — `#103c25`): in-product success messaging.
- **Success Pale** (`{colors.success-pale}` — `#c7f0da`): pale success-pill background.
- **Focus Outer** (`{colors.focus-outer}` — `#435ee5`): the system's focus-ring blue — appears as a 2px outer outline around focused inputs and buttons.
- **Focus Inner** (`{colors.focus-inner}` — `#ffffff`): white inner gap inside the focus-ring stack.

### Editorial Accents (used sparingly inside content imagery and category badges)
- **Accent Pressed Blue** (`{colors.accent-pressed-blue}` — `#617bff`): pressed state for blue informational badges and editorial pin chips.
- **Accent Purple** (`{colors.accent-purple}` — `#7e238b`): editorial recommendation badge, in-product "Pinterest Predicts" callout.
- **Accent Purple Deep** (`{colors.accent-purple-deep}` — `#6845ab`): paired dark for purple lockups and "Performance+" iconography.

## Typography

### Font Family
**Pin Sans** is Pinterest's proprietary geometric sans-serif used across every text role on every page. It carries weights 400 (regular), 500 (medium), 600 (semibold), and 700 (bold), and falls back through a long stack — `-apple-system` → `system-ui` → `Segoe UI` → `Roboto` → `Helvetica Neue` → `Arial` plus emoji fallbacks. The face's distinctive trait is its tight letter-spacing at display sizes (-1.2px on `{typography.display-xl}` and `{typography.heading-xl}`), which gives 70px headlines a confident, friendly density rather than the airy spread of more conventional display geometric sans faces.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.display-xl}` | 70px | 600 | 1.1 | -1.2px | Marketing hero headline ("Create the life you love on Pinterest") |
| `{typography.display-lg}` | 44px | 700 | 1.15 | -0.8px | "Where your content can thrive" creator hero |
| `{typography.heading-xl}` | 28px | 700 | 1.2 | -1.2px | Section heading ("Bring your favorite ideas to life", "Pinterest for your brand") |
| `{typography.heading-lg}` | 22px | 600 | 1.25 | 0 | Sub-section heading, modal title ("Welcome to Pinterest") |
| `{typography.heading-md}` | 18px | 600 | 1.3 | 0 | Card title, in-grid pin label |
| `{typography.body-md}` | 16px | 400 | 1.4 | 0 | Body copy, modal body, default paragraph |
| `{typography.body-strong}` | 16px | 600 | 1.4 | 0 | Inline emphasis, primary nav link, form label |
| `{typography.body-sm}` | 14px | 400 | 1.4 | 0 | Footer copy, in-grid pin metadata, helper text |
| `{typography.body-sm-strong}` | 14px | 700 | 1.4 | 0 | Search-result count label, table-header text |
| `{typography.caption-md}` | 12px | 500 | 1.5 | 0 | Caption text, link metadata |
| `{typography.caption-sm}` | 12px | 400 | 1.4 | 0 | Smallest utility text, copyright |
| `{typography.link-md}` | 16px | 600 | 1.4 | 0 | Inline anchor link in body prose |
| `{typography.button-md}` | 14px | 700 | 1 | 0 | Standard primary/secondary button label |
| `{typography.button-sm}` | 12px | 700 | 1 | 0 | Compact pill chip, in-card button |

### Principles
The system has an unusually steep size jump between display and body — `{typography.display-xl}` (70px) drops directly to `{typography.body-md}` (16px) on the home hero with no intermediate tier between. The negative tracking on the largest tiers (-1.2px / -0.8px) creates a tighter, more confident headline than a default geometric sans would deliver, and the body copy sits at a generous 1.4 line-height to keep multi-line descriptions breathing.

### Note on Font Substitutes
Pin Sans is proprietary. The closest open-source substitute is **Inter** (weights 400 / 500 / 600 / 700) — its geometry, x-height, and metric balance match Pin Sans within ~3% at body sizes. **Manrope** is a strong secondary substitute for the display tier where slightly tighter letterspacing helps the 70px headline feel weighted. Apply -1.2px tracking on the substitute at display sizes regardless of which substitute is chosen.

## Layout

### Spacing System
- **Base unit:** 8px (with finer 4/6/7px steps available for tight inline gaps in pill buttons and chips).
- **Tokens (front matter):** `{spacing.xxs}` (4px) · `{spacing.xs}` (6px) · `{spacing.sm}` (8px) · `{spacing.md}` (12px) · `{spacing.lg}` (16px) · `{spacing.xl}` (24px) · `{spacing.xxl}` (32px) · `{spacing.section}` (64px).
- **Universal section rhythm:** every page in the set uses `{spacing.section}` (64px) as the vertical gap between major content blocks. Pin grids use `{spacing.sm}` (8px) gutters between tiles — the tightest grid gutter in the system, designed so imagery effectively touches across columns.
- **Modal padding:** `{component.modal-card}` uses 32px internal padding (`{spacing.xxl}`) on all sides.

### Grid & Container
- **Max width:** ~1280px content area at desktop with 24px gutters (~48px at ultrawide).
- **Pin masonry grid:** auto-fitting column-based layout — 5–6 columns at ultrawide, 4 columns at desktop, 3 at tablet, 2 at mobile-landscape, 1 at mobile. Each tile preserves its natural aspect ratio (square / 2:3 / 3:4 / 4:5 portrait — never landscape because pins are vertically-oriented). Gutters are `{spacing.sm}` (8px) horizontal and vertical.
- **Home hero feature row:** asymmetric 2-column split where text and imagery alternate left/right down the page (text-left + image-right, then image-left + text-right, etc.).
- **Footer:** 4-column link grid at desktop, collapsing to 2-up at tablet, 1-up at mobile.

### Whitespace Philosophy
Whitespace is generous on the marketing surfaces and tight on the discovery surfaces. The home page sits sections 64px apart with photo-illustrated feature cards using 32px internal padding, while the search results page collapses to an 8px-gutter masonry grid that tiles imagery edge-to-edge. The system reads as two tools sharing the same chrome: a magazine (hero / feature / CTA / footer) and a search engine (top nav / filter row / pin grid / load more).

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| 0 — Flat | No border, no shadow | Default for pin cards, feature cards, footer — the dominant treatment |
| 1 — Hairline border | 1px solid `{colors.hairline}` | Inputs, footer column dividers, in-list rows |
| 2 — Modal scrim + soft shadow | Modal sits on a dark scrim over the page content with a soft 16px ambient shadow | Login / signup modal, image preview modal |
| 3 — Pin hover lift | (intentionally undocumented per system policy) | n/a |

Pinterest's system has effectively no shadow elevation in its content surfaces. Pin cards sit flat on the canvas; the only "elevation" appears on the modal layer where a 16px ambient shadow paired with a 50%-opacity scrim lifts the modal above the page content.

### Decorative Depth
Depth comes entirely from the imagery itself, not from CSS effects:
- **Pin photography** carries cinematic depth through composition (food photography, fashion close-ups, interior shots) — the design lets each tile's image speak rather than adding chrome to it.
- **Category tile thumbnails** in the home page's feature rows use Pinterest's own pin imagery as composition assets, often with a small `{component.pin-overlay-pill}` ("Cherry red", "Preppy look", "Earthy space inspo") overlaid in the corner of the image.
- **Modal scrim** — a 50%-opacity dark overlay over the entire page content when the login modal opens, with a 16px ambient shadow underneath the modal card lifting it to the visual top.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.none}` | 0px | Footer, primary nav, page sections — all flat structural surfaces |
| `{rounded.sm}` | 8px | Rare medium-radius surface (e.g., editorial tooltip) |
| `{rounded.md}` | 16px | Buttons, inputs, pin cards, feature cards, category tiles — the dominant component radius |
| `{rounded.lg}` | 32px | Large pin cards, modal cards — used sparingly for "big" content surfaces |
| `{rounded.full}` | 9999px | Search bar, filter chips, pin overlay pills, icon-circular buttons, avatars |

The radius vocabulary is essentially three values: 16px for most things, 32px for big cards and modals, and pill for circular elements. There are no sharp-cornered buttons or sharp-cornered pin cards.

### Photography Geometry
- **Pin imagery:** mixed aspect ratios — square (1:1), portrait (3:4, 2:3, 4:5), and rare landscape — preserved at their natural ratio inside `{rounded.md}` (16px) corners on small tiles and `{rounded.lg}` (32px) on large feature pins.
- **Category tile thumbnails:** square (1:1) with `{rounded.md}` corners.
- **Avatar circles:** 32–48px at `{rounded.full}` for in-pin attribution and profile chips.
- **Feature card imagery:** typically 4:5 portrait on home-page category cards, with the photo occupying ~60% of the card and the headline + CTA stacked beneath.

## Components

> **No hover states documented** per system policy. Each spec covers Default and Active/Pressed only.

### Buttons

**`button-primary`** — the universal Pinterest CTA
- Background `{colors.primary}` (Pinterest Red), text `{colors.on-primary}`, type `{typography.button-md}`, padding `6px 14px`, height ~40px, rounded `{rounded.md}` (16px).
- Used for "Sign up", "Join Pinterest for free", "Get started" — every primary action across every surface in the system.
- Pressed state lives in `button-primary-pressed` — background drops to `{colors.primary-pressed}` (`#cc001f`).

**`button-secondary`** — gray-cream alternative
- Background `{colors.secondary-bg}` (`#e5e5e0`), text `{colors.on-secondary}`, type `{typography.button-md}`, padding `6px 14px`, height ~40px, rounded `{rounded.md}`.
- "I already have an account", "Continue", "Cancel" — second-tier actions paired with the red primary.
- Pressed state lives in `button-secondary-pressed` — background drops to `{colors.secondary-pressed}`.

**`button-tertiary`** — ghost link
- Background transparent, text `{colors.ink}`, type `{typography.button-md}`, rounded `{rounded.md}`.
- Used for low-emphasis actions inside dialogs ("Read the docs", "Learn more →" with a small chevron).

**`button-icon-circular`** — circular icon button
- Background `{colors.surface-card}`, icon `{colors.ink}`, rounded `{rounded.full}`, size 40px.
- Carousel paddles, modal close button, and small floating action buttons in pin imagery.

**`button-pill-on-image`** — small overlay pill on photography
- Background `{colors.canvas}`, text `{colors.ink}`, type `{typography.button-md}`, rounded `{rounded.full}`, padding `8px 14px`.
- The signature "Cherry red" / "Preppy look" / "Earthy space inspo" overlay pill that anchors the corner of category-tile pin imagery.

**`button-disabled`**
- Background `{colors.surface-card}`, text `{colors.ash}` — flat soft-cream.

### Filter & Tab Chips

**`filter-chip`** + **`filter-chip-active`**
- Default: background `{colors.surface-card}`, text `{colors.ink}`, type `{typography.button-md}`, rounded `{rounded.full}`, padding `8px 16px`.
- Active: background `{colors.ink}`, text `{colors.on-dark}` — the chip flips fully inverted on selection.
- Used across the search results page filter strip ("Beauty makeup", "Lipstick", "Editorial makeup"...).

### Inputs & Forms

**`text-input`** + **`text-input-focused`**
- Default: background `{colors.canvas}`, text `{colors.ink}`, 1px solid `{colors.ash}`, type `{typography.body-md}`, padding `11px 15px`, height ~44px, rounded `{rounded.md}`.
- Focused: 2px `{colors.ink}` inner border + 4px `{colors.focus-outer}` outer outline — the signature double-ring focus signal.
- Used across the login/signup modal for email, password, birthdate, country fields.

**`search-bar`** + **`search-bar-focused`**
- Default: background `{colors.surface-card}`, text `{colors.ink}`, type `{typography.body-md}`, padding `11px 15px`, height ~48px, rounded `{rounded.full}`.
- Focused: same dimensions, background flips to `{colors.canvas}` with a 1px `{colors.ash}` border.
- Anchored in the center of the primary nav with a magnifier glyph at the left edge and "Search for ideas, fashion..." placeholder.

### Cards & Containers

**`pin-card`** — the standard masonry pin tile
- Container: background `{colors.surface-card}`, rounded `{rounded.md}` (16px), padding 0.
- Layout: full-bleed image at the card's natural aspect ratio with no internal padding. Optional `{component.pin-overlay-pill}` anchored to one corner of the image, optional 32px circular avatar with profile name in `{typography.body-sm-strong}` overlaid at the bottom-left.

**`pin-card-large`** — the home-page feature pin
- Identical to `pin-card` but rounded `{rounded.lg}` (32px) — used for the large editorial pins that anchor home-page feature rows.

**`pin-overlay-pill`** — anchored chip on pin imagery
- Background `{colors.canvas}`, text `{colors.ink}`, type `{typography.button-sm}`, rounded `{rounded.full}`, padding `6px 12px`.
- Floats over a pin's bottom-left or top-left corner with the search-term label that surfaces if the pin matches a search ("Cherry red", "Preppy look", "Earthy space inspo").

**`category-tile`**
- Background `{colors.surface-card}`, rounded `{rounded.md}`, padding 16px.
- 3- or 4-up grid of small category thumbnails inside the home-page "Bring your favorite ideas to life" section. Each tile contains a category icon or composition photograph + a short label in `{typography.body-strong}`.

**`feature-card`** + **`feature-card-soft`**
- Standard: background `{colors.canvas}`, rounded `{rounded.md}`, padding 32px. Pairs a 4:5 portrait pin image (left or right) with a `{typography.heading-xl}` headline + body copy + `{component.button-primary}` red CTA.
- Soft: background `{colors.surface-card}` for the alternating-row variant where the cream surface is needed to break up content.

**`modal-card`** — login/signup overlay
- Background `{colors.canvas}`, rounded `{rounded.lg}` (32px), padding 32px.
- Layout: title in `{typography.heading-lg}` ("Welcome to Pinterest"), subtitle in `{typography.body-md}`, stacked `{component.text-input}` fields (Email, Password, Birthdate, Country), primary `{component.button-primary}` "Continue", small "Already a member? Log in" link below.
- Floats over a 50%-opacity scrim covering the entire page content with a 16px ambient shadow.

**`hero-cta-strip`** — dark CTA strip on `create.pinterest.com`
- Background `{colors.surface-dark}`, text `{colors.on-dark}`, type `{typography.heading-xl}`, padding `48px 32px`, rounded `{rounded.none}`.
- Sits at the top of the creator marketing page with a single `{component.button-primary}` red CTA on the right.

### Navigation

**`primary-nav`**
- Background `{colors.canvas}`, text `{colors.ink}`, height ~64px, type `{typography.body-strong}`, rounded `{rounded.none}`, with a 1px `{colors.hairline}` bottom rule on inner pages (no rule on the home hero).
- Layout (desktop home): Pinterest red wordmark at left + "Explore" link, centered `{component.search-bar}`, right cluster ("About / Businesses / Create / Log in" + the always-red `{component.button-primary}` "Sign up" CTA).
- Layout (search results): Pinterest red P-logo at left, centered search bar with the active query, right cluster ("Log in" + red Sign-up button).

**Top Nav (Mobile)**
- Hamburger menu icon at left, P-logo at center, search-glyph + Sign-up CTA at right. Search bar collapses into the magnifier icon and expands to full-width when tapped.

### Footer

**`footer-section`**
- Background `{colors.canvas}`, text `{colors.mute}` in `{typography.body-sm}`, padding `32px 24px`, rounded `{rounded.none}`, with a 1px `{colors.hairline}` top rule.
- Layout: 4-column link grid (Get the app — iOS / Android · Quick Links — Explore / Shop / Users / Collections / Shopping · Pinterest for · About — Privacy / Terms / Help Center) with column headers in `{typography.body-sm-strong}` and link lists in `{typography.body-sm}` `{colors.mute}`.
- Bottom row: Pinterest red wordmark + "© 2026 Pinterest" in `{typography.caption-sm}` `{colors.mute}`.

### Inline

**`link-inline`** — body-prose anchor link
- `{colors.ink-soft}` text with no underline by default. Pinterest's only "color" beyond brand red on chrome — a near-black warm tint used inline to differentiate links from body without color contrast.

## Do's and Don'ts

### Do
- Reserve `{colors.primary}` (Pinterest Red) for primary CTAs, the active-tab indicator, and the brand wordmark only. It is never decorative.
- Use `{rounded.md}` (16px) on every interactive element and standard card; reserve `{rounded.lg}` (32px) for large pin cards and modals; reserve `{rounded.full}` for circular elements (search bar, chips, avatars).
- Stage every pin image inside a `{component.pin-card}` with no internal padding — the photograph IS the card.
- Stack content sections at `{spacing.section}` (64px) rhythm; tighten pin grids to `{spacing.sm}` (8px) gutters so imagery effectively touches.
- Use `{component.pin-overlay-pill}` to anchor a search-term tag in the corner of a category-tile pin photograph — the system's signature decorative gesture.
- Build hierarchy from font weight (400 → 600 → 700) and size, not from color tinting. Body stays `{colors.body}` regardless of section context.
- Apply -1.2px letter-spacing on `{typography.display-xl}` and `{typography.heading-xl}`. The negative tracking is part of the brand voice.

### Don't
- Don't use sharp-cornered buttons or cards. There are no `{rounded.none}` interactive elements in the system.
- Don't introduce drop shadows on cards. The only shadow in the system is the 16px ambient under `{component.modal-card}`.
- Don't pad `{component.pin-card}` internally. The image is full-bleed; metadata sits over the image as an overlay pill, not below it.
- Don't replace `{colors.primary}` with another red. The brand red is precise — `#e60023`.
- Don't use `{colors.ink-soft}` (the body-prose link tint) outside of inline body anchor links. It is not a chrome color.
- Don't introduce a third radius value between 16px and 32px. The system jumps directly from md to lg with nothing in between.

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| ultrawide | 1920px+ | Pin grid expands to 5–6 columns; content max-width holds at ~1280px |
| desktop-large | 1440px | Default — 4-column pin grid, full primary nav |
| desktop | 1280px | Same layout with narrower outer gutters |
| desktop-small | 1024px | Pin grid collapses to 3 columns; sub-nav remains horizontal |
| tablet | 768px | Pin grid collapses to 2 columns; primary nav becomes hamburger drawer; search bar becomes icon-only |
| mobile | 480px | Single-column pin grid; hero `{typography.display-xl}` scales 70px → ~44px |
| mobile-narrow | 320px | Hero further scales to ~36px; section padding tightens to 32px |

### Touch Targets
All interactive elements meet WCAG AA (≥ 44×44px). `{component.button-primary}` and `{component.button-secondary}` sit at ~40px height with 14px horizontal padding (effective ~40×80px tappable). `{component.search-bar}` sits at 48px. `{component.text-input}` sits at 44px. `{component.filter-chip}` is ~36–40px height with 16px padding — extends to 44px tappable via inline padding. `{component.button-icon-circular}` is exactly 40×40 with extended hit-target padding to 48×48 inside the parent.

### Collapsing Strategy
- **Primary nav:** desktop horizontal cluster → tablet hamburger drawer at 768px. The red Sign-up CTA stays visible at every breakpoint.
- **Search bar:** desktop centered (~480px wide) → tablet compressed (~320px) → mobile collapses to a magnifier icon that expands to a full-width overlay on tap.
- **Pin masonry grid:** 5/6-up → 4-up → 3-up → 2-up → 1-up at 1920, 1024, 768, and 480px. Gutters drop from 8px to 6px on mobile.
- **Home feature row:** desktop alternating left/right 2-column → tablet vertical stack with text above image → mobile single-column with full-bleed image.
- **Modal:** desktop centered ~480px-wide card → mobile full-width sheet with rounded `{rounded.lg}` top-only and bottom-anchored CTA.
- **Section padding:** `{spacing.section}` (64px) desktop → 48px tablet → 32px mobile.
- **Hero headline:** `{typography.display-xl}` (70px) at desktop, scaling 56px / 44px / 36px down the breakpoint stack.
- **Footer:** 4-up link columns → 2-up at tablet → full accordion at mobile (each header becomes a tap-to-expand row).

### Image Behavior
- Pin imagery preserves natural aspect ratio at every breakpoint; the column count changes, not the aspect.
- Category tile thumbnails maintain 1:1 across all sizes.
- Hero feature imagery uses art-direction crops on mobile (4:5 portrait → square) so the subject stays centered when the layout collapses to single-column.
- All non-critical imagery is lazy-loaded as the user scrolls into the next grid row.

## Iteration Guide

1. Focus on ONE component at a time. Pull its YAML entry and verify every property resolves.
2. Reference component names and tokens directly (`{colors.primary}`, `{component.button-primary-pressed}`, `{rounded.md}`) — do not paraphrase.
3. Run `npx @google/design.md lint DESIGN.md` after edits — `broken-ref`, `contrast-ratio`, and `orphaned-tokens` warnings flag issues automatically.
4. Add new variants as separate component entries (`-pressed`, `-disabled`, `-focused`) — do not bury them inside prose.
5. Default body to `{typography.body-md}`; reach for `{typography.body-strong}` for emphasis; reserve `{typography.display-xl}` strictly for top-of-page hero headlines.
6. Keep `{colors.primary}` scarce — at most one Pinterest-red CTA per fold (counting nav, hero, and feature-card CTAs together).
7. When introducing a new component, ask whether it can be expressed with the existing pin-card + 16px-radius + cream-surface vocabulary before adding new tokens. The system's strength is that it almost never needs new ones.

## Known Gaps

- **Mobile screenshots not captured** — responsive behavior synthesizes Pinterest's known mobile pattern (hamburger drawer, single-column grid, hero downscale) from desktop evidence and the documented breakpoint stack.
- **Hover states not documented** by system policy.
- **Pin-detail close-up (single pin overlay)** is not in the captured set — the in-product Pin detail view (with comments, related pins, save board picker) likely introduces components not documented here.
- **Authenticated chrome** (logged-in home feed, board pages, profile pages) not in the captured pages — the captured surfaces are the logged-out marketing and search experience.
- **Pinterest mobile app screens** not in the system documented here — this is the web-only chrome.
- **Form validation states** (success / error inline messages) not documented; only the focused-state field is captured.

# --- Shopping accent: Shopify dark cinematic + CTA patterns ---
---
version: alpha
name: Shopifi-design-analysis
description: An inspired interpretation of Shopifi's design language — a cinematic commerce platform that runs two parallel design tracks. The marketing-hero and product-narrative pages live on near-black canvases with full-bleed photography of merchants, giant Neue Haas Grotesk display type at thin weights, and a single black-pill CTA stroked in white. The transactional pages (pricing, signup, dashboards) flip to a cream-mint canvas with pastel aloe and pistachio greens, the same pill button vocabulary, and Inter for UI body. The two tracks share typographic DNA but diverge sharply in canvas polarity — and that choice is the brand.

colors:
  primary: "#000000"
  ink: "#000000"
  on-primary: "#ffffff"
  on-dark: "#ffffff"
  canvas-night: "#000000"
  canvas-night-elevated: "#0a0a0a"
  canvas-light: "#ffffff"
  canvas-cream: "#fbfbf5"
  surface-elevated-dark: "#1e2c31"
  shade-30: "#d4d4d8"
  shade-40: "#a1a1aa"
  shade-50: "#71717a"
  shade-60: "#52525b"
  shade-70: "#3f3f46"
  hairline-light: "#e4e4e7"
  hairline-dark: "#1e2c31"
  aloe-10: "#c1fbd4"
  pistachio-10: "#d4f9e0"
  link-cool-1: "#9dabad"
  link-cool-2: "#9797a2"
  link-cool-3: "#bdbdca"
  link-mint: "#99b3ad"

typography:
  display-xxl:
    fontFamily: "NeueHaasGrotesk Display, Helvetica, Arial, sans-serif"
    fontSize: 96px
    fontWeight: 330
    lineHeight: 1.0
    letterSpacing: 2.4px
    fontFeature: ss03
  display-xl:
    fontFamily: "NeueHaasGrotesk Display, Helvetica, Arial, sans-serif"
    fontSize: 70px
    fontWeight: 330
    lineHeight: 1.0
    letterSpacing: 0
    fontFeature: ss03
  display-lg:
    fontFamily: "NeueHaasGrotesk Display, Helvetica, Arial, sans-serif"
    fontSize: 55px
    fontWeight: 330
    lineHeight: 1.16
    letterSpacing: 0
    fontFeature: ss03
  display-md:
    fontFamily: "NeueHaasGrotesk Display, Helvetica, Arial, sans-serif"
    fontSize: 48px
    fontWeight: 330
    lineHeight: 1.14
    letterSpacing: 0
    fontFeature: ss03
  heading-xl:
    fontFamily: "NeueHaasGrotesk Display, Helvetica, Arial, sans-serif"
    fontSize: 28px
    fontWeight: 500
    lineHeight: 1.28
    letterSpacing: 0.42px
    fontFeature: ss03
  heading-lg:
    fontFamily: "NeueHaasGrotesk Display, Helvetica, Arial, sans-serif"
    fontSize: 24px
    fontWeight: 400
    lineHeight: 1.14
    letterSpacing: 0.36px
    fontFeature: ss03
  heading-md:
    fontFamily: "NeueHaasGrotesk Display, Helvetica, Arial, sans-serif"
    fontSize: 20px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0.3px
    fontFeature: ss03
  heading-sm:
    fontFamily: "NeueHaasGrotesk Display, Helvetica, Arial, sans-serif"
    fontSize: 18px
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: 0.72px
    fontFeature: ss03
  body-lg:
    fontFamily: "Inter Variable, Inter, Helvetica, Arial, sans-serif"
    fontSize: 18px
    fontWeight: 550
    lineHeight: 1.56
    letterSpacing: 0
    fontFeature: ss03
  body-md:
    fontFamily: "Inter Variable, Inter, Helvetica, Arial, sans-serif"
    fontSize: 16px
    fontWeight: 420
    lineHeight: 1.5
    letterSpacing: 0
    fontFeature: ss03
  body-strong:
    fontFamily: "Inter Variable, Inter, Helvetica, Arial, sans-serif"
    fontSize: 16px
    fontWeight: 550
    lineHeight: 1.5
    letterSpacing: 0
    fontFeature: ss03
  caption:
    fontFamily: "Inter Variable, Inter, Helvetica, Arial, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.49
    letterSpacing: 0.28px
    fontFeature: ss03
  micro:
    fontFamily: "Inter Variable, Inter, Helvetica, Arial, sans-serif"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: -0.13px
    fontFeature: ss03
  eyebrow-cap:
    fontFamily: "Inter Variable, Inter, Helvetica, Arial, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: 0.72px
    fontFeature: ss03
  code:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
    fontFeature: ss03

rounded:
  xs: 4px
  sm: 5px
  md: 8px
  lg: 12px
  xl: 20px
  pill: 9999px

spacing:
  xxs: 2px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
  huge: 64px

components:
  button-primary-pill:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.pill}"
    padding: 12px 24px
  button-primary-pill-pressed:
    backgroundColor: "{colors.shade-70}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.pill}"
    padding: 12px 24px
  button-outline-on-dark:
    backgroundColor: "{colors.canvas-night}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.pill}"
    padding: 12px 26px
  button-outline-on-light:
    backgroundColor: "{colors.canvas-light}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.pill}"
    padding: 12px 24px
  button-aloe-pill:
    backgroundColor: "{colors.aloe-10}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.pill}"
    padding: 12px 24px
  text-input:
    backgroundColor: "{colors.canvas-light}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 10px 12px
  card-pricing:
    backgroundColor: "{colors.canvas-light}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 32px
  card-pricing-featured:
    backgroundColor: "{colors.aloe-10}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 32px
  card-feature-cinematic:
    backgroundColor: "{colors.canvas-night-elevated}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.lg}"
    padding: 32px
  card-pistachio-band:
    backgroundColor: "{colors.pistachio-10}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 32px
  card-photo-frame:
    backgroundColor: "{colors.canvas-night}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xl}"
    padding: 0px
  pill-tag-mint:
    backgroundColor: "{colors.aloe-10}"
    textColor: "{colors.ink}"
    typography: "{typography.eyebrow-cap}"
    rounded: "{rounded.pill}"
    padding: 4px 12px
  pill-tag-shade:
    backgroundColor: "{colors.shade-30}"
    textColor: "{colors.ink}"
    typography: "{typography.eyebrow-cap}"
    rounded: "{rounded.pill}"
    padding: 4px 12px
  nav-bar-light:
    backgroundColor: "{colors.canvas-light}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xs}"
    padding: 16px 24px
  nav-bar-dark:
    backgroundColor: "{colors.canvas-night}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xs}"
    padding: 16px 24px
  link-on-dark:
    backgroundColor: "{colors.canvas-night}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xs}"
    padding: 0px
  footer-dark:
    backgroundColor: "{colors.canvas-night}"
    textColor: "{colors.on-primary}"
    typography: "{typography.caption}"
    rounded: "{rounded.xs}"
    padding: 64px 24px
  footer-light:
    backgroundColor: "{colors.canvas-light}"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.xs}"
    padding: 64px 24px
---

## Overview

Shopifi runs two parallel design tracks that share typographic DNA and a single button vocabulary, but diverge in canvas polarity. The marketing track lives on `{colors.canvas-night}` (`#000000`) — full-bleed cinematic photography of merchants, giant `{typography.display-xxl}` headlines in Neue Haas Grotesk Display set at weight 330 (a thin, almost editorial cut), and a single CTA: a white-stroked black pill with the form `button-outline-on-dark`. The pages read like the spread of a high-end print magazine: lots of black, lots of negative space, photography that doesn't compete with text, and one and only one action per band.

The transactional track flips to `{colors.canvas-light}` and `{colors.canvas-cream}` (an off-white that's barely warmer than pure white). Pricing tiers, comparison tables, and signup flows sit on this lighter canvas, with the same pill button system but in inverse polarity (a solid black pill with white text, or a `{colors.aloe-10}` mint pill for the featured / "Start free trial" tier). The accents — `{colors.aloe-10}` mint and `{colors.pistachio-10}` pistachio — show up only on the light track, never on the cinematic dark hero pages.

Typography is split across three families. **Neue Haas Grotesk Display** at thin weights (330–500) handles every display, headline, and editorial moment — the brand's identity is that thin display cut. **Inter Variable** at 420–550 weights handles every UI body, button label, caption, and form field — utility text that doesn't fight the display. **ui-monospace** appears only in code blocks and rare technical eyebrows. Across all three families, the OpenType `ss03` stylistic set is enabled — it's the brand's character-level signature, applied universally.

**Key Characteristics:**
- Two-canvas system: `{colors.canvas-night}` for cinematic marketing, `{colors.canvas-light}` / `{colors.canvas-cream}` for transactional surfaces — never blended.
- Pill-shape (`{rounded.pill}`) is the only button shape across both tracks; rounded rectangles do not exist for buttons.
- Thin-weight (330) display typography is the signature; `{typography.display-xxl}` at 96px / weight 330 is the brand's loudest visual.
- Aloe and pistachio greens (`{colors.aloe-10}`, `{colors.pistachio-10}`) are reserved for the light track — they signal commerce, growth, transactional success.
- Photography is full-bleed, edge-to-edge, never inset in cards on the cinematic track; merchants and storefront imagery do the heavy visual lifting that gradients and illustrations would do elsewhere.
- The OpenType `ss03` stylistic set is enabled across every text role — a character-level unifier that tracks across both tracks.
- Tight letter-spacing on display sizes (2.4px positive tracking on 96px display) gives the thin weight extra optical air.

## Colors

> **Source pages:** home (`/`), `/start`, `/website/builder`, `/pricing`.

### Brand & Accent
- **Aloe** (`{colors.aloe-10}` — `#c1fbd4`): The featured-tier and "growth" accent. Used as a pill button background on light surfaces and as a feature-card fill in the pricing comparison band.
- **Pistachio** (`{colors.pistachio-10}` — `#d4f9e0`): Softer than aloe; used as a wide section band fill on the light track to signal a different category of feature without leaving the green family.
- **Cool Link Tones** (`{colors.link-cool-1}` `#9dabad`, `{colors.link-cool-2}` `#9797a2`, `{colors.link-cool-3}` `#bdbdca`, `{colors.link-mint}` `#99b3ad`): Muted footer / tertiary link colors used on dark surfaces to create a quiet hierarchy below the primary white type.

### Surface
- **Canvas Night** (`{colors.canvas-night}` — `#000000`): Pure black hero, cinematic feature pages, footer.
- **Canvas Night Elevated** (`{colors.canvas-night-elevated}` — `#0a0a0a`): Cards on cinematic surfaces, video frames.
- **Surface Elevated Dark** (`{colors.surface-elevated-dark}` — `#1e2c31`): Dark teal-shifted surface used on a small subset of dark cards to introduce subtle depth without breaking the black.
- **Canvas Light** (`{colors.canvas-light}` — `#ffffff`): Pricing, signup, comparison tables.
- **Canvas Cream** (`{colors.canvas-cream}` — `#fbfbf5`): Slightly warm off-white used on the pricing-page background canvas — invisibly different from `#ffffff` but adds editorial warmth.
- **Hairline Light** (`{colors.hairline-light}` — `#e4e4e7`): 1px borders on light cards, table dividers.
- **Hairline Dark** (`{colors.hairline-dark}` — `#1e2c31`): 1px borders on the rare dark cards that have visible chrome.

### Shade Ladder
- **Shade-30** (`{colors.shade-30}` — `#d4d4d8`): Tag / chip background on light, footer hairline on dark.
- **Shade-40** (`{colors.shade-40}` — `#a1a1aa`): Tertiary text on light, secondary text on dark.
- **Shade-50** (`{colors.shade-50}` — `#71717a`): Secondary text on light.
- **Shade-60** (`{colors.shade-60}` — `#52525b`): Tertiary text on light, deep on dark.
- **Shade-70** (`{colors.shade-70}` — `#3f3f46`): Pressed-state of the primary pill button; deep dark surface accent.

### Text
- **Ink** (`{colors.ink}` — `#000000`): All text on light canvas.
- **On Primary** (`{colors.on-primary}` — `#ffffff`): All text on dark canvas + filled-pill labels.

## Typography

### Font Family

The display tier is **Neue Haas Grotesk Display** at thin weights (330–500). When unavailable, fall back to **Helvetica** at light weight, then Arial. The thin-weight cut is the brand — no substitution should default to weight 400+.

The UI tier is **Inter Variable** at 420–550 — a variable font with sub-weight precision that lets the system span body (420), strong (550), and caption (500) without jumping to heavier tiers. Inter is open-source via Google Fonts.

The code tier is **ui-monospace**, the system mono — preferred over a webfont mono to avoid unnecessary downloads.

The OpenType `ss03` stylistic set is enabled across every role. It alters specific glyph forms (lowercase `a`, `g`, single-story numerals) for a slightly more geometric character. Apply via `font-feature-settings: "ss03"` on the body element or root.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.display-xxl}` | 96px | 330 | 1.0 | 2.4px | Cinematic hero headline |
| `{typography.display-xl}` | 70px | 330 | 1.0 | 0 | Section opener on cinematic pages |
| `{typography.display-lg}` | 55px | 330 | 1.16 | 0 | Pricing-page page title |
| `{typography.display-md}` | 48px | 330 | 1.14 | 0 | Sub-section headline on light track |
| `{typography.heading-xl}` | 28px | 500 | 1.28 | 0.42px | Card title / pricing tier name |
| `{typography.heading-lg}` | 24px | 400 | 1.14 | 0.36px | Compact card title |
| `{typography.heading-md}` | 20px | 500 | 1.4 | 0.3px | Section sub-heading |
| `{typography.heading-sm}` | 18px | 500 | 1.25 | 0.72px | Eyebrow / mini-section label |
| `{typography.body-lg}` | 18px | 550 | 1.56 | 0 | Marketing body lead, large body |
| `{typography.body-md}` | 16px | 420 | 1.5 | 0 | Default UI body, pill-button labels |
| `{typography.body-strong}` | 16px | 550 | 1.5 | 0 | Emphasized body run |
| `{typography.caption}` | 14px | 500 | 1.49 | 0.28px | Helper copy, footnotes |
| `{typography.micro}` | 13px | 500 | 1.5 | -0.13px | Pricing fine print |
| `{typography.eyebrow-cap}` | 12px | 400 | 1.2 | 0.72px | All-caps eyebrow above large headlines |
| `{typography.code}` | 16px | 400 | 1.5 | 0 | Code blocks |

### Principles
- **Display thinness is the brand.** Always render display sizes at weight 330 — never 400+. The thinness is a deliberate editorial choice that makes the giant size feel quiet.
- **Display in NHGD, body in Inter.** Don't push body roles up to NHGD; don't push display roles down to Inter.
- **Tracking lifts on display.** The 96px hero gets +2.4px positive tracking — the thin glyphs need air. At 70px and below, tracking returns to 0.

### Note on Font Substitutes
Open substitutes for Neue Haas Grotesk Display: **Helvetica Now Display** (proprietary) or **Inter Display** at light weights (open-source) are the closest matches. Avoid Helvetica Neue at default weight — it's too heavy for the brand's thin tier. **Inter Variable** is open-source via Google Fonts and is the canonical body face — no substitute needed.

## Layout

### Spacing System
- **Base unit**: 8px (with denser sub-units 1, 2, 3, 4 for fine work).
- **Tokens**: `{spacing.xxs}` 2px · `{spacing.xs}` 4px · `{spacing.sm}` 8px · `{spacing.md}` 12px · `{spacing.lg}` 16px · `{spacing.xl}` 24px · `{spacing.xxl}` 32px · `{spacing.huge}` 64px.
- **Section padding**: `{spacing.huge}` 64–128px on cinematic marketing pages (extreme negative space is the point); collapses to ~48px on transactional pages where density takes priority.
- **Card internal padding**: `{spacing.xxl}` 32px on pricing cards; `{spacing.xl}` 24px on compact tag rows.

### Grid & Container
- Cinematic hero pages use a wide max-width container (~1440–1600px) with edge-bleeding photography that escapes the container.
- Pricing collapses through 4-up → 2-up → 1-up tiers based on viewport.
- Body content centers in a ~720–840px reading column on long-form pages.

### Whitespace Philosophy
The cinematic track treats whitespace as the brand's most valuable asset — sections often have 128–192px of vertical air between content blocks, with photography filling the rest. The transactional track tightens to ~48–64px between bands because users are scanning, comparing, and acting. The contrast between the two whitespace philosophies is part of the brand voice.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| 0 | Flat, no shadow | Default surface |
| 1 | `0 1px 2px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.04)` | Subtle inset highlight on dark cards (a top-edge sheen) |
| 2 | `0 0 0 1px rgba(255,255,255,0.08), 0 1px 3px rgba(0,0,0,0.3), 0 5px 10px rgba(0,0,0,0.2)` | Dark elevated cards with hairline + drop shadow stack |
| 3 | `0 8px 8px rgba(0,0,0,0.1), 0 4px 4px rgba(0,0,0,0.1), 0 2px 2px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.1)` | Stacked-shadow card on light surfaces; layered tiny shadows produce a soft halo |
| 4 | `0 25px 50px -12px rgba(0,0,0,0.25)` | Modal / floating panel on light |

### Decorative Depth
On the cinematic track, depth comes from photography — full-bleed merchant imagery layered behind cards, with subtle inset top-edge highlights creating the illusion of light hitting a glass surface. On the light track, the layered tiny-shadow stack (Level 3) produces a soft, paper-like halo around pricing cards — depth without harshness.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.xs}` | 4px | Inputs, hairline tags |
| `{rounded.sm}` | 5px | Image containers (small) |
| `{rounded.md}` | 8px | Form inputs, video frames, smaller cards |
| `{rounded.lg}` | 12px | Pricing cards, feature cards |
| `{rounded.xl}` | 20px (top-only on some asymmetric cards) | Hero photo frames, cinematic card chrome |
| `{rounded.pill}` | 9999px | All buttons, pill tags, mint chips |

### Photography Geometry
Photography is full-bleed with no border. On cinematic pages it escapes the container entirely; on transactional pages it sits inside `{rounded.lg}` containers with no shadow. Avatar treatments in customer-logo strips are simple greyscale wordmarks at uniform height (~24–32px), aligned in a single horizontal strip.

## Components

### Buttons

**`button-primary-pill`** — the dominant CTA across the system.
- Background `{colors.primary}` (black), text `{colors.on-primary}`, type `{typography.body-md}`, padding `{spacing.md} {spacing.xl}` (12px 24px), rounded `{rounded.pill}` 9999px.
- Pressed state `button-primary-pill-pressed`: background lifts to `{colors.shade-70}`.

**`button-outline-on-dark`** — the cinematic hero CTA.
- Background `{colors.canvas-night}` (transparent on the canvas), 2px solid `{colors.on-primary}` border, text `{colors.on-primary}`, same pill geometry.

**`button-outline-on-light`** — the light-track equivalent.
- Background `{colors.canvas-light}`, 1px solid `{colors.ink}` border, text `{colors.ink}`, same pill geometry.

**`button-aloe-pill`** — the featured CTA on pricing pages.
- Background `{colors.aloe-10}`, text `{colors.ink}`, same pill geometry. Used for the "Start free trial" tier.

### Cards & Containers

**`card-pricing`** — the standard tier card on the pricing page.
- Background `{colors.canvas-light}`, padding `{spacing.xxl}`, rounded `{rounded.lg}` 12px, 1px `{colors.hairline-light}` border. Title in `{typography.heading-xl}`, price in `{typography.display-md}`, body in `{typography.body-md}`, CTA pinned to the bottom as `button-primary-pill`.

**`card-pricing-featured`** — the highlighted pricing tier.
- Background `{colors.aloe-10}`, otherwise identical to `card-pricing`. The mint fill (rather than a brand-color border) is the brand's distinctive featured-tier choice.

**`card-feature-cinematic`** — feature card on the cinematic track.
- Background `{colors.canvas-night-elevated}`, text `{colors.on-primary}`, rounded `{rounded.lg}`, often with a top-edge inset highlight (Level 1 elevation). Holds full-bleed photography or a single large statement.

**`card-pistachio-band`** — wide horizontal band card used to highlight a category of features on the light track.
- Background `{colors.pistachio-10}`, text `{colors.ink}`, rounded `{rounded.lg}` 12px, padding `{spacing.xxl}`.

**`card-photo-frame`** — full-bleed photography container on cinematic pages.
- Background `{colors.canvas-night}`, padding 0, rounded `{rounded.xl}` 20px (often top-only). The photo IS the content; no inner padding, no overlay text inside the card.

### Inputs & Forms

**`text-input`** — standard text input on light surfaces.
- Background `{colors.canvas-light}`, text `{colors.ink}`, type `{typography.body-md}`, padding `{spacing.sm}+ {spacing.md}` (10px 12px), rounded `{rounded.md}` 8px, 1px `{colors.hairline-light}` border.

### Navigation

**`nav-bar-light`** — top nav on light pages.
- Background `{colors.canvas-light}`, text `{colors.ink}`, padding `{spacing.lg} {spacing.xl}`. Logo wordmark on the left, nav items center, two pill buttons on the right (`button-outline-on-light` for "Log in", `button-primary-pill` for "Start free trial").

**`nav-bar-dark`** — top nav on cinematic pages.
- Background `{colors.canvas-night}`, text `{colors.on-primary}`, otherwise identical structure. Two pill buttons on the right (`button-outline-on-dark` for both, with the rightmost subtly more prominent via type weight).

### Pills, Tags, and Chips

**`pill-tag-mint`** — small tag on light surfaces, signaling a feature category.
- Background `{colors.aloe-10}`, text `{colors.ink}`, type `{typography.eyebrow-cap}`, padding `{spacing.xs} {spacing.md}`, rounded `{rounded.pill}`.

**`pill-tag-shade`** — neutral tag on light surfaces.
- Background `{colors.shade-30}`, text `{colors.ink}`, otherwise same shape as `pill-tag-mint`.

### Signature Components

**Cinematic Photography Layer** — full-bleed merchant photos on the hero. No overlay scrim, no text-on-image; instead, the type sits in clean negative space above or below the photo. The brand treats photography as an editorial spread, not as decoration.

**Stacked Tiny Shadows (Level 3 Elevation)** — pricing cards on the light track use 4 stacked tiny drop shadows (each 1–8px Y offset, 10% black) to produce a soft, layered paper halo. This is the brand's distinctive depth on light.

**`link-on-dark`** — inline link on cinematic pages.
- Color `{colors.on-primary}`, no underline by default (links rely on context); for tertiary footer links, color shifts to one of the cool muted tones (`{colors.link-cool-1}` etc.) with a persistent underline.

**`footer-dark`** — full-page-width footer on the cinematic track.
- Background `{colors.canvas-night}`, text `{colors.on-primary}`, type `{typography.caption}`, padding `{spacing.huge} {spacing.xl}`. Contains 4–5 columns of muted-tone link groups, social icons, and a small legal row.

**`footer-light`** — equivalent on the transactional track.
- Background `{colors.canvas-light}`, text `{colors.ink}`, otherwise same structure.

## Do's and Don'ts

### Do
- Reserve `{colors.aloe-10}` and `{colors.pistachio-10}` for the light track only — they don't appear on cinematic black pages.
- Always use `{rounded.pill}` for buttons; never `{rounded.md}` or `{rounded.lg}`.
- Render display tiers at weight 330; bumping to 400 or 500 breaks the brand's thin-display signature.
- Use full-bleed photography on cinematic pages — let it escape the container.
- Apply `font-feature-settings: "ss03"` globally; the stylistic set is the brand's typographic signature.
- Pair black canvas with white type and white-stroked outline pills; pair light canvas with black type and filled-black pills.

### Don't
- Don't introduce a third canvas color — stick to black or light/cream. Greys, beiges, and blues are not in the system.
- Don't add drop shadows on cinematic dark cards beyond the subtle inset top-highlight; the cinematic track wants flat blackness.
- Don't shrink display tiers below `{typography.display-md}` (48px) on hero surfaces; below that they read as section heads, not display.
- Don't put aloe / pistachio greens behind type — they're surface fills, not text colors.
- Don't replace the pill shape with a rounded-rectangle button anywhere.

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Wide | ≥ 1440px | Full cinematic hero with edge-bleeding photography; pricing 4-up |
| Desktop | 1024–1440px | Default content max-width; pricing 4-up tightens |
| Tablet | 768–1023px | Pricing 2-up; cinematic hero photography crops |
| Mobile | < 768px | Pricing 1-up; hamburger nav; display-xxl drops to ~56–64px |

### Touch Targets
- Pill buttons hit ≥ 44×44px on mobile via 12px vertical padding × 16px line-height. WCAG AAA compliant.
- Form fields stay at the 44px minimum height across all breakpoints.

### Collapsing Strategy
- Display sizes scale down through the breakpoint stair: 96 → 70 → 55 → 48 → 36px on mobile.
- Cinematic photography crops aggressively at smaller widths, prioritizing focal subject over edge-bleed.
- Pricing tiers stair-step 4-up → 2-up → 1-up; the featured aloe tier stays visually distinguished at every step.
- Top nav collapses to hamburger below 768px; menu inherits canvas polarity.

### Image Behavior
Photography uses responsive `srcset` with art-direction crops at major breakpoints. Mobile crops favor close subjects; wide crops favor environmental / storefront context.

## Iteration Guide

1. Focus on ONE component at a time.
2. Reference component names and tokens directly (`{colors.aloe-10}`, `{button-primary-pill}-pressed`, `{rounded.pill}`).
3. Run `npx @google/design.md lint DESIGN.md` after edits.
4. Add new variants as separate entries.
5. Default body to `{typography.body-md}`; reserve `{typography.body-lg}` for marketing leads.
6. Keep the two canvas tracks separated — when designing a new page, choose cinematic OR transactional, not both.
7. The pill shape is non-negotiable; new button variants vary in fill / border / canvas, never in shape.

# ============================================================
# COFRE (:8091) — Personal CFO / finance intelligence
# Primary: Revolut (gradient cards, fintech precision, sleek dark)
# Accent: Stripe (weight-300 elegance on all numbers and tables)
# Goal: premium personal banking terminal — trust + precision
# ============================================================
---
version: alpha
name: Revolut-design-analysis
description: |
  Revolut's marketing surfaces pair a stark black canvas with the brand's
  cobalt-violet (`#494fdf`) and a wide accent palette of deep, fully-saturated
  product colours — teal, light-blue, deep pink, light-green, warning orange.
  The system reads as fintech-meets-product-brochure: oversized 80px–136px
  Aeonik Pro display headlines, generous whitespace, photography-led hero
  bands, and full-width product mockups (cards, phones, terminals) shown as
  hero objects inside near-black sections. Most surfaces are either black or
  off-white; pill-shaped buttons and rounded-12/20px content cards carry the
  consumer-financial-app feel without crossing into playful territory.

colors:
  primary: "#494fdf"
  primary-bright: "#4f55f1"
  primary-deep: "#3a40c4"
  on-primary: "#ffffff"
  ink: "#191c1f"
  body: "#1f2226"
  charcoal: "#3a3d40"
  mute: "#505a63"
  ash: "#5c5e60"
  stone: "#8d969e"
  faint: "#c9c9cd"
  on-dark: "#ffffff"
  on-dark-mute: "rgba(255,255,255,0.72)"
  canvas-light: "#ffffff"
  canvas-dark: "#000000"
  surface-soft: "#f4f4f4"
  surface-card: "#ffffff"
  surface-deep: "#0a0a0a"
  surface-elevated: "#16181a"
  hairline-light: "#e2e2e7"
  hairline-dark: "rgba(255,255,255,0.12)"
  hairline-strong: "#191c1f"
  divider-soft: "rgba(255,255,255,0.06)"
  accent-teal: "#00a87e"
  accent-blue-link: "#376cd5"
  accent-light-blue: "#007bc2"
  accent-light-green: "#428619"
  accent-green-text: "#006400"
  accent-yellow: "#b09000"
  accent-warning: "#ec7e00"
  accent-pink: "#e61e49"
  accent-danger: "#e23b4a"
  accent-deep-red: "#8b0000"
  accent-brown: "#936d62"
  link: "#376cd5"

typography:
  display-xxl:
    fontFamily: Aeonik Pro
    fontSize: 136px
    fontWeight: 500
    lineHeight: 1.0
    letterSpacing: -2.72px
  display-xl:
    fontFamily: Aeonik Pro
    fontSize: 80px
    fontWeight: 500
    lineHeight: 1.0
    letterSpacing: -0.8px
  display-lg:
    fontFamily: Aeonik Pro
    fontSize: 48px
    fontWeight: 500
    lineHeight: 1.21
    letterSpacing: -0.48px
  display-md:
    fontFamily: Aeonik Pro
    fontSize: 40px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: -0.4px
  heading-lg:
    fontFamily: Aeonik Pro
    fontSize: 32px
    fontWeight: 500
    lineHeight: 1.19
    letterSpacing: -0.32px
  heading-md:
    fontFamily: Aeonik Pro
    fontSize: 24px
    fontWeight: 500
    lineHeight: 1.33
    letterSpacing: 0
  heading-sm:
    fontFamily: Aeonik Pro
    fontSize: 20px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.56
    letterSpacing: -0.09px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0.24px
  body-md-bold:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: 0.16px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.43
  button-lg:
    fontFamily: Aeonik Pro
    fontSize: 20px
    fontWeight: 500
    lineHeight: 1.4
  button-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: 0.24px
  button-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.43
  caption:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.4
  link-emph:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: 0.24px

rounded:
  none: 0px
  sm: 8px
  md: 12px
  lg: 20px
  xl: 28px
  full: 9999px

spacing:
  xxs: 4px
  xs: 6px
  sm: 8px
  md: 14px
  lg: 16px
  xl: 24px
  xxl: 32px
  xxxl: 48px
  block: 80px
  section: 88px
  band: 120px

components:
  button-primary:
    backgroundColor: "{colors.canvas-light}"
    textColor: "{colors.canvas-dark}"
    typography: "{typography.button-md}"
    rounded: "{rounded.full}"
    padding: 14px 28px
    height: 48px
  button-primary-pressed:
    backgroundColor: "{colors.faint}"
    textColor: "{colors.canvas-dark}"
    typography: "{typography.button-md}"
    rounded: "{rounded.full}"
  button-dark:
    backgroundColor: "{colors.canvas-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.button-md}"
    rounded: "{rounded.full}"
    padding: 14px 28px
    height: 48px
  button-soft:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
    rounded: "{rounded.full}"
    padding: 14px 28px
    height: 48px
  button-outline-light:
    backgroundColor: "{colors.canvas-light}"
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
    rounded: "{rounded.full}"
    padding: 13px 27px
    height: 48px
  button-outline-dark:
    backgroundColor: "{colors.canvas-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.button-md}"
    rounded: "{rounded.full}"
    padding: 13px 27px
    height: 48px
  button-pill-sm:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.button-sm}"
    rounded: "{rounded.full}"
    padding: 8px 16px
    height: 36px
  text-input:
    backgroundColor: "{colors.canvas-light}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 14px 16px
    height: 56px
  hero-band-dark:
    backgroundColor: "{colors.canvas-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.display-xxl}"
    rounded: "{rounded.none}"
    padding: 88px 24px
  hero-band-photo:
    backgroundColor: "{colors.canvas-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.display-xl}"
    rounded: "{rounded.none}"
    padding: 0
  feature-card-light:
    backgroundColor: "{colors.canvas-light}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 32px
  feature-card-dark:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.on-dark}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 32px
  plan-card:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.on-dark}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 32px
  plan-card-featured:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 32px
  product-mockup:
    backgroundColor: "{colors.canvas-dark}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.xl}"
    padding: 48px
  download-tile:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 12px 20px
    height: 56px
  badge-tag:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: 4px 12px
  badge-feature:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: 4px 12px
  nav-bar:
    backgroundColor: "{colors.canvas-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.button-md}"
    rounded: "{rounded.none}"
    height: 64px
  sub-nav-pill:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.on-dark}"
    typography: "{typography.button-sm}"
    rounded: "{rounded.full}"
    padding: 8px 16px
  footer:
    backgroundColor: "{colors.canvas-dark}"
    textColor: "{colors.on-dark-mute}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.none}"
    padding: 80px 24px
---

## Overview

Revolut's marketing canvas operates in a high-contrast two-mode system: a
**near-black storytelling canvas** (`{colors.canvas-dark}` — `#000000`)
that hosts hero bands, product mockups, and the planning section, alternating
with **white catalogue bands** (`{colors.canvas-light}` — `#ffffff`) that
host comparison tables, FAQ rows, and download tiles. The two modes switch
in full-bleed bands rather than soft transitions; sections slam against each
other to create the magazine-spread rhythm the brand is known for.

The display typography is **Aeonik Pro at weight 500**, used at sizes from
20px to 136px. The flagship hero ("Banking & Beyond", "Join the 70+ million
using Revolut") sits at 80–136px with `lineHeight: 1.0` and tight negative
letter-spacing. Body type is **Inter** at weight 400 — open-source,
no-nonsense, paired with positive tracking (`0.24px`) on UI labels for
slightly more mechanical precision.

The brand accent is `{colors.primary}` (`#494fdf`) — a saturated cobalt
violet — but it appears scarcely on marketing surfaces. The actual primary
CTA on the hero is the **white pill on black** ("Choose your subscription"),
and the cobalt violet is reserved for featured plan cards, secondary CTAs in
white sections, and the brand glyph itself. A wide secondary palette of deep
teal, light-blue, deep-pink, light-green, warning orange, and yellow appears
inside product mockups and feature illustrations — never as button surfaces.

**Key Characteristics:**
- Two-mode canvas system — `{colors.canvas-dark}` (true black) for storytelling, `{colors.canvas-light}` (white) for browsing — switched in full-bleed bands.
- Display typography is **Aeonik Pro 500** at sizes 20–136px with tight `lineHeight: 1.0` and large negative letter-spacing on display sizes.
- The actual primary CTA is `{component.button-primary}` — a **white pill with black text**, sitting on the dark canvas as the brightest pixel. Cobalt-violet `{colors.primary}` is reserved for featured plan cards and secondary CTAs.
- Eight saturated accent colours live inside product mockups and illustrations only, never as button surfaces — teal, light-blue, deep-pink, light-green, warning orange, yellow, brown, danger red.
- All buttons are pill-shaped (`{rounded.full}`); content cards use `{rounded.lg}` (20px); inputs and small chips use `{rounded.md}` (12px).
- Photography is product-led — phone mockups, card mockups, terminal mockups — shown full-bleed inside dark sections with no caption overlay.

## Colors

### Brand & Accent
- **Cobalt Violet** (`{colors.primary}` — `#494fdf`): the brand accent. Reserved for featured plan cards (`{component.plan-card-featured}`), the brand wordmark icon, and secondary CTAs in white-canvas regions.
- **Cobalt Bright** (`{colors.primary-bright}` — `#4f55f1`): a one-step-up bright variant used in inline link colour and accent-photo headers.
- **Cobalt Deep** (`{colors.primary-deep}` — `#3a40c4`): the active/pressed state of cobalt elements.
- **On-Primary** (`{colors.on-primary}` — `#ffffff`): label colour on top of `{colors.primary}` surfaces.

### Surface
- **Canvas Light** (`{colors.canvas-light}` — `#ffffff`): the white catalogue mode for FAQ, download tiles, comparison tables.
- **Canvas Dark** (`{colors.canvas-dark}` — `#000000`): the storytelling canvas — true black, never near-black.
- **Surface Soft** (`{colors.surface-soft}` — `#f4f4f4`): a subtle off-white used on download tiles, soft buttons, and inset card groups inside white bands.
- **Surface Card** (`{colors.surface-card}` — `#ffffff`): pure white card surface, used for feature cards in white-canvas regions.
- **Surface Deep** (`{colors.surface-deep}` — `#0a0a0a`): a one-step-up dark surface for inset cards inside black-canvas regions.
- **Surface Elevated** (`{colors.surface-elevated}` — `#16181a`): the planning-section card background — slightly luminous, lifts plan cards off the black canvas.
- **Hairline Light** (`{colors.hairline-light}` — `#e2e2e7`): 1px dividers inside white bands.
- **Hairline Dark** (`{colors.hairline-dark}` — `rgba(255,255,255,0.12)`): the corresponding low-contrast divider in dark regions.
- **Hairline Strong** (`{colors.hairline-strong}` — `#191c1f`): structural full-strength dividers and the outline of light cards.

### Text
- **Ink** (`{colors.ink}` — `#191c1f`): primary text colour. Notably warmer than pure black, paired with the white canvas for body legibility.
- **Body** (`{colors.body}` — `#1f2226`): long-form body where `{colors.ink}` would feel slightly too sharp.
- **Charcoal** (`{colors.charcoal}` — `#3a3d40`): captions, secondary nav.
- **Mute** (`{colors.mute}` — `#505a63`): supporting text.
- **Ash** (`{colors.ash}` — `#5c5e60`): tertiary text, footer copy.
- **Stone** (`{colors.stone}` — `#8d969e`): metadata, subtle captions.
- **Faint** (`{colors.faint}` — `#c9c9cd`): disabled foreground, hairline replacements.
- **On-Dark** (`{colors.on-dark}` — `#ffffff`): primary text on `{colors.canvas-dark}`.
- **On-Dark Mute** (`{colors.on-dark-mute}` — `rgba(255,255,255,0.72)`): secondary text in dark regions.

### Semantic
- **Accent Teal** (`{colors.accent-teal}` — `#00a87e`): used in product mockup illustrations.
- **Accent Light Blue** (`{colors.accent-light-blue}` — `#007bc2`): inline link colour in dark photo headers.
- **Accent Blue Link** (`{colors.accent-blue-link}` — `#376cd5`): default inline link colour on white surfaces.
- **Accent Light Green** (`{colors.accent-light-green}` — `#428619`): success / positive product callouts.
- **Accent Green Text** (`{colors.accent-green-text}` — `#006400`): inline success text.
- **Accent Yellow** (`{colors.accent-yellow}` — `#b09000`): caution / pending state in product mockups.
- **Accent Warning** (`{colors.accent-warning}` — `#ec7e00`): full-saturation orange used in warning illustrations.
- **Accent Pink** (`{colors.accent-pink}` — `#e61e49`): deep pink — used inside product photography and category iconography.
- **Accent Danger** (`{colors.accent-danger}` — `#e23b4a`): destructive / error state.
- **Accent Deep Red** (`{colors.accent-deep-red}` — `#8b0000`): inline error text.
- **Accent Brown** (`{colors.accent-brown}` — `#936d62`): a single warm-neutral used in metals tier card chrome.
- **Link** (`{colors.link}` — `#376cd5`): default inline link colour. Same as `{colors.accent-blue-link}`.

## Typography

### Font Family

Revolut ships a two-family stack:

- **Aeonik Pro** — proprietary humanist sans-serif used for all display sizes (20px+) at weight 500. Carries the brand's editorial confidence; tightens dramatically with negative letter-spacing at large sizes.
- **Inter** — open-source workhorse for body, button labels, captions, and metadata. Always at weight 400 or 600, with positive tracking (`0.16–0.24px`) on UI labels.

When Aeonik Pro cannot be licensed, **Inter Display**, **General Sans**, or **Söhne** are credible substitutes — all share the warm geometric character. Apply -1% letter-spacing on display sizes to match the original tightness.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.display-xxl}` | 136px | 500 | 1.0 | -2.72px | The flagship hero ("Banking & Beyond"). One per page. |
| `{typography.display-xl}` | 80px | 500 | 1.0 | -0.8px | Section openers ("Join the 70+ million using Revolut"). |
| `{typography.display-lg}` | 48px | 500 | 1.21 | -0.48px | Sub-section titles. |
| `{typography.display-md}` | 40px | 500 | 1.2 | -0.4px | Feature card titles. |
| `{typography.heading-lg}` | 32px | 500 | 1.19 | -0.32px | Plan card titles. |
| `{typography.heading-md}` | 24px | 500 | 1.33 | 0 | Section sub-titles. |
| `{typography.heading-sm}` | 20px | 500 | 1.4 | 0 | List headers, prominent labels. |
| `{typography.body-lg}` | 18px | 400 | 1.56 | -0.09px | Marketing prose. |
| `{typography.body-md}` | 16px | 400 | 1.5 | 0.24px | Default body. |
| `{typography.body-md-bold}` | 16px | 600 | 1.5 | 0.16px | Emphatic body. |
| `{typography.body-sm}` | 14px | 400 | 1.43 | 0 | Captions, metadata. |
| `{typography.button-lg}` | 20px | 500 | 1.4 | 0 | Hero CTAs (Aeonik Pro). |
| `{typography.button-md}` | 16px | 600 | 1.5 | 0.24px | Default button label. |
| `{typography.button-sm}` | 14px | 600 | 1.43 | 0 | Pill chips, sub-nav. |
| `{typography.caption}` | 13px | 400 | 1.4 | 0 | Footer disclosure, regulatory text. |
| `{typography.link-emph}` | 16px | 700 | 1.5 | 0.24px | Emphatic inline link in dark mode. |

### Principles
- Display sizes always run at weight 500 with `lineHeight: 1.0` (or 1.19–1.21 below 48px). The negative letter-spacing scales with size — bigger types tighten more.
- Body Inter sits at weight 400 with positive tracking (`0.24px`) — the small spacing nudge makes UI labels feel slightly mechanical, fitting fintech precision.
- Hero CTAs use the Aeonik Pro `{typography.button-lg}` variant; everything below the hero uses the Inter `{typography.button-md}`.
- Inline links inside dark photo regions step up to weight 700 (`{typography.link-emph}`) so they hold contrast against the canvas without using the cobalt accent.

### Note on Font Substitutes

When Aeonik Pro is unavailable, clamp display `lineHeight` to 1.0 explicitly and apply -1% letter-spacing on display sizes. Inter Display, General Sans, or Söhne will read closest to the original. Inter is open-source and should be used directly.

## Layout

### Spacing System
- **Base unit**: 4px, with the working scale on multiples of 4 / 8 / 16.
- **Tokens**: `{spacing.xxs}` 4px · `{spacing.xs}` 6px · `{spacing.sm}` 8px · `{spacing.md}` 14px · `{spacing.lg}` 16px · `{spacing.xl}` 24px · `{spacing.xxl}` 32px · `{spacing.xxxl}` 48px · `{spacing.block}` 80px · `{spacing.section}` 88px · `{spacing.band}` 120px.
- Section padding: `{spacing.section}` (88px) vertical between bands; `{spacing.band}` (120px) on the hero band and the closing planning section.
- Card internal padding: `{spacing.xxl}` (32px) on `{component.feature-card-light}`, `{component.plan-card}`, `{component.feature-card-dark}`.

### Grid & Container
- **Max content width** ≈ 1200px on body sections; hero bands run full-bleed.
- **Plan grid**: 4-up plan cards on the home page, stacking 2-up at tablet and 1-up at small mobile.
- **Feature grid**: 3-up at desktop, 2-up at tablet, 1-up at mobile.
- **Product mockup bands**: a single full-width hero photo of a phone or card mockup, no surrounding chrome — the asset itself is the section.

### Whitespace Philosophy
- Whitespace is generous and editorial — sections breathe at 88–120px so display headlines have room to register at 80–136px without feeling cramped.
- Inside cards, padding stays at 32px so feature copy and plan tiers have a consistent rhythm.
- Hairline `{colors.hairline-light}` dividers replace shadow on white surfaces; `{colors.hairline-dark}` carries the corresponding role in dark regions.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| 0 — flat | No shadow, no border | Default canvas bands (light or dark), full-bleed hero. |
| 1 — surface card | `{colors.surface-card}` (white) on `{colors.surface-soft}` band | Feature cards inside light bands. |
| 2 — surface elevated dark | `{colors.surface-elevated}` (`#16181a`) on `{colors.canvas-dark}` | Plan cards inside the planning section. |
| 3 — featured surface | `{colors.primary}` on `{colors.canvas-dark}` | Featured plan card (cobalt violet inversion). |
| 4 — product mockup | Full-bleed photo asset | Hero phone / card / terminal mockup bands. |

The system has **no traditional drop-shadow language**. Surfaces register depth via colour-blocking (light → dark band switches) and surface-luminance shifts (`{colors.canvas-dark}` → `{colors.surface-elevated}`). Photography mockups carry their own depth from the asset itself.

### Decorative Depth
- **Product mockup hero bands** — the home page features a phone mockup full-bleed against `{colors.canvas-dark}`, with the device's own glow providing the only atmospheric depth. No additional gradients, no shadows.
- **Featured plan card** — the cobalt-violet `{component.plan-card-featured}` sits inside the otherwise dark planning grid as a single saturated colour block, marking the recommended tier visually.
- **Card metals tier** — the brand uses `{colors.accent-brown}` and a deep gradient on metals card mockups to signal premium without resorting to gold-on-black metallic effects.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.none}` | 0px | Hero bands, full-bleed sections, footer. |
| `{rounded.sm}` | 8px | Inline tags, small chips. |
| `{rounded.md}` | 12px | Form inputs, download tiles. |
| `{rounded.lg}` | 20px | Feature cards, plan cards. |
| `{rounded.xl}` | 28px | Product mockup containers. |
| `{rounded.full}` | 9999px | Buttons, pills, badges, tabs. |

### Photography Geometry
- Phone mockups: 9:19.5 (vertical) with `{rounded.xl}` corners on the device chrome.
- Card mockups: 1.586:1 (credit-card aspect) with `{rounded.lg}` corners.
- Terminal/POS mockups: 4:3 with `{rounded.xl}` corners and substantial padding around the device.
- Lifestyle photography (rare): 16:9 with `{rounded.lg}` corners.

## Components

### Buttons

**`button-primary`** — white CTA on dark
- Background `{colors.canvas-light}`, label `{colors.canvas-dark}`, type `{typography.button-md}`, padding `14px 28px`, `rounded: {rounded.full}`, height 48px.
- The brand's primary CTA, used on every dark hero band ("Choose your subscription", "Get started").
- Pressed state lives in `button-primary-pressed` (background `{colors.faint}`).

**`button-dark`** — dark CTA on light
- Background `{colors.canvas-dark}`, label `{colors.on-dark}`, type `{typography.button-md}`, `rounded: {rounded.full}`.
- The reverse-canvas equivalent of `{component.button-primary}` — used inside white catalogue bands.

**`button-soft`** — soft surface CTA
- Background `{colors.surface-soft}`, label `{colors.ink}`, type `{typography.button-md}`, `rounded: {rounded.full}`.
- Tertiary action in white-canvas regions ("Learn more", "View FAQs").

**`button-outline-light`** — outlined CTA on light
- Background `{colors.canvas-light}`, label `{colors.ink}`, 1px solid `{colors.hairline-strong}`, type `{typography.button-md}`, `rounded: {rounded.full}`.
- Secondary action when paired with `{component.button-dark}`.

**`button-outline-dark`** — outlined CTA on dark
- Background `{colors.canvas-dark}`, label `{colors.on-dark}`, 1px solid `{colors.on-dark}`, type `{typography.button-md}`, `rounded: {rounded.full}`, padding `13px 27px`, height 48px.
- Dark-canvas counterpart of `{component.button-outline-light}`; used inside dark hero bands as a tertiary action when paired with `{component.button-primary}`.

**`button-pill-sm`** — small pill chip
- Background `{colors.surface-soft}`, label `{colors.ink}`, type `{typography.button-sm}`, `rounded: {rounded.full}`, padding `8px 16px`, height 36px.
- Sub-nav chips, filter pills.

### Cards & Containers

**`hero-band-dark`** — full-bleed dark hero
- Background `{colors.canvas-dark}`, text `{colors.on-dark}`, type `{typography.display-xxl}` for the title, padding `{spacing.section}` (88px) vertical, `rounded: {rounded.none}`.
- Used only on the home page hero band.

**`hero-band-photo`** — photo-led hero
- Background `{colors.canvas-dark}` with full-bleed product photography, text `{colors.on-dark}`, type `{typography.display-xl}`, `rounded: {rounded.none}`.
- Used on product pages — phone or card mockup as the full-band canvas.

**`feature-card-light`** — feature card on white
- Background `{colors.surface-card}`, text `{colors.ink}`, 1px solid `{colors.hairline-light}`, type `{typography.body-md}`, `rounded: {rounded.lg}`, padding `{spacing.xxl}` (32px).
- Used in white catalogue bands for feature comparisons.

**`feature-card-dark`** — feature card on dark
- Background `{colors.surface-elevated}`, text `{colors.on-dark}`, type `{typography.body-md}`, `rounded: {rounded.lg}`, padding `{spacing.xxl}`.
- Used inside dark storytelling sections.

**`plan-card`** — subscription plan card
- Background `{colors.surface-elevated}`, text `{colors.on-dark}`, type `{typography.body-md}`, `rounded: {rounded.lg}`, padding `{spacing.xxl}` (32px).
- Plan name in `{typography.heading-lg}` ("Standard", "Plus", "Premium", "Metal", "Ultra").

**`plan-card-featured`** — featured plan card
- Background `{colors.primary}`, text `{colors.on-primary}`, type `{typography.body-md}`, `rounded: {rounded.lg}`, padding `{spacing.xxl}`.
- Cobalt-violet inversion of `{component.plan-card}` — used on the recommended tier.

**`product-mockup`** — full-bleed product asset
- Background `{colors.canvas-dark}`, the asset itself fills the band, `rounded: {rounded.xl}` on the device chrome.
- Phone, card, and terminal mockups — no caption overlay, no surrounding chrome.

**`download-tile`** — app store download tile
- Background `{colors.surface-soft}`, text `{colors.ink}`, type `{typography.body-sm}`, `rounded: {rounded.md}`, padding `12px 20px`, height 56px.
- App Store + Google Play download buttons, side-by-side.

### Inputs & Forms

**`text-input`** — default input
- Background `{colors.canvas-light}`, text `{colors.ink}`, type `{typography.body-md}`, 1px solid `{colors.hairline-light}`, `rounded: {rounded.md}`, padding `14px 16px`, height 56px.
- Generous height for fintech accessibility — comfortably exceeds WCAG AAA touch target.

### Navigation

**`nav-bar`** — top nav (desktop)
- Background `{colors.canvas-dark}`, text `{colors.on-dark}`, type `{typography.button-md}`, height 64px.
- Left: wordmark logo. Centre: top-level nav ("Personal", "Business", "Company"). Right: language switcher + "Log in" + `{component.button-primary}`.

**`nav-bar`** (mobile)
- Same height 64px, collapses centre nav into a hamburger icon. Logo stays left, sign-in CTA stays right.

**`sub-nav-pill`** — sub-nav chip
- Pill chips set in a horizontal row inside dark sections (e.g. "Personal", "Business", "Premium"), `{component.sub-nav-pill}` styling.

### Signature Components

**`badge-tag`** — neutral tag
- Background `{colors.surface-soft}`, text `{colors.ink}`, type `{typography.caption}`, `rounded: {rounded.full}`, padding `4px 12px`.
- Inline tags inside feature cards.

**`badge-feature`** — feature highlight badge
- Background `{colors.primary}`, text `{colors.on-primary}`, type `{typography.caption}`, `rounded: {rounded.full}`, padding `4px 12px`.
- "New", "Most popular" badges anchored on plan cards.

**`footer`** — global footer
- Background `{colors.canvas-dark}`, text `{colors.on-dark-mute}`, type `{typography.body-sm}`, `rounded: {rounded.none}`, padding `80px 24px`.
- Multi-column quick-links grid above a copyright + regulatory disclosure block separated by `{colors.divider-soft}`.

## Do's and Don'ts

### Do
- Switch full bands between `{colors.canvas-dark}` (storytelling) and `{colors.canvas-light}` (catalogue). The two-mode rhythm is core.
- Use `{component.button-primary}` (white pill on dark) as the primary CTA on every dark hero band. It's the brand's loudest action.
- Reserve `{colors.primary}` for the featured plan card and the brand wordmark — the cobalt should feel like a deliberate stamp, not a colour theme.
- Set hero headlines in **Aeonik Pro 500** at 80–136px with `lineHeight: 1.0` and large negative letter-spacing.
- Use **Inter** for body, button labels, captions — never substitute Aeonik Pro for body type.
- Apply `{rounded.full}` to every button and pill; `{rounded.lg}` (20px) to feature and plan cards; `{rounded.md}` (12px) to inputs.
- Show product mockups full-bleed inside dark sections — the asset IS the section.
- Use the wide accent palette (`{colors.accent-teal}`, `{colors.accent-pink}`, `{colors.accent-light-green}`, etc.) inside product illustrations and iconography only.

### Don't
- Don't use accent colours (`{colors.accent-teal}`, `{colors.accent-pink}`, etc.) as button surfaces. They live inside illustrations only.
- Don't use a near-black canvas. The brand is `#000000`, not `#0a0a0a`.
- Don't pair white text with cobalt violet inside body content — `{colors.primary}` is for the featured plan card surface, not large prose.
- Don't add drop shadows on cards. Elevation is canvas + surface-luminance shifts.
- Don't introduce a secondary brand colour. Cobalt violet is the only brand stamp.
- Don't loosen Aeonik Pro `lineHeight` past 1.0 on display sizes. Tight stacking is structural.
- Don't bump body Inter to weight 500. Use 400 (default) or 600 (emphatic) — never the in-between.
- Don't pair `{colors.canvas-dark}` with another dark surface beyond `{colors.surface-elevated}`. The surface ladder has only two dark steps.

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Desktop XL | ≥ 1440px | 4-up plan grid, full-bleed product mockup bands, max content 1200. |
| Desktop | 1280–1439px | Container shrinks; xl side padding. |
| Tablet Large | 1024–1279px | Plan grid 4-up; feature grid 3-up. |
| Tablet | 768–1023px | Plan grid 2-up; feature grid 2-up. |
| Mobile Large | 426–767px | Plan grid 1-up; feature grid 1-up; nav collapses to hamburger; hero `display-xxl` clamps to 64px. |
| Mobile | ≤ 425px | All grids 1-up; hero clamps to 48px; section padding `{spacing.section}` collapses to 64px. |

### Touch Targets
- All buttons ship at minimum 48px tall — comfortably exceeds WCAG AAA (44px). Default `{component.button-primary}` is 48px.
- `{component.text-input}` is 56px tall — fintech-grade accessibility.
- `{component.button-pill-sm}` (36px) is bumped to 44px on mobile via padding adjustment.

### Collapsing Strategy
- Top-level nav collapses to hamburger at < 1024px; the wordmark and `{component.button-primary}` stay anchored.
- Hero `{typography.display-xxl}` clamps: 136px → 80px → 64px → 48px across the breakpoint ladder.
- Plan grid steps from 4-up to 2-up at < 1024px to 1-up at < 768px.
- Product mockup bands maintain full-bleed at every breakpoint; the asset crops inward rather than letterboxing.
- Sub-nav pills convert from a wrap row to a horizontal scroll-rail at < 768px.

### Image Behavior
- Phone and card mockups are served at 1.5× and 2× DPR; below 768px the system swaps to a smaller hero crop.
- Product photography retains its own atmospheric lighting at every breakpoint — no responsive variant assets.

## Iteration Guide

1. Focus on ONE component at a time. Most surfaces share the `{colors.canvas-dark}` / `{colors.canvas-light}` pair with `{rounded.full}` for buttons and `{rounded.lg}` for cards.
2. Reference component names and tokens directly (`{colors.primary}`, `{component.plan-card-featured}`, `{rounded.lg}`) — do not paraphrase.
3. Run `npx @google/design.md lint DESIGN.md` after edits; orphaned-tokens warnings will catch unused entries.
4. Add new variants as separate entries (`-pressed`, `-featured`, `-disabled`) — do not bury them in prose.
5. Default body type to `{typography.body-md}` (Inter 400 with positive tracking); reach for `{typography.body-md-bold}` only on emphasis.
6. Keep `{colors.primary}` scarce — if more than one cobalt-violet element appears per viewport, ask whether one should drop to `{component.plan-card}` (`{colors.surface-elevated}`) instead.

## Known Gaps

- Pressed/active visual states are documented for `button-primary-pressed` only; other components rely on focus-ring (browser default) for interactive feedback.
- Logged-in app surfaces (transactions, transfers, account settings) are out of scope — only the public marketing canvas is documented.
- The wide accent palette (`{colors.accent-teal}` through `{colors.accent-brown}`) is captured from the extracted token set, but exact usage inside product illustrations varies per market and product line; document per-illustration rather than as system buttons.
- Mobile-app screenshot art direction (phone bezels, status bars) is product-photography territory and not standardised as design tokens.

# --- Cofre accent: Stripe number elegance ---
---
version: alpha
name: Stripi-design-analysis
description: An inspired interpretation of Stripi's design language — a financial-infrastructure brand built on a deep navy ink, an electric indigo primary, and a recurring atmospheric gradient mesh that occupies the upper third of nearly every marketing page. The system pairs the proprietary Sohne family at thin (300) weights with negative letter-spacing for editorial-density display headlines, and uses tabular-figure body type where money and numerics matter. Buttons are tight-radius pills, cards live on near-white surfaces, and the dashboard track flips polarity to a familiar dark-app shell.

colors:
  primary: "#533afd"
  primary-deep: "#4434d4"
  primary-press: "#2e2b8c"
  primary-soft: "#665efd"
  primary-bg-subdued-hover: "#b9b9f9"
  brand-dark-900: "#1c1e54"
  ink: "#0d253d"
  ink-secondary: "#273951"
  ink-mute: "#64748d"
  ink-mute-2: "#61718a"
  on-primary: "#ffffff"
  canvas: "#ffffff"
  canvas-soft: "#f6f9fc"
  canvas-cream: "#f5e9d4"
  hairline: "#e3e8ee"
  hairline-input: "#a8c3de"
  ruby: "#ea2261"
  magenta: "#f96bee"
  lemon: "#9b6829"
  shadow-blue: "#003770"

typography:
  display-xxl:
    fontFamily: "sohne-var, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 56px
    fontWeight: 300
    lineHeight: 1.03
    letterSpacing: -1.4px
    fontFeature: ss01
  display-xl:
    fontFamily: "sohne-var, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 48px
    fontWeight: 300
    lineHeight: 1.15
    letterSpacing: -0.96px
    fontFeature: ss01
  display-lg:
    fontFamily: "sohne-var, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 32px
    fontWeight: 300
    lineHeight: 1.1
    letterSpacing: -0.64px
    fontFeature: ss01
  display-md:
    fontFamily: "sohne-var, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 26px
    fontWeight: 300
    lineHeight: 1.12
    letterSpacing: -0.26px
    fontFeature: ss01
  heading-lg:
    fontFamily: "sohne-var, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 22px
    fontWeight: 300
    lineHeight: 1.1
    letterSpacing: -0.22px
    fontFeature: ss01
  heading-md:
    fontFamily: "sohne-var, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 20px
    fontWeight: 300
    lineHeight: 1.4
    letterSpacing: -0.2px
    fontFeature: ss01
  heading-sm:
    fontFamily: "sohne-var, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 18px
    fontWeight: 300
    lineHeight: 1.4
    letterSpacing: 0
    fontFeature: ss01
  body-lg:
    fontFamily: "sohne-var, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 16px
    fontWeight: 300
    lineHeight: 1.4
    letterSpacing: 0
    fontFeature: ss01
  body-md:
    fontFamily: "sohne-var, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 15px
    fontWeight: 300
    lineHeight: 1.4
    letterSpacing: 0
    fontFeature: ss01
  body-tabular:
    fontFamily: "sohne-var, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 14px
    fontWeight: 300
    lineHeight: 1.4
    letterSpacing: -0.42px
    fontFeature: tnum
  button-md:
    fontFamily: "sohne-var, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.0
    letterSpacing: 0
    fontFeature: ss01
  button-sm:
    fontFamily: "sohne-var, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.0
    letterSpacing: 0
    fontFeature: ss01
  caption:
    fontFamily: "sohne-var, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: -0.39px
    fontFeature: tnum
  micro:
    fontFamily: "sohne-var, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 11px
    fontWeight: 300
    lineHeight: 1.4
    letterSpacing: 0
    fontFeature: ss01
  micro-cap:
    fontFamily: "sohne-var, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 10px
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: 0.1px
    fontFeature: ss01

rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  pill: 9999px

spacing:
  xxs: 2px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
  huge: 64px

components:
  button-primary-pill:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.pill}"
    padding: 8px 16px
  button-primary-pill-pressed:
    backgroundColor: "{colors.primary-press}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.pill}"
    padding: 8px 16px
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.pill}"
    padding: 8px 16px
  button-on-dark:
    backgroundColor: "{colors.brand-dark-900}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.pill}"
    padding: 8px 16px
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 8px 12px
  text-input-focused:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 8px 12px
  card-feature-light:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 32px
  card-pricing:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 32px
  card-pricing-featured:
    backgroundColor: "{colors.brand-dark-900}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 32px
  card-cream-band:
    backgroundColor: "{colors.canvas-cream}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 32px
  card-dashboard-mockup:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-tabular}"
    rounded: "{rounded.lg}"
    padding: 24px
  pill-tag-soft:
    backgroundColor: "{colors.primary-bg-subdued-hover}"
    textColor: "{colors.primary-deep}"
    typography: "{typography.micro-cap}"
    rounded: "{rounded.pill}"
    padding: 4px 8px
  nav-bar-on-mesh:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xs}"
    padding: 16px 24px
  link-on-light:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xs}"
    padding: 0px
  footer-light:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-mute}"
    typography: "{typography.caption}"
    rounded: "{rounded.xs}"
    padding: 64px 24px
---

## Overview

Stripi's design language opens with the gradient mesh. A wide horizontal band of pastel cream, sherbet orange, lavender, electric indigo, and ruby pink occupies the upper third of nearly every marketing page — the brand's instantly-recognizable atmospheric backdrop. Type and product UI mockups float above it on `{colors.canvas}` (white), with the gradient acting as both decoration and visual anchor. The lower portion of the page returns to white, with feature explanations on `{colors.canvas-soft}` (a barely-tinted cool off-white) and dashboard product mockups composited as faux IDE/console panels in deep navy.

The color system has two primary roles. **Indigo** (`{colors.primary}` — `#533afd`) is the brand's signature CTA color, used sparingly: one filled pill per band. **Deep navy** (`{colors.ink}` — `#0d253d`) is the universal body text color and the fill of dashboard mockups, the featured pricing tier, and the dark-app surfaces on the dashboard track. Ruby (`{colors.ruby}`) and magenta (`{colors.magenta}`) appear inside the gradient mesh and as accent dots in product UI mockups; they are not used as button colors.

Typography is built around **Sohne** at weight 300 with negative letter-spacing — the brand's editorial-density display signature. Display sizes (32–56px) use -1.4px to -0.64px tracking; body sizes use 0; tabular caption sizes (where money and numerics matter) use the OpenType `tnum` feature plus a tightening -0.36 to -0.42px tracking. The `ss01` stylistic set is enabled across all roles.

**Key Characteristics:**
- Gradient-mesh backdrop on every marketing hero — cream/orange/lavender/indigo/ruby horizontally washed across the upper third of the page.
- Single-indigo CTA hierarchy: filled `{colors.primary}` pill is the only filled button on marketing surfaces.
- Sohne thin (weight 300) display tier with negative tracking from -1.4px to -0.2px depending on size.
- Tabular-figure body type (`tnum`) for any cell containing money or numerics — the brand's quiet financial-data signal.
- Dark-app dashboard track: deep navy product UI mockups sit composited above the white canvas, frequently with rendered code or dashboard tables inside.
- Pill-shaped buttons (`{rounded.pill}` 9999px) with tight `8px 16px` padding — short, decisive, transactional.
- Cream-band feature cards (`{colors.canvas-cream}`) introduce a warm interlude between blue/white sections without breaking the brand's chromatic logic.

## Colors

> **Source pages:** home (`/`), `/payments`, `/pricing`, `dashboard.stripe.com/register/payments`.

### Brand & Accent
- **Indigo** (`{colors.primary}` — `#533afd`): The brand's signature CTA color. Filled-pill button, link emphasis, gradient anchor.
- **Indigo Deep** (`{colors.primary-deep}` — `#4434d4`): A deeper indigo used in gradient mid-stops and as the press-state warmer alternative.
- **Indigo Press** (`{colors.primary-press}` — `#2e2b8c`): Pressed-state lift of the primary.
- **Indigo Soft** (`{colors.primary-soft}` — `#665efd`): A lighter indigo used in product-UI accents and chart highlights.
- **Indigo Subdued** (`{colors.primary-bg-subdued-hover}` — `#b9b9f9`): Pale indigo fill used as soft tag background.
- **Brand Dark 900** (`{colors.brand-dark-900}` — `#1c1e54`): The deep navy used on the featured pricing tier and dashboard chrome.
- **Ruby** (`{colors.ruby}` — `#ea2261`): Gradient accent and chart highlight; never a button.
- **Magenta** (`{colors.magenta}` — `#f96bee`): Brighter pink stop in gradient meshes.
- **Lemon** (`{colors.lemon}` — `#9b6829`): Warm sherbet stop in gradient backdrops.

### Surface
- **Canvas** (`{colors.canvas}` — `#ffffff`): Default page background.
- **Canvas Soft** (`{colors.canvas-soft}` — `#f6f9fc`): Cool-tinted off-white used on feature bands beneath the gradient hero.
- **Canvas Cream** (`{colors.canvas-cream}` — `#f5e9d4`): Warm cream used as a feature-band fill — the brand's chromatic interlude.
- **Hairline** (`{colors.hairline}` — `#e3e8ee`): 1px borders on cards and tables.
- **Hairline Input** (`{colors.hairline-input}` — `#a8c3de`): Slightly cooler hairline used on form inputs.

### Text
- **Ink** (`{colors.ink}` — `#0d253d`): Default body text color across the brand. Deep navy, never pure black.
- **Ink Secondary** (`{colors.ink-secondary}` — `#273951`): Secondary text on white.
- **Ink Mute** (`{colors.ink-mute}` — `#64748d`): Helper text, captions, table labels.
- **Ink Mute 2** (`{colors.ink-mute-2}` — `#61718a`): Near-equivalent to ink-mute used in nav.
- **On Primary** (`{colors.on-primary}` — `#ffffff`): Text on indigo / dark-navy surfaces.

### Semantic
The brand does not use a separate semantic color palette in the marketing system — error / success states live in dashboard-product UI specifically.

## Typography

### Font Family

The display and UI tier is **Sohne** (proprietary, licensed from Klim Type Foundry) at weights 300 (thin) and 400 (regular). The variable font (`sohne-var`) is loaded with `font-feature-settings: "ss01"` enabled globally — the stylistic set substitutes a single-story `a` and other character variants that are part of the brand's typographic signature.

When Sohne is unavailable, fall back to **SF Pro Display** at thin weights, then system-ui. For maximum brand fidelity, **Inter** (open-source) at weight 300 with `font-feature-settings: "ss01"` and `letter-spacing: -1.4px` on display sizes approximates the rhythm closely.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.display-xxl}` | 56px | 300 | 1.03 | -1.4px | Hero headline |
| `{typography.display-xl}` | 48px | 300 | 1.15 | -0.96px | Section opener |
| `{typography.display-lg}` | 32px | 300 | 1.1 | -0.64px | Card title / sub-section |
| `{typography.display-md}` | 26px | 300 | 1.12 | -0.26px | Compact card title |
| `{typography.heading-lg}` | 22px | 300 | 1.1 | -0.22px | Pricing tier name |
| `{typography.heading-md}` | 20px | 300 | 1.4 | -0.2px | Section sub-heading |
| `{typography.heading-sm}` | 18px | 300 | 1.4 | 0 | Mini-section label |
| `{typography.body-lg}` | 16px | 300 | 1.4 | 0 | Marketing body lead |
| `{typography.body-md}` | 15px | 300 | 1.4 | 0 | Default UI body |
| `{typography.body-tabular}` | 14px | 300 | 1.4 | -0.42px | Money / numeric tables (uses `tnum`) |
| `{typography.button-md}` | 16px | 400 | 1.0 | 0 | Pill button label |
| `{typography.button-sm}` | 14px | 400 | 1.0 | 0 | Compact pill label |
| `{typography.caption}` | 13px | 400 | 1.4 | -0.39px | Helper, table labels |
| `{typography.micro}` | 11px | 300 | 1.4 | 0 | Fine print |
| `{typography.micro-cap}` | 10px | 400 | 1.15 | 0.1px | All-caps eyebrow |

### Principles
- **Thin weight is the brand.** Display tiers always render at weight 300. Bumping to 400+ removes the brand's editorial air.
- **Negative tracking on display.** -1.4px at 56px, scaling proportionally down to -0.2px at 20px. The negative tracking is the brand's typographic signature.
- **Tabular figures for money.** Any cell rendering currency, transaction amounts, or numeric counts uses `font-feature-settings: "tnum"` plus a tightening tracking. The brand quietly signals its financial DNA through this micro-detail.
- **`ss01` globally.** Apply `font-feature-settings: "ss01"` to the body element so the stylistic-set substitution is on for every text role.

### Note on Font Substitutes
Sohne is proprietary. Use **Inter** (open-source via Google Fonts) at weight 300 with `letter-spacing: -1.4px` and `font-feature-settings: "ss01"` for display tiers — Inter is the closest open-source analogue. For body sizes, Inter at 300 weight with `font-feature-settings: "tnum"` (where applicable) is the canonical substitute. Avoid Helvetica or system-ui defaults — they're heavier than the brand needs.

## Layout

### Spacing System
- **Base unit**: 8px (with 2 / 4 / 12 sub-tokens for fine work).
- **Tokens**: `{spacing.xxs}` 2px · `{spacing.xs}` 4px · `{spacing.sm}` 8px · `{spacing.md}` 12px · `{spacing.lg}` 16px · `{spacing.xl}` 24px · `{spacing.xxl}` 32px · `{spacing.huge}` 64px.
- **Section padding**: 64–96px on marketing surfaces; 32–48px on dashboard / product surfaces.
- **Card internal padding**: 32px on feature cards; 24px on dashboard mockups.

### Grid & Container
- Marketing pages center in a ~1200px container with the gradient mesh extending edge-to-edge above.
- Pricing collapses 4-up → 2-up → 1-up at 1024 / 768 breakpoints.
- Dashboard product mockups use their own internal grids (12-col tables, 3-col card grids) rendered as static composites.

### Whitespace Philosophy
The gradient mesh occupies the upper third of the page; the white canvas below is generously padded. Section gaps tend toward 96px, with content tightening to 32px on dashboard / pricing pages where users compare and act.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| 0 | Flat | Default surface |
| 1 | `box-shadow: rgba(0,55,112,0.08) 0 1px 3px` | Card lift on white |
| 2 | `box-shadow: rgba(0,55,112,0.08) 0 8px 24px, rgba(0,55,112,0.04) 0 2px 6px` | Floating panels, dashboard mockup chrome |
| 3 | Gradient mesh backdrop | The brand's primary depth medium — atmospheric color rather than literal shadow |

### Decorative Depth
The gradient mesh IS the depth system. Implemented as a layered SVG or large background image rather than CSS gradients (the actual mesh has organic blob shapes that aren't CSS-renderable). The mesh provides the brand's signature lift; literal shadows are reserved for product-UI mockups and stay subtle.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.xs}` | 4px | Hairline tags, table chrome |
| `{rounded.sm}` | 6px | Form inputs |
| `{rounded.md}` | 8px | Compact cards, alerts |
| `{rounded.lg}` | 12px | Pricing cards, feature cards |
| `{rounded.xl}` | 16px | Dashboard product mockup chrome |
| `{rounded.pill}` | 9999px | All buttons, tag pills |

### Photography Geometry
The brand uses **product UI mockups** more than photography. Dashboard composites render as faux IDE/terminal/dashboard chrome inside `{rounded.lg}` 12px containers with a subtle `box-shadow`. Real photography appears in customer logo strips and the rare case-study card; treated as inset 4:3 with no shadow.

## Components

### Buttons

**`button-primary-pill`** — the dominant CTA system-wide.
- Background `{colors.primary}`, text `{colors.on-primary}`, type `{typography.button-md}`, padding `{spacing.sm} {spacing.lg}` (8px 16px), rounded `{rounded.pill}` 9999px.
- Pressed state `button-primary-pill-pressed` shifts background to `{colors.primary-press}`.

**`button-secondary`** — outline-style alternative.
- Background `{colors.canvas}`, text `{colors.primary}`, 1px solid `{colors.primary}` border, same pill geometry.

**`button-on-dark`** — used on dashboard / dark surfaces.
- Background `{colors.brand-dark-900}`, text `{colors.on-primary}`, same pill geometry.

### Cards & Containers

**`card-feature-light`** — feature explanation card on white.
- Background `{colors.canvas}`, padding `{spacing.xxl}`, rounded `{rounded.lg}` 12px, 1px `{colors.hairline}` border, optional Level 1 shadow.

**`card-pricing`** — standard pricing tier.
- Background `{colors.canvas}`, padding `{spacing.xxl}`, rounded `{rounded.lg}`, 1px `{colors.hairline}` border. Title `{typography.heading-lg}`, price `{typography.display-md}`, body `{typography.body-md}`, CTA pinned bottom as `button-primary-pill`.

**`card-pricing-featured`** — the inverted dark featured tier.
- Background `{colors.brand-dark-900}`, text `{colors.on-primary}`, otherwise identical structure to `card-pricing`. The deep-navy fill is the brand's distinctive featured-tier choice.

**`card-cream-band`** — warm interlude card.
- Background `{colors.canvas-cream}`, text `{colors.ink}`, padding `{spacing.xxl}`, rounded `{rounded.lg}`. Used to break up the indigo / white rhythm with warmth.

**`card-dashboard-mockup`** — composited dashboard / product UI screenshot.
- Background `{colors.canvas}`, type `{typography.body-tabular}` (with `tnum`), padding `{spacing.xl}` 24px, rounded `{rounded.lg}` 12px, Level 2 shadow. Often contains nested mini-mockups: code preview + dashboard table + chart card.

### Inputs & Forms

**`text-input`** — standard form field.
- Background `{colors.canvas}`, text `{colors.ink}`, type `{typography.body-md}`, padding `{spacing.sm} {spacing.md}` (8px 12px), rounded `{rounded.sm}` 6px, 1px `{colors.hairline-input}` border.
- Focus state `text-input-focused`: border swaps to `{colors.primary}`.

### Navigation

**`nav-bar-on-mesh`** — top nav floating over the gradient hero.
- Background `{colors.canvas}` (or transparent depending on scroll), text `{colors.ink}`, padding `{spacing.lg} {spacing.xl}`. Logo wordmark on the left, primary nav center, sign-in + filled `button-primary-pill` on the right.

### Pills, Tags, and Chips

**`pill-tag-soft`** — subdued indigo tag.
- Background `{colors.primary-bg-subdued-hover}`, text `{colors.primary-deep}`, type `{typography.micro-cap}`, padding `4px 8px`, rounded `{rounded.pill}`.

### Signature Components

**Gradient Mesh Backdrop** — pastel cream → sherbet orange → lavender → indigo → ruby pink stops blurred horizontally across the upper third of the page. Implemented as SVG or a large background image — not a flat CSS gradient (the real mesh has organic blob shapes).

**Composited Dashboard Mockup** — multi-layer faux-product-UI compositions: an IDE panel on the left, a dashboard table center, a chart card on the right, all rendered at small scale inside `{rounded.lg}` containers with subtle Level 2 shadows. The composite is the brand's most-photographed feature.

**Tabular-Figure Money Type** — every number rendering money, count, or transaction value uses `font-feature-settings: "tnum"`. The brand's quiet signal that it's a financial-infrastructure platform.

**`link-on-light`** — inline links on light surfaces.
- Text `{colors.primary}` rendered in `{typography.body-md}`, no underline by default.

**`footer-light`** — site-wide footer.
- Background `{colors.canvas}`, text `{colors.ink-mute}`, type `{typography.caption}`, padding `{spacing.huge} {spacing.xl}` (64px 24px). Holds 4–6 columns of link groups, social icons, and a small legal row.

## Do's and Don'ts

### Do
- Reserve `{colors.primary}` for filled CTAs and inline link emphasis — it should appear sparingly, one filled button per band.
- Apply the gradient mesh to every marketing hero; bare-canvas heroes feel off-brand.
- Render display tiers at weight 300 with negative letter-spacing — the thin tracking is the typographic signature.
- Use `font-feature-settings: "tnum"` on every money / numeric cell.
- Apply `font-feature-settings: "ss01"` globally on the body element.
- Pair every feature explanation with a composited product UI mockup; the brand's argument is "look at the actual product."

### Don't
- Don't bump display weight above 300 — at 400 the brand's editorial air collapses.
- Don't add new accent colors outside the documented gradient stops (cream / orange / lavender / indigo / ruby / magenta).
- Don't use the indigo `{colors.primary}` as a body-text color — it's a CTA and link color, not a type color at body size.
- Don't shrink button padding below `8px 16px` — the tight pill is part of the brand's transactional feel.
- Don't render money cells without `tnum` — it breaks the quiet financial-data signature.
- Don't replace the pill shape with rounded-rectangles for buttons.

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Wide | ≥ 1440px | Full gradient mesh edge-to-edge; dashboard composite at full scale |
| Desktop | 1024–1440px | Default content max-width; pricing 4-up |
| Tablet | 768–1023px | Pricing 2-up; dashboard composite simplifies to 2 panels |
| Mobile | < 768px | Pricing 1-up; hamburger nav; display drops 56 → 36px |

### Touch Targets
- Pill buttons hit ≥ 40×40px on mobile via padding scaling. On smaller screens, buttons size up to 44×44px to maintain WCAG AAA.
- Form fields stay at 40px minimum height.

### Collapsing Strategy
- Display tiers stair-step 56 → 48 → 32 → 26 → 22px through the breakpoints.
- Gradient mesh re-tiles on mobile to preserve the wash without disappearing.
- Dashboard composites simplify to single-panel mockups on mobile; the multi-layer composition only renders at desktop+.
- Pricing tiers stair-step 4-up → 2-up → 1-up.

### Image Behavior
Product UI composites use `srcset` with art-direction crops at major breakpoints. Mobile crops focus on the most actionable inner panel; desktop crops show the full multi-layer composition.

## Iteration Guide

1. Focus on ONE component at a time.
2. Reference component names and tokens directly (`{colors.primary}`, `{button-primary-pill}-pressed`, `{rounded.pill}`).
3. Run `npx @google/design.md lint DESIGN.md` after edits.
4. Add new variants as separate entries.
5. Default body to `{typography.body-md}` (15px); use `{typography.body-tabular}` for any money / numeric cell.
6. Apply `ss01` globally on the body; apply `tnum` per-element on numeric content.
7. The gradient mesh is non-negotiable on marketing heroes — bare-canvas heroes break the brand.
