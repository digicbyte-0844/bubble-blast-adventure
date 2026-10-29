# 📡 Backend REST API Specification
*Complete API Specification for Section 91.*

**Document Reference:** `docs/API_DOCUMENTATION.md`  
**Classification:** Section 91 — Comprehensive REST API Architecture & Anti-Cheat Contracts  
**Capstone Program:** VELoop Rewards Advanced Full-Stack Developer Internship  
**Author:** Prabhuteja Koda ([@digicbyte-0844](https://github.com/digicbyte-0844))  
**Email:** `prabhutejakoda@gmail.com`  
**Repository:** [https://github.com/digicbyte-0844/bubble-blast-adventure](https://github.com/digicbyte-0844/bubble-blast-adventure)  
**Base URL:** `http://localhost:5000/api` (or production Render URL: `https://bubble-blast-adventure-ci3t.onrender.com/api`)  
**Authentication Scheme:** `Authorization: Bearer <JWT_TOKEN>`

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Creates a new player account with password salted and hashed using bcryptjs (12 rounds).
* **Headers:** `Content-Type: application/json`
* **Body:**
  ```json
  {
    "name": "Prabhuteja Koda",
    "email": "prabhuteja@example.com",
    "password": "SecurePassword123"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "6718d7...",
      "name": "Prabhuteja Koda",
      "email": "prabhuteja@example.com",
      "currentLevel": 1,
      "totalScore": 0,
      "totalStars": 0,
      "boosters": { "bomb": 2, "rainbow": 2, "aim": 3, "extraShots": 2 }
    }
  }
  ```

---

### `POST /api/auth/login`
Authenticates a player using registered credentials and issues a stateless JWT Bearer token.
* **Headers:** `Content-Type: application/json`
* **Body:**
  ```json
  {
    "email": "prabhuteja@example.com",
    "password": "SecurePassword123"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "6718d7...",
      "name": "Prabhuteja Koda",
      "email": "prabhuteja@example.com",
      "currentLevel": 1,
      "totalScore": 0,
      "totalStars": 0,
      "boosters": { "bomb": 2, "rainbow": 2, "aim": 3, "extraShots": 2 }
    }
  }
  ```

---

## 2. Game Session & Anti-Cheat Endpoints

### `POST /api/games/start` (Protected)
Initializes an authenticated game session and returns an anti-cheat session token.
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Body:**
  ```json
  {
    "levelId": 18
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "sessionId": "sess_8f9a2b71c4e0",
    "levelId": 18,
    "serverTimestamp": 1761245800000
  }
  ```

---

### `POST /api/games/complete` (Protected)
Submits level completion data through the anti-cheat verification pipeline.
* **Headers:**  
  `Authorization: Bearer <JWT_TOKEN>`  
  `X-Session-Token: sess_8f9a2b71c4e0` (optional if provided in body)
* **Body:**
  ```json
  {
    "sessionId": "sess_8f9a2b71c4e0",
    "levelId": 18,
    "shotsUsed": 14,
    "bubblesPopped": 38,
    "bestCombo": 5,
    "rescuedCount": 3,
    "score": 8450,
    "completed": true
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "verified": true,
    "verifiedScore": 8450,
    "verifiedStars": 3,
    "unlockedLevel": 19,
    "newAchievements": ["COMBO_MASTER"]
  }
  ```
* **Anti-Cheat Rejection (400 Bad Request):**
  ```json
  {
    "success": false,
    "error": "ANTI_CHEAT_VIOLATION",
    "details": "Submitted score (9999999) exceeds theoretical upper limit."
  }
  ```

---

## 3. Leaderboard & Progress Endpoints

### `GET /api/leaderboard?type=global&limit=50`
Returns ranked leaderboard records with personal user standing.

* **Response (200 OK):**
  ```json
  {
    "success": true,
    "leaderboard": [
      { "rank": 1, "name": "Ayan", "totalScore": 982450, "totalStars": 120, "levelsCompleted": 40 },
      { "rank": 2, "name": "Prabhuteja", "totalScore": 914820, "totalStars": 118, "levelsCompleted": 40 }
    ],
    "currentUser": { "rank": 2, "totalScore": 914820 }
  }
  ```

---

### `GET /api/achievements/me` (Protected)
Returns status for all 12 achievement badges with progress percentages.
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "total": 12,
    "unlockedCount": 4,
    "achievements": [
      {
        "id": "FIRST_POP",
        "title": "First Pop",
        "description": "Pop your first 3-bubble cluster",
        "isUnlocked": true,
        "progress": 1,
        "maxProgress": 1,
        "progressPercentage": 100,
        "rewardCoins": 100
      },
      {
        "id": "BANK_SHOT_MASTER",
        "title": "Bank Shot Master",
        "description": "Execute 25 wall ricochet pops",
        "isUnlocked": false,
        "progress": 14,
        "maxProgress": 25,
        "progressPercentage": 56,
        "rewardCoins": 250
      }
    ]
  }
  ```

---

### `GET /api/levels`
Retrieves all 40 handcrafted level configurations decorated with player lock status and stars.
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "totalLevels": 40,
      "levels": [
        {
          "id": 1,
          "name": "Sector 1: Celestial Reef",
          "world": "Celestial Reef",
          "objective": { "type": "CLEAR_ALL", "target": 0 },
          "maxShots": 30,
          "palette": ["CYAN", "MAGENTA", "GOLD"],
          "isUnlocked": true,
          "stars": 3,
          "highScore": 14200
        }
      ]
    }
  }
  ```

---

### `GET /api/achievements` (Protected)
Retrieves the 12 unlockable achievement badges and player unlock progression.
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "total": 12,
      "unlockedCount": 4,
      "achievements": [
        { "id": "FIRST_POP", "title": "First Pop", "description": "Pop your first 3-bubble cluster", "isUnlocked": true },
        { "id": "JELLY_SAVIOR", "title": "Starlight Savior", "description": "Rescue 50 trapped Mini-Jellies", "isUnlocked": true },
        { "id": "BANK_SHOT_MASTER", "title": "Bank Shot Master", "description": "Execute 25 wall ricochet pops", "isUnlocked": false, "progress": 14, "maxProgress": 25 },
        { "id": "COMBO_MASTER", "title": "Combo Master", "description": "Achieve an 8x combo streak", "isUnlocked": true }
      ]
    }
  }
  ```

---

### `GET /api/daily-challenge`
Deterministic 24-hour rotating puzzle rotated at 00:00 UTC.
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "date": "2026-10-26",
      "challengeId": "daily_2026-10-26",
      "name": "Daily Nebula Puzzle #2062",
      "objective": { "type": "CLEAR_ALL", "target": 0 },
      "maxShots": 22,
      "rewardCoins": 250,
      "palette": ["CYAN", "MAGENTA", "GOLD", "EMERALD"]
    }
  }
  ```

