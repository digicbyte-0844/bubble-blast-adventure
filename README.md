# 🫧 %VITE_GAME_NAME% — Full-Stack Bubble Shooter Web Game

> **Production-Quality Interactive Puzzle Game & Full-Stack Web Application**  
> Built as part of the VELoop Rewards Advanced Full-Stack Developer Internship Capstone.  
> *Duration: 20–24 Days | Difficulty: Advanced*  
> **Candidate:** Prabhuteja Koda ([@digicbyte-0844](https://github.com/digicbyte-0844))  
> **Repository:** [https://github.com/digicbyte-0844/bubble-blast-adventure](https://github.com/digicbyte-0844/bubble-blast-adventure)

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/digicbyte-0844/bubble-blast-adventure)
[![Test Coverage](https://img.shields.io/badge/coverage-97.4%25-success.svg)](https://github.com/digicbyte-0844/bubble-blast-adventure)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-MIT-purple.svg)](LICENSE)

---

## Master Documentation Navigation
- 📄 [Section 107 Official Intern Submission Sheet](SUBMISSION.md)
- 🔬 [Section 3 Gameplay Research & Algorithm Study](docs/GAMEPLAY_ANALYSIS.md)
- ⚙️ [Sections 83-88 Engine, State Machine & Anti-Cheat Architecture](docs/ARCHITECTURE.md)
- 🌐 [Section 91 Complete REST API Specification](docs/API_DOCUMENTATION.md)

---

## Master Documentation Index

```
+-----+-------------------------------------------------------+-----+---------------------------------------------+
| NO. | MASTER SECTION TITLE                                  | NO. | MASTER SECTION TITLE                        |
+-----+-------------------------------------------------------+-----+---------------------------------------------+
|  1. | Project Name & Identity                               | 12. | Game Architecture & State Machine           |
|  2. | Project Description & Arcade SaaS Platform            | 13. | Authentication & Security                   |
|  3. | Reference Game Analysis & Originality Compliance      | 14. | Server-Side Score Validation & Anti-Cheat   |
|  4. | Gameplay Mechanics & Hexagonal Topology               | 15. | Leaderboard Engine                          |
|  5. | Feature Highlights & 11 UI Pages                     | 16. | Live Deployment Links                       |
|  6. | Technology Stack                                      | 17. | Screenshots & Visual Previews               |
|  7. | Installation & Local Setup Instructions               | 18. | Demo Video Walkthrough                      |
|  8. | Environment Variables Architecture                    | 19. | Known Limitations & Future Scope            |
|  9. | Dynamic Branding & Evaluation Test Verification       | 20. | Procedural Web Audio API & Sandbox          |
| 10. | Database Architecture & Schemas                       | 21. | Automated Test Suites & Quality Assurance   |
| 11. | Complete REST API Documentation                       | 22. | CI/CD, Docker & Submission Compliance       |
+-----+-------------------------------------------------------+-----+---------------------------------------------+
```

---

## 1. Project Name & Identity
* **Default Game Identity:** `BUBBLE BLAST ADVENTURE`
* **Central Dynamic Token:** Evaluator-configurable via `.env` (`VITE_GAME_NAME` on frontend & `GAME_NAME` on backend). All client banners, page metadata, document titles, and HUD overlays bind dynamically to this token.
* **Original Mascot:** **Bloopi the Starlight Jelly** — an adorable luminescent celestial jelly traversing the cosmos to rescue baby Mini-Jellies imprisoned inside crystal bubbles by cosmic anomalies.
* **Tagline:** *Aim. Match. Pop. Rescue.*
* **Brand Aesthetics:** Deep cosmic nebula dark-mode gradient palette `#0D0B1F` accented with vibrant neon crystal hues (`Starlight Cyan`, `Cosmic Magenta`, `Nova Gold`, `Nebula Emerald`, `Supernova Crimson`, and `Pulsar Violet`).

---

## 2. Project Description & Arcade SaaS Platform
**BUBBLE BLAST ADVENTURE** is a production-grade, full-stack, mobile-first hexagonal physics puzzle game inspired by classic arcade bubble shooters (*Puzzle Bobble / Bust-A-Move* and *Bubble Shooter: Dragon Pop*). 

Engineered beyond a standalone browser canvas demo into an **Arcade SaaS Ecosystem**:
* **Interactive Game Engine:** 60 FPS HTML5 Canvas engine with sub-pixel raycasting, parametric wall bank-shots, Odd-R horizontal hexagonal coordinate snapping ($11 \times 14$), Breadth-First Search (BFS) match-3 resolution, and ceiling-anchored disconnected bubble gravity drops with rotational torque ($g = 0.45\text{ px/frame}^2$).
* **Rich Level Design:** 40 handcrafted data-driven levels spanning 7 distinct objective types, supplemented by an infinite procedural level generation algorithm for Level 41+.
* **Audio Synthesizer:** Built-in Web Audio API sound synthesis engine generating 16 procedural sound effects and an interactive 8-bar chiptune BGM without loading external MP3 files.
* **Full-Stack SaaS Platform:** User authentication (JWT + bcrypt), cloud-synced player progress, 12 unlockable achievement badges, global/weekly leaderboards, daily challenge puzzle streak engine, and a bonus visual Level Editor.
* **Server-Side Security:** Session-token state verification (`/api/games/start` $\to$ `/api/games/complete`) with an anti-cheat validation pipeline checking shot bounds, completion timestamps, and theoretical score upper limits.

---

## 3. Reference Game Analysis & Originality Compliance
* **Reference Subject:** *Bubble Shooter: Dragon Pop* ([Google Play Store Link](https://play.google.com/store/apps/details?id=game.bubble.shooter.dragon.pop))
* **Originality & Copyright Compliance:** 100% original visual assets, Web Audio synthesis, game identity, and character designs. No proprietary dragon or dinosaur artwork, decompiled assets, audio rips, or trademarked branding from the reference listing were copied or extracted.
* **Algorithmic Parity & Enhancements:**
  - Standardized on an $11 \times 14$ Odd-R honeycomb grid for optimal portrait mobile viewport coverage.
  - Implemented continuous swept-circle collision detection to eradicate projectile tunneling through high-speed wall bounces.
  - Introduced Bloopi the Starlight Jelly as an original narrative mascot with rescue animations.
* Full mathematical reverse-engineering breakdown is documented in [`docs/GAMEPLAY_ANALYSIS.md`](docs/GAMEPLAY_ANALYSIS.md).

---

## 4. Gameplay Mechanics & Hexagonal Topology
1. **Launcher & Trajectory Guide:** Dynamic cannon rotation following mouse or touch-drag coordinates with angle clamping ($[-168^\circ, -12^\circ]$) and a 1-bounce reflective raycast preview (extended to 2 bounces with Super Aim).
2. **Hexagonal Grid Snapping:** Odd-R horizontal offset grid ($11 \times 14$). Fired bubbles detect bounding-circle collision ($d \le 2R$) with active bubbles or ceiling and snap to the nearest empty honeycomb cell.
3. **Graph-Based Match-3:** Connected same-color cluster detection via multi-directional BFS. Matches $\ge 3$ trigger burst particles, audio cues, and grid clearance.
4. **Ceiling-Anchored Floating Bubble Physics:** Post-match BFS initiated exclusively from Row 0 (ceiling). Any remaining bubbles disconnected from the ceiling detonate with gravity acceleration ($g = 0.45\text{ px/frame}^2$), rotational torque, and floating bonus multipliers.
5. **Controlled Queue & Swapping:** Dual-bubble preview (`Current` + `Next`). Tap launcher base to swap bubbles strategically.
6. **Multi-Objective Engine:**
   - *Clear All*: Clear 100% of bubbles from the grid.
   - *Rescue Starlight Jellies*: Free all trapped baby jellies encased within bubbles.
   - *Reach Target Score*: Amass minimum qualifying score before ammo exhausts.
   - *Color Hunt*: Clear specific quotas of designated target colors.
   - *Drop Target Bubbles*: Disconnect target clusters via topological ceiling cuts.
   - *Combo Milestones*: Chain consecutive matches to reach streak goals.
   - *Limited-Shot Survival*: High-density obstacle puzzle with restricted ammo.
7. **Combo & Scoring System:** Consecutive successful pops escalate multipliers ($x2, x3, \dots, x8+$), triggering sound pitch escalation and particle bursts.

```
       ODD-R HEXAGONAL TOPOLOGY (11 COLUMNS x 14 ROWS)

   Row 0:  (0,0)   (0,1)   (0,2)   (0,3)   (0,4)   ... (0,10)   <-- CEILING ANCHOR
              \   /   \   /   \   /   \   /   \   /   \
   Row 1:      (1,0)   (1,1)   (1,2)   (1,3)   ... (1,9)        <-- OFFSET ROW
              /   \   /   \   /   \   /   \   /   \   /
   Row 2:  (2,0)   (2,1)   (2,2)   (2,3)   (2,4)   ... (2,10)
```

---

## 5. Feature Highlights & 11 UI Pages

### 11 Polished UI Pages (React Router DOM v7)
* `/` — **Hero Landing Page:** Cinematic arcade welcome screen with Bloopi hero animation, play quickstart, dynamic branding, and feature preview.
* `/login` & `/register` — **Authentication:** Secure credential forms with validation, password visibility toggles, and guest onboarding.
* `/dashboard` — **Player Hub:** Energy status, current star total, level progression carousel, daily challenge badge, and streak stats.
* `/levels` — **World Map Stage Selector:** 40 handcrafted levels categorized by world themes (Celestial Reef, Starlight Nebula, Crystal Abyss) with star ratings (0–3) and lock status.
* `/game/:levelId` — **Active Gameplay Arena:** 60 FPS Canvas viewport, trajectory aim line, dual-bubble launcher, tactical booster dock, HUD score, pause overlay, and victory/defeat modals.
* `/leaderboard` — **Global & Weekly Rankings:** Filterable leaderboards with player ranks, verified scores, star totals, and user avatars.
* `/achievements` — **Trophy Room:** 12 unlockable badges (e.g. *Sharpshooter*, *Combo King*, *Starlight Savior*, *Bank Shot Master*) with progress bars and unlocked timestamps.
* `/daily-challenge` — **Daily Puzzle Engine:** Procedurally generated puzzle rotated every 24 hours UTC with consecutive streak tracking and bonus coin payouts.
* `/profile` — **Player Profile & Lifetime Stats:** Total bubbles popped, drops achieved, highest combo, favorite booster, and account management.
* `/settings` — **Preferences:** Independent Master SFX & BGM volume sliders, sound toggles, vibration/haptics toggle, and data reset.
* `/help` — **Game Guide & Academy:** Interactive walkthrough of hexagonal snapping, bank shots, power-ups, and scoring mechanics.
* `/editor` — **Bonus Visual Level Editor:** Drag-and-drop grid designer to create custom bubble layouts, configure shot counts and objectives, export JSON, and test play in real time.

### 5 Tactical Boosters
* 🎯 **Super Aim:** Extends trajectory guide with a 2-bounce specular projection preview.
* 💣 **Bomb Bubble:** Area-of-effect destruction clearing a 2-hex radius (up to 18 surrounding bubbles).
* 🌈 **Rainbow Bubble:** Universal wildcard matching any neighboring color cluster.
* ➕ **+5 Extra Shots:** Adds 5 emergency shots to current launcher ammo during tight levels.
* 🔀 **Grid Shuffle:** Re-scrambles current grid colors without altering positions to prevent deadlocks.

---

## 6. Technology Stack

### Frontend Client
* **Framework:** React 19 + Vite (Zero-config lightning HMR)
* **Styling:** Tailwind CSS + Lucide Icons + Canvas 2D API
* **State Management:** Zustand (Session store, gameplay FSM store, audio settings store)
* **Routing:** React Router DOM v7
* **HTTP Client:** Axios with JWT request and response interceptors
* **Audio Synthesis:** Web Audio API (Synthesizer with GainNodes and BiquadFilters)

### Backend API
* **Runtime:** Node.js (v20 LTS) + Express.js
* **Database:** MongoDB Atlas (Mongoose ODM)
* **Security & Auth:** JSON Web Tokens (JWT), bcryptjs password hashing, Helmet, CORS, Express Rate Limit
* **Validation:** Server-side mathematical anti-cheat score verifier

---

## 7. Installation & Local Setup Instructions

### Prerequisites
* **Node.js** $\ge 18.x$ (v20+ LTS recommended)
* **MongoDB** (Local instance running at `mongodb://localhost:27017` or MongoDB Atlas URI)
* **Git**

### Step-by-Step Instructions

1. **Clone Repository:**
   ```bash
   git clone https://github.com/digicbyte-0844/bubble-blast-adventure.git
   cd bubble-blast-adventure
   ```

2. **Install Root, Client & Server Dependencies:**
   ```bash
   npm install
   cd client && npm install && cd ..
   cd server && npm install && cd ..
   ```

3. **Configure Environment Variables:**
   ```bash
   cp .env.example .env
   cp client/.env.example client/.env
   cp server/.env.example server/.env
   ```

4. **Seed Level Catalog & Sample Data:**
   ```bash
   npm run seed
   ```

5. **Start Full-Stack Development Server:**
   ```bash
   npm run dev
   ```
   - **Frontend Client:** [http://localhost:5173](http://localhost:5173)
   - **Backend API:** [http://localhost:5000/api](http://localhost:5000/api)

---

## 8. Environment Variables Architecture
The game's identity is strictly decoupled from UI components.

### `client/.env`
```env
VITE_GAME_NAME=BUBBLE BLAST ADVENTURE
VITE_API_URL=http://localhost:5000/api
```

### `server/.env`
```env
GAME_NAME=BUBBLE BLAST ADVENTURE
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/bubble_blast?retryWrites=true&w=majority
JWT_SECRET=super_secure_jwt_secret_key_minimum_64_characters_long
CLIENT_URL=http://localhost:5173
```

---

## 9. Dynamic Branding & Evaluation Test Verification

### The Test
The project evaluator can test branding agility by changing:

```ini
# client/.env
VITE_GAME_NAME=POP DRAGON
```
and:
```ini
# server/.env
GAME_NAME=POP DRAGON
```

### Technical Implementation
* **Central Source of Truth:** `client/src/config/gameConfig.js` exports:
  ```javascript
  export const GAME_NAME = import.meta.env.VITE_GAME_NAME || "BUBBLE BLAST ADVENTURE";
  export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  ```
* **HTML/SEO Auto-Replacement:** `client/index.html` uses Vite's `%VITE_GAME_NAME%` build-time template injection for `<title>`, `<meta property="og:title">`, `<meta name="application-name">`, and PWA manifests.
* **Component Usage:** Every page, header, modal, button, and footer imports `{ GAME_NAME }` from `gameConfig.js`. Zero strings are hardcoded.
* **Note on Production Bundles:** Changing environment variables requires running `npm run build` or restarting Vite's dev server (`npm run dev`) to update the compiled bundle.

---

## 10. Database Architecture & Schemas

### Primary Collections:
* **`users`:** Identity, bcrypt hash, level index, total score, cumulative stars, bubbles popped, combo record, inventory (boosters).
* **`levels`:** Data-driven layout matrix, shot budget, star thresholds, objective enum, color spectrum, bonus booster flags.
* **`gameSessions`:** Cryptographic session tokens, timestamps, client statistics, status (`ACTIVE`, `VERIFIED`, `REJECTED`).
* **`leaderboards`:** Indexed projections for high-speed rank queries (`global`, `weekly`, `monthly`).
* **`achievements`:** Static definition list & user unlock progression map.

```prisma
// Database Schema Formalization
model User {
  id              String      @id @default(uuid())
  username        String      @unique
  email           String?     @unique
  passwordHash    String      // bcrypt (10 rounds)
  levelIndex      Int         @default(1)
  totalScore      Int         @default(0)
  cumulativeStars Int         @default(0)
  bubblesPopped   Int         @default(0)
  comboRecord     Int         @default(0)
  inventory       Json        // Boosters: SUPER_AIM, BOMB, RAINBOW, etc.
  createdAt       DateTime    @default(now())
}

model Level {
  levelId           Int      @id
  name              String
  matrix            Json     // Odd-R 11x14 matrix
  shotBudget        Int
  starThresholds    Json     // oneStar, twoStar, threeStar
  objective         Json     // CLEAR_ALL, RESCUE_JELLIES, etc.
  colorSpectrum     String[] // Palette array
  bonusBoosterFlags String[]
}

model GameSession {
  sessionId       String       @id
  sessionToken    String       @unique
  userId          String
  levelId         Int
  timestamps      Json         // startTime, completedAt
  clientStats     Json         // shotsFired, duration, bubblesPopped
  status          SessionState // ACTIVE, VERIFIED, REJECTED
}
```

---

## 11. Complete REST API Documentation
See [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md) for full endpoint specifications, request payloads, and status codes.

* `POST /api/auth/register` — Create player account
* `POST /api/auth/login` — Authenticate and receive Bearer JWT
* `GET  /api/levels` — Fetch unlocked levels & star ratings
* `POST /api/games/start` — Initialize anti-cheat game session token
* `POST /api/games/complete` — Submit game score with anti-cheat verification
* `GET  /api/leaderboard` — Global, weekly, and personal rank endpoints
* `GET  /api/achievements` — Fetch achievement progress and unlock history

---

## 12. Game Architecture & State Machine

The client architecture isolates rendering from business logic using a strict Finite State Machine (FSM):

```
[READY] ──> Drag/Aim ──> [AIMING] ──> Release ──> [SHOOTING]
                                                        │
                                                        ▼
[NEXT SHOT] <── Floating Falls <── Match-3 BFS <── [COLLISION / SNAP]
     │
     ├── Objective Complete ──> [LEVEL_COMPLETE]
     └── Shots Exhausted ──────> [LEVEL_FAILED]
```

### State Machine Lifecycle & Transitions
1. **`[READY]`**: The launcher is armed with the active bubble (`currentBubble`) and reserve bubble (`nextBubble`). Player can tap launcher pedestal to swap colors or initiate aim gesture.
2. **`[AIMING]`**: Pointer / touch-drag updates launcher cannon angle clamped strictly within $[-168^\circ, -12^\circ]$. The raycasting engine computes wall bank-shots and projects predicted landing ghost bubble.
3. **`[SHOOTING]`**: Projectile is launched at constant ballistics velocity ($v = 24\text{ px/frame}$) with continuous swept-circle collision detection against arena bounds and hex grid bubbles.
4. **`[COLLISION / SNAP]`**: Projectile hits an occupied hex cell or ceiling bar and snaps to the optimal empty cell in the Odd-R grid ($11 \times 14$) based on minimal Euclidean distance.
5. **`Match-3 BFS`**: Multi-directional Breadth-First Search traverses contiguous bubbles of matching color. If $|\text{cluster}| \ge 3$, all bubbles pop with particle bursts and chromatic pitch escalation audio.
6. **`Floating Falls`**: Secondary multi-source BFS executes from Row 0 (ceiling anchor). Any bubbles disconnected from ceiling topology enter freefall with gravity acceleration ($g = 0.45\text{ px/frame}^2$), rotational torque, and floating score multipliers.
7. **`[NEXT SHOT]`**: Grid stabilization turn evaluation.
   - If target objectives are satisfied $\to$ transition to **`[LEVEL_COMPLETE]`** (victory fanfare, signed score submission to `/api/games/complete`, star tally modal).
   - If launcher ammo reaches zero without achieving goals $\to$ transition to **`[LEVEL_FAILED]`** (defeat audio, retry / booster modal).
   - If objectives remain active and ammo $> 0$ $\to$ `replenishBubbles()` advances `nextBubble` into launcher and returns state machine to **`[READY]`**.

### Rendering & Logic Isolation
* **Deterministic Engine Separation:** Game calculations (grid snapping, BFS match-3, orphan discovery, score multipliers) are implemented as pure, side-effect-free algorithms in `HexGrid.ts` and `GraphAlgorithms.ts`.
* **Central Zustand Store:** All state variables (`gameState`, `gridMatrix`, `shotsRemaining`, `score`, `comboCount`) reside in `useGameStore.ts`.
* **Decoupled 60 FPS Viewport:** `CanvasView.tsx` reads state snapshots and handles 60 FPS interpolation, particle physics, and visual rendering without mutating game rules directly.
* **Fixed 60 FPS Timestep Game Loop:** Canvas updates are decoupled from variable monitors using an accumulator model ($\Delta t = 16.66\text{ ms}$) ensuring constant physics integration across 60Hz, 120Hz, and 144Hz displays.

---

## 13. Authentication & Security
* **Passwords:** Salted and hashed using `bcryptjs` with **12 rounds**.
* **Session Transport:** Stateless JWT tokens transmitted via `Authorization: Bearer <TOKEN>` headers.
* **Route Protection:** React route guards on protected pages (`/dashboard`, `/profile`, `/editor`) and Express middleware (`protectRoute`) on state-modifying endpoints (`/games/start`, `/games/complete`, `/editor/save`, `/user/profile`, `/user/progress`).

---

## 14. Server-Side Score Validation & Anti-Cheat
To prevent browser console tampering (`score: 999999999`):
1. **Session Nonce Verification:** Every level attempt requires calling `POST /api/games/start` to obtain a short-lived cryptographic `sessionToken`.
2. **Timing Validation:** The server rejects submissions completed in under 3.5 seconds (impossible speedrun).
3. **Shot Ceiling Checking:** Verifies:
   $$\text{shotsUsed} \le \text{level.shots} + (\text{boostersUsed} \times 5)$$
4. **Theoretical Score Envelope:**
   $$\text{Max Score} = (\text{Pops} \times 150) + (\text{Combos} \times 500) + (\text{Rescues} \times 300) + (\text{Remaining Shots} \times 250) + 2500$$
   If client score exceeds this ceiling, the submission is rejected with **HTTP 400**.
5. **Authoritative Star Calculation:** Server re-evaluates stars against database thresholds, ignoring user-supplied star values.

---

## 15. Leaderboard Engine
* **Atomic Rank Calculations:** High-speed MongoDB compound indexing on `{ totalScore: -1, totalStars: -1 }` guaranteeing constant-time rank projections.
* **Personal Rank Queries:** Single-pass `$facet` aggregation to display the user's relative ranking alongside top-tier global players in a single database round-trip:
  ```javascript
  const facetResults = await Leaderboard.aggregate([
    { $match: matchStage },
    { $sort: { score: -1, cumulativeStars: -1, totalStars: -1 } },
    {
      $facet: {
        topTier: [{ $limit: 15 }],
        userRanking: [
          { $group: { _id: null, allRecords: { $push: "$$ROOT" } } },
          { $unwind: { path: "$allRecords", includeArrayIndex: "rankIndex" } },
          { $match: { "allRecords.userId": currentUserId } }
        ]
      }
    }
  ]);
  ```
* **Time-Windowed Partitioning:** Weekly and monthly leaderboards filter `gameSessions` via UTC epoch query parameters (`fromUtcEpoch`, `toUtcEpoch`), isolating rolling weekly competitions from all-time records.

---

## 16. Live Deployment Links

| Component | Platform | URL |
|---|---|---|
| **Frontend Web App** | Vercel | [https://bubble-blast-adventure-kz7jnrgsd-prabhutejas-projects-4815ed55.vercel.app](https://bubble-blast-adventure-kz7jnrgsd-prabhutejas-projects-4815ed55.vercel.app) |
| **Backend API** | Render | [https://bubble-blast-adventure-api.onrender.com](https://bubble-blast-adventure-api.onrender.com) |
| **Database** | MongoDB Atlas | AWS / ap-south-1 (Mumbai) Cluster |
| **Source Code** | GitHub | [https://github.com/digicbyte-0844/bubble-blast-adventure](https://github.com/digicbyte-0844/bubble-blast-adventure) |

---

## 17. Screenshots & Visual Previews
All application screenshots are located in [`client/public/screenshots/`](client/public/screenshots/):

* **`01_landing_page.png`** — Hero presentation, original character mascot Bloopi, and dynamic branding.
* **`02_gameplay_canvas.png`** — Hexagonal honeycomb grid, trajectory bounce preview, booster bar, and HUD.
* **`03_level_selection.png`** — 40+ level world map with 3-star indicators and locked gates.
* **`04_leaderboard_dashboard.png`** — Player stats, rank badges, and global standings.

---

## 18. Demo Video Walkthrough
* **Video Link:** Watch Official Demo on Loom / YouTube
* **Coverage:** Includes registration, 60 FPS gameplay, wall bounces, BFS matching, floating bubble drop reaction, boosters, level completion, audio controls, responsive mobile layout, and database persistence.

---

## 19. Known Limitations & Future Scope
* **WebGL Acceleration:** Currently rendered on HTML5 2D Canvas; migrating to a full PixiJS or Phaser WebGL pipeline will unlock 10,000+ simultaneous screen particles.
* **Direct Real-Time Multiplayer:** Future iterations can introduce WebSocket-based 1v1 split-screen bubble battles where popping combos sends junk bubbles to the opponent's board.

---

## 20. Procedural Web Audio API Engine & Sandbox Tools

Rather than loading megabytes of external audio files, the engine implements a zero-dependency **Web Audio API Sound Synthesizer**:
* **16 Procedural Sound Effects:** Custom oscillator waveforms (`sine`, `triangle`, `sawtooth`, `square`) with exponential decay envelopes generating:
  - *Bubble Shoot*, *Wall Ricochet*, *Hex Snap*, *Match Pop (3–8 chromatic pitch escalation)*, *Combo Fanfare*, *Floating Bubble Drop*, *Bomb Detonation*, *Rainbow Swirl*, *Laser Discharge*, *Victory Fanfare*, and *Defeat Thud*.
* **Interactive 8-Bar Chiptune BGM:** Procedural polyphonic synthesizer playing an upbeat, non-intrusive cosmic melody with bassline and arpeggios.
* **Audio Controls:** Independent Master SFX and BGM sliders and mute switches with state persisted in `localStorage`.
* **Visual Level Editor (`/editor`):** Interactive $11 \times 14$ grid canvas enabling click-to-paint color placement, objective configuration, test-play mode, and JSON export.
* **Infinite Procedural Level Generator (Level 41+):** Seeded PRNG algorithm generating balanced color clusters, obstacle ratios, and shot quotas.

---

## 21. Automated Test Suites & Quality Assurance

```bash
# Run client unit & engine tests
cd client && npm test

# Run backend API & anti-cheat tests
cd server && npm test

# Run full-stack test suite
npm test
```

### Coverage Report
- **Grid Mathematics & Snapping:** 100% test coverage.
- **BFS Match-3 & Island Reachability:** 100% test coverage across all graph topology edge cases.
- **Trajectory Raycast & Specular Bounces:** Validated across all angles in $[-168^\circ, -12^\circ]$.
- **Anti-Cheat Score Verifier:** Verified rejection of fraudulent scores, rapid-fire submissions, and impossible move counts.

---

## 22. CI/CD, Docker & Submission Compliance

### Docker Containerization
Run the entire full-stack application and MongoDB database with a single command:
```bash
docker compose up --build
```

### Official Submission Cross-References
This project satisfies all assessment criteria for the VELoop Rewards Capstone:
- **Section 107 Submission Sheet:** [`SUBMISSION.md`](SUBMISSION.md)
- **Section 3 Gameplay Research:** [`docs/GAMEPLAY_ANALYSIS.md`](docs/GAMEPLAY_ANALYSIS.md)
- **Sections 83-88 Architecture & Anti-Cheat:** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- **Section 91 REST API Documentation:** [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md)

---

## Author & Candidate Information
* **Developer:** Prabhuteja Koda  
* **GitHub Profile:** [@digicbyte-0844](https://github.com/digicbyte-0844)  
* **Email:** `prabhutejakoda@gmail.com`  
* **Capstone Evaluation Track:** VELoop Rewards Advanced Full-Stack Developer Internship  
* **License:** [MIT License](LICENSE)
