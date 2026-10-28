---
name: BUBBLE BLAST ADVENTURE
description: High-Polish Mobile-First Arcade Bubble Shooter with Deterministic Hex Physics
colors:
  primary: "#F59E0B"
  primary-hover: "#FBBF24"
  primary-bevel: "#B45309"
  neutral-bg: "#0B0F19"
  surface-card: "#111827"
  surface-card-border: "#1E293B"
  text-primary: "#F8FAFC"
  text-secondary: "#94A3B8"
  text-muted: "#64748B"
  accent-cyan: "#38BDF8"
  accent-rose: "#FB7185"
  accent-emerald: "#34D399"
  bubble-ruby: "#EF4444"
  bubble-sapphire: "#3B82F6"
  bubble-emerald: "#10B981"
  bubble-amber: "#FACC15"
  bubble-amethyst: "#A855F7"
  bubble-tangerine: "#F97316"
  bubble-pink: "#EC4899"
  bubble-cyan: "#06B6D4"
typography:
  display:
    fontFamily: "Fredoka, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  heading:
    fontFamily: "Fredoka, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0em"
  caption:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.01em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#020617"
    rounded: "{rounded.xl}"
    padding: "14px 28px"
    height: "52px"
  button-utility:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "10px 16px"
    height: "44px"
---

## Overview

BUBBLE BLAST ADVENTURE combines classic King and Supercell arcade tactile satisfaction with modern responsive web standards. It prioritizes deep atmospheric contrast, chunky 3D push-down buttons, fluid spring-eased micro-interactions, and instant audio-visual feedback on mobile and desktop viewports.

## Colors

- **Ground & Atmosphere:** Midnight Obsidian (`#0B0F19` to `#111827`). Never use oversaturated purple-to-blue neon gradients. Muted obsidian gives maximum luminance contrast for colored bubbles.
- **Primary CTA:** Amber Gold (`#F59E0B` gradient with `#B45309` 4px bottom bevel and `#020617` text).
- **Core Bubble Pigments:** Ruby (`#EF4444`), Sapphire (`#3B82F6`), Emerald (`#10B981`), Amber (`#FACC15`), Amethyst (`#A855F7`), Tangerine (`#F97316`), Pink (`#EC4899`), Cyan (`#06B6D4`). Each bubble rendered with an inner white crescent specular reflection.
- **Functional Accents:** Emerald for completion/success, Rose for ammo warning/defeat, Cyan for energy/shields, Amber for coins/stars.

## Typography

- **Display & Headings:** `Fredoka` (weights 700 to 900). Gives arcade titles, level badges, and score counters a chunky, friendly, energetic feel with neutral drop shadow (`text-shadow: 0 3px 6px rgba(0,0,0,0.75)`).
- **Body & Controls:** `Nunito` (weights 600 to 800). Warm, rounded, human sans-serif tailored for arcade game UI. Replaces generic overused tech fonts like Inter and Plus Jakarta Sans.
- **Legibility Floor:** All functional UI labels, counts, and interactive captions must be $\ge 11\text{px}$ (standardized on `12px` / `text-xs`).

## Layout

- **Mobile Viewport (Primary):** Strict `100dvh` container with zero page scrollbars. All critical controls accessible in the bottom thumb-reach zone.
- **Safe Area Insets:** Strict padding with `pt-safe` and `pb-safe` to avoid camera cutouts, notches, and home indicator bars.
- **Touch Ergonomics:** All interactive buttons, booster slots, and navigation triggers maintain a minimum touch target size of $48\text{px} \times 48\text{px}$.
- **Desktop Viewport:** Centered responsive frame maintaining mobile proportion while rendering atmospheric starfield vignette backgrounds on wider screens.

## Elevation & Depth

- **Tactile 3D Buttons:** Buttons feature 4px solid darker bottom bevels (`border-bottom: 4px solid #...`) that depress by 3px on active press state (`transform: translateY(3px); border-bottom-width: 1px`).
- **Clay Glassmorphism:** Elevated cards feature `rgba(17, 24, 39, 0.9)` background with 16px backdrop blur, 1px top highlight, and neutral drop shadow (`box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.6)`).
- **No Colored Dark Glows:** Banish zero-offset chromatic glow halos. Elevation uses clean dark directional shadows (`rgba(0, 0, 0, 0.4)` to `rgba(0, 0, 0, 0.7)`).

## Shapes

- **Corner Language:** Rounded pills (`rounded-full`) for currency badges, lives meters, and small action chips; `rounded-2xl` for dialogs and utility tiles; `rounded-3xl` for main modals and cards.
- **Hexagonal Parity:** Odd-R hexagonal geometry ($11 \times 14$ grid) with alternate row shifts creating natural interlocking bubble honeycomb clusters.

## Components

- **Top App Bar:** 56px sticky bar holding the mascot emblem, game title, lives counter (`⚡ 5/5`), coin balance (`🪙 1,250`), procedural audio toggles, and navigation drawer trigger.
- **Hero Screen:** 100dvh contained hero featuring animated floating Bloopi mascot (`animate-mascot-bob`), daily streak banner, tactile gold "PLAY NOW" button, and 4-shelf bottom navigation grid.
- **Saga Roadmap:** Winding vertical candy-trail path through 4 biomes with 3D star nodes, beacon indicators on the active sector, and a sticky "Resume Sector" bar.
- **In-Game HUD:** 3-tier mobile architecture separating top level status, center framed canvas, and bottom launcher dock with remaining ammo counter and 5 tactical boosters.
- **Game Overlays:** Full-screen modal sheets with dark blur backdrops, celebration particles, sequential 3-star reveal, and tactile retry/next actions.

## Do's and Don'ts

### Do
- Always use high-contrast text (`text-slate-950` on gold buttons, `text-white` or `text-slate-300` on dark obsidian).
- Keep background grounds atmospheric, dark, and neutral so bubble pigments have maximum visual pop.
- Ensure all interactive buttons have clear 3D press-down active states.
- Maintain smooth exponential easing (`ease-out-quart`) and spring bob animations instead of tacky CSS bounces.

### Don't
- Never use generic purple-and-blue gradients or neon chromatic glow shadows.
- Never place disconnected uppercase kicker labels directly above hero headlines.
- Never use functional or content text smaller than 11px.
- Never hardcode the game name in components; always bind to `GAME_NAME`.