---

## 4. Visual Level Editor Endpoints

### `POST /api/editor/save` (Protected)
Exports and saves custom-designed levels to the community catalog.
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Body:**
  ```json
  {
    "name": "Supernova Labyrinth",
    "objective": { "type": "RESCUE_JELLIES", "target": 6 },
    "maxShots": 22,
    "palette": ["CYAN", "MAGENTA", "GOLD", "EMERALD"],
    "matrix": [
      ["CYAN", "CYAN", "MAGENTA", "JELLY", "GOLD", "GOLD", "MAGENTA", "CYAN", "CYAN", "GOLD", "GOLD"],
      ["MAGENTA", "MAGENTA", "BOMB", "CYAN", "GOLD", "EMERALD", "EMERALD", "CYAN", "MAGENTA", "GOLD"]
    ]
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "customId": "cust_98ac02",
      "name": "Supernova Labyrinth",
      "creatorUsername": "Prabhuteja",
      "createdAt": "2026-10-26T16:00:00.000Z"
    }
  }
  ```

---

## 5. Primary Database Schemas & Collections

### 1. `users` Collection Schema
```javascript
{
  username: { type: String, required: true, unique: true, index: true },
  email: { type: String, sparse: true, unique: true },
  password: { type: String, required: true }, // bcryptjs 12 rounds
  levelIndex: { type: Number, default: 1, index: true },
  totalScore: { type: Number, default: 0, index: true },
  cumulativeStars: { type: Number, default: 0 },
  bubblesPopped: { type: Number, default: 0 },
  comboRecord: { type: Number, default: 0 },
  inventory: {
    SUPER_AIM: { type: Number, default: 3 },
    BOMB: { type: Number, default: 3 },
    RAINBOW: { type: Number, default: 2 },
    EXTRA_SHOTS: { type: Number, default: 4 },
    SHUFFLE: { type: Number, default: 3 }
  },
  coins: { type: Number, default: 500 },
  energy: { type: Number, default: 5, max: 5 },
  createdAt: { type: Date, default: Date.now }
}
// Compound index for atomic ranking:
// { totalScore: -1, totalStars: -1 }
```

### 2. `gameSessions` Collection Schema
```javascript
{
  sessionId: { type: String, required: true, unique: true, index: true },
  sessionToken: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  levelId: { type: Number, required: true },
  allowedShots: { type: Number, required: true },
  seed: { type: Number, required: true },
  status: { type: String, enum: ['ACTIVE', 'VERIFIED', 'REJECTED'], default: 'ACTIVE' },
  timestamps: {
    startTime: { type: Date, default: Date.now },
    completedAt: { type: Date }
  },
  clientStatistics: {
    shotsFired: { type: Number, default: 0 },
    remainingShots: { type: Number, default: 0 },
    elapsedDurationMs: { type: Number, default: 0 },
    bubblesPopped: { type: Number, default: 0 },
    maxCombo: { type: Number, default: 0 }
  }
}
```

### 3. `leaderboards` Collection Schema
```javascript
{
  userId: { type: String, required: true, index: true },
  username: { type: String, required: true },
  levelId: { type: Number, index: true },
  score: { type: Number, required: true },
  stars: { type: Number, default: 0 },
  cumulativeStars: { type: Number, default: 0 },
  timeframe: { type: String, enum: ['global', 'weekly', 'monthly'], default: 'global', index: true },
  verified: { type: Boolean, default: true, index: true },
  recordedAt: { type: Date, default: Date.now, index: true }
}
// Compound indexes:
// { totalScore: -1, totalStars: -1 }, { timeframe: 1, score: -1 }
```
