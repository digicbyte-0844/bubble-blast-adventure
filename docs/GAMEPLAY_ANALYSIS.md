# 🔬 Internal Gameplay Research & Algorithm Analysis

**Author:** Prabhuteja Koda (Intern ID: `VLRINT20262804`)  
**GitHub Profile:** [@digicbyte-0844](https://github.com/digicbyte-0844)  
**Email:** `prabhutejakoda@gmail.com`  
**Domain:** Full Stack Game Development  
**Subject:** Comparative study of *Bubble Shooter: Dragon Pop* and custom web engine implementation.  
**Repository:** [https://github.com/digicbyte-0844/bubble-blast-adventure](https://github.com/digicbyte-0844/bubble-blast-adventure)

---

## 1. Executive Research Summary
Before writing game code, the mechanics of the reference title were analyzed across 15 play sessions. Bubble shooters require precise mathematical systems:
1. Discrete coordinate geometry (hexagonal tiling).
2. Continuous Cartesian physics (raycasting & collision).
3. Graph theory algorithms (connected-component cluster analysis and topological ceiling anchoring).

Below is the translation of these observations into production software architecture.

```
+---------------------------------------------------------------------------------------+
|                            PARADIGM REVERSE-ENGINEERING                               |
+-----------------------------------+---------------------------------------------------+
| DRAGON POP (Commercial Reference) | BUBBLE BLAST ADVENTURE (Our Full-Stack Engine)    |
+-----------------------------------+---------------------------------------------------+
| Heavy compiled Unity/Cocos bundle | Lightweight React 19 + Canvas 2D (< 300 KB gzip)  |
| Proprietary dinosaur/dragon art   | 100% Original Bloopi the Starlight Jelly & Assets |
| Megabytes of external MP3 samples | Zero-Asset Web Audio API Procedural Synthesizer   |
| Client-trusted score submission   | Server-Side Anti-Cheat Mathematical Verification  |
| Static pre-packaged level packs   | 40 Data-Driven Levels + Infinite Procedural 41+   |
| Monolithic native mobile app      | Multi-Device Web PWA + Full-Stack SaaS Platform   |
+-----------------------------------+---------------------------------------------------+
```

---

## 2. Core Mechanics Breakdown

### 2.1 Aiming & Trajectory System
* **Observation:** The launcher pivots smoothly around its anchor point $(X_c, Y_c)$. A dotted guide reveals the projected flight path. When aimed toward side borders, it reflects sharply like a billiard ball. Aim angles pointing horizontally or downward are locked.
* **Mathematical Implementation:**
  $$\theta = \operatorname{atan2}(Y_{\text{pointer}} - Y_c, X_{\text{pointer}} - X_c)$$
  Clamp $\theta$ strictly between $[-168^\circ, -12^\circ]$ to prevent flat or downward shots.
  * **Raycast Reflection:** The projectile follows parametric ray vector $\vec{P}(t) = \vec{P}_0 + \vec{V}t$. When $P_x(t) \le \text{Radius}$ or $P_x(t) \ge \text{Width} - \text{Radius}$, reverse horizontal velocity ($V_x = -V_x$).

```
                     LAUNCHER ARC & ANGLE CLAMPING
                                  -90° (Up)
                                     ^
                                   / | \
                    -135°        /   |   \        -45°
                               /     |     \
                             /       |       \
          -168° (Clamp Min) +        |        + -12° (Clamp Max)
                                     O Launcher Base (X_c, Y_c)
                             [FORBIDDEN DOWNWARD ARC]
```

---

### 2.2 Hexagonal Coordinate System (Odd-R Offset Grid)
* **Observation:** Bubbles do not stack in square grids; they nestle into the hollows of adjacent rows. Odd-numbered rows are shifted horizontally by one bubble radius.
* **Grid Math:**
  * Even Rows ($r = 0, 2, 4, \dots$): Contain $C$ columns ($11$ bubbles).
  * Odd Rows ($r = 1, 3, 5, \dots$): Contain $C - 1$ columns ($10$ bubbles), offset by horizontal displacement $\Delta x = R$.
  * Row Height: The vertical step between consecutive row centers is:
    $$\Delta y = R \times \sqrt{3} \approx R \times 1.73205$$
  * Center Coordinate Mapping:
    $$X(r, c) = \text{Padding} + c \cdot (2R) + (r \bmod 2 \neq 0 \,?\, R : 0)$$
    $$Y(r, c) = R + r \cdot (R\sqrt{3})$$

```
       ODD-R HEXAGONAL TOPOLOGY (11 COLUMNS x 14 ROWS)

   Row 0:  (0,0)   (0,1)   (0,2)   (0,3)   (0,4)   ... (0,10)   <-- CEILING ANCHOR
              \   /   \   /   \   /   \   /   \   /   \
   Row 1:      (1,0)   (1,1)   (1,2)   (1,3)   ... (1,9)        <-- OFFSET ROW
              /   \   /   \   /   \   /   \   /   \   /
   Row 2:  (2,0)   (2,1)   (2,2)   (2,3)   (2,4)   ... (2,10)
```

---

### 2.3 Bubble Collision & Snapping
* **Observation:** When a fired projectile touches an existing grid bubble, it halts instantly and locks into the nearest vacant slot.
* **Implementation:**
  * Collision test: Euclidean distance check against every active bubble:
    $$\sqrt{(X_b - X_p)^2 + (Y_b - Y_p)^2} \le 2R \times 0.93$$
  * Snapping algorithm: Search all 6 hexagonal neighbor coordinates around the impacted bubble. Snap the projectile into the neighbor slot closest to the projectile's center of mass at the moment of impact.

---

### 2.4 Connected Match-3 Algorithm (BFS)
* **Observation:** Popping requires 3 or more bubbles of matching color connected edge-to-edge.
* **Implementation:** Breadth-First Search (BFS) starting from the snapped grid cell $(r_0, c_0)$.
  * Hexagonal Neighbor Adjacency:
    * Odd rows offset: `[[-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0], [1, 1]]`
    * Even rows offset: `[[-1, -1], [-1, 0], [0, -1], [0, 1], [1, -1], [1, 0]]`
  * Add matching color cells (or wildcard rainbow bubbles) to `visitedSet`.
  * If `matchedCluster.length >= 3`, transition state to `RESOLVING` and pop.

```typescript
function findMatchCluster(startCol: number, startRow: number, grid: HexGrid): CellCoord[] {
    const targetColor = grid[startRow][startCol]?.color;
    if (!targetColor) return [];

    const visited = new Set<string>();
    const cluster: CellCoord[] = [];
    const queue: CellCoord[] = [{ col: startCol, row: startRow }];
    visited.add(`${startCol},${startRow}`);

    while (queue.length > 0) {
        const curr = queue.shift()!;
        cluster.push(curr);

        for (const n of getOddRNeighbors(curr.col, curr.row)) {
            const key = `${n.col},${n.row}`;
            if (!visited.has(key) && grid[n.row]?.[n.col]?.color === targetColor) {
                visited.add(key);
                queue.push(n);
            }
        }
    }

    return cluster.length >= 3 ? cluster : [];
}
```

---

### 2.5 Floating Bubble Detection (Ceiling Anchoring)
* **Observation:** In the reference game, clearing a cluster often cuts off bubbles underneath. Any bubble cluster that loses its physical connection to the ceiling falls and awards bonus score.
* **Mathematical Implementation:**
  * Post-pop, initiate a secondary BFS with all occupied cells in **Row 0** (the ceiling) as queue seeds.
  * Traverse outward through all valid adjacent neighbors. Every cell reached is flagged `isAnchored = true`.
  * Sweep the grid: Any bubble where `isAnchored === false` is detached from the ceiling.
  * Detached bubbles are converted into dynamic physics particles with downward acceleration:
    $$Y(t) = Y_0 + V_y t + \frac{1}{2} g t^2 \quad (g = 0.45\text{ px/frame}^2)$$

---

## 3. Objective & Scoring Systems

### Level Objectives
1. **Clear All:** Grid contains no active bubbles.
2. **Rescue Characters:** Trapped "Starlight Jellies" encased in crystal bubbles are freed when adjacent bubbles pop or when their cluster drops.
3. **Target Score:** Hit a point threshold before running out of shots.
4. **Color Hunt:** Clear a specified quota of target colored bubbles.
5. **Drop Target Bubbles:** Disconnect target clusters via topological ceiling cuts.
6. **Combo Milestones:** Chain consecutive matches to reach streak goals.
7. **Limited-Shot Survival:** High-density obstacle puzzle with restricted ammo.

### Scoring Formula
$$\text{Total Score} = \sum (\text{Popped} \times 10) + \text{Bonus}(\text{Cluster Size}) + \sum (\text{Floating} \times 20) \times \text{ComboMultiplier}$$

$$\text{Remaining Shot Bonus} = \text{ShotsRemaining} \times 150$$

---

## 4. Boosters & Tactical Tools
* **Aim Guide:** Increases raycast depth from 1 bounce to 2 bounces and draws the destination landing circle.
* **Bomb Bubble:** Explodes on contact, clearing all adjacent bubbles within a 2-hex radius regardless of color.
* **Rainbow Bubble:** Matches with any bubble color it contacts.
* **+5 Shots:** Increments remaining shot budget by 5.
* **Grid Shuffle:** Permutes colors of remaining grid bubbles to resolve deadlocks.
