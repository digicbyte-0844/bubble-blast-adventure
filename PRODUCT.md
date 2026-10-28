# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Casual and arcade puzzle gamers playing on mobile phones, tablets, or desktop browsers who seek immediate, juicy tactile feedback, deep physics satisfaction, strategic shot planning, and quick 2-to-3 minute play sessions.

## Product Purpose

`BUBBLE BLAST ADVENTURE` is a production-grade, full-stack, mobile-first bubble puzzle arcade SaaS web application. It delivers 60 FPS deterministic hexagonal ballistics, Breadth-First Search (BFS) cluster matching, ceiling gravity drop chain reactions, and live social progression across 40+ levels without generic AI design patterns or broken audio assets.

## Positioning

Unlike typical browser canvas demos, `BUBBLE BLAST ADVENTURE` couples a high-polish King/Supercell-caliber tactile game engine with an enterprise-grade backend: a session-based anti-cheat scoring pipeline, live Cloud MongoDB Atlas persistence, procedural Web Audio API synthesizers, and an integrated in-browser level architect.

## Operating Context

- **Mobile Web Priority:** 360px–430px smartphone viewports with `100dvh` full-bleed layouts, safe-area top/bottom insets, and scroll-locking (`touch-action: none`) during precision aim.
- **Desktop Adaptation:** Centered responsive arcade cabinet frame scaling cleanly up to 4K displays.
- **Offline Resilience:** Service worker caching with local storage queues ensuring seamless gameplay even during intermittent connectivity.

## Capabilities and Constraints

- **Engine Geometry:** Odd-R hexagonal honeycomb matrix ($11 \times 14$ parity) with continuous swept-circle raycast trajectory bank-shots.
- **Core Mechanics:** BFS cluster popping ($\ge 3$), ceiling-anchored BFS gravity avalanches ($g = 0.45\text{ px/frame}^2$), and 5 tactical boosters (Super Aim, Bomb, Rainbow, +5 Shots, Shuffle).
- **Procedural Sound:** 16 parameter-driven procedural Web Audio synthesizers with real-time pitch ramping. Zero external MP3 files.
- **Backend Architecture:** Node.js/Express with Cloud MongoDB Atlas (`bubbleshooter.ms5kfjo.mongodb.net`), JWT authentication, and server-side anti-cheat validation verifying shot conservation, duration bounds, and theoretical point caps.

## Brand Commitments

- **Dynamic Identity:** Bound dynamically to `%VITE_GAME_NAME%` and `GAME_NAME` from configuration tokens.
- **Original Mascot:** Bloopi the Starlight Jelly — a luminescent bioluminescent character with emotional state transitions (celebrate, hint, worried, idle).
- **Aesthetic Direction:** Deep Midnight Obsidian (`#0B0F19`) background paired with 8 high-contrast bubble pigments, warm amber gold primary CTAs, and rounded tactile 3D arcade buttons.

## Evidence on Hand

- 40 handcrafted data-driven levels verified in `client/src/data/levels.ts` and seeded into MongoDB Atlas.
- 10/10 automated engine mathematical unit tests passing in `scripts/test_engine.mjs`.
- 9/9 backend REST API and anti-cheat validation tests passing in `scripts/test_backend.mjs`.
- Automated Impeccable UI anti-slop audits verified with 0 warnings on mobile and desktop routes.

## Product Principles

1. **Juicy Tactical Arcade Feel:** Every action (drag, aim, launch, pop, drop) must trigger instantaneous visual and procedural acoustic feedback.
2. **Absolute Legibility & Contrast:** Keep backgrounds dark and atmospheric so the 8 gameplay pigments stay distinct and accessible for all players.
3. **Zero AI Slop:** Banish generic purple/blue gradients, overused tech sans fonts, tiny illegible captions (<11px), and decorative kicker tags.
4. **Deterministic Fairness:** Ballistics and grid snapping are strictly deterministic and reproducible across all screen sizes and refresh rates.

## Accessibility & Inclusion

- Functional UI text strictly satisfies the $\ge 11\text{px}$ legibility floor, with body copy targeting $\ge 12\text{px}$ to $14\text{px}$.
- High-contrast color ratios strictly exceed WCAG AA standards (4.5:1 for body copy and 3:1 for large display elements).
- Reduced-motion mode accessible in settings to eliminate canvas screen-shake and particle bursts for motion-sensitive users.
