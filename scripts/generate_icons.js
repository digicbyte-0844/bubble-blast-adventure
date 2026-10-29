import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPng(width, height, drawFn) {
  const rowSize = width * 4;
  const raw = Buffer.alloc((rowSize + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (rowSize + 1)] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const idx = y * (rowSize + 1) + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      raw[idx] = r;
      raw[idx + 1] = g;
      raw[idx + 2] = b;
      raw[idx + 3] = a;
    }
  }
  const compressed = zlib.deflateSync(raw);

  function crc32(buf) {
    let c = ~0;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (-(c & 1) & 0xEDB88320);
    }
    return ~c >>> 0;
  }
  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const t = Buffer.from(type, 'ascii');
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
    return Buffer.concat([len, t, data, crc]);
  }
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))]);
}

const dir = 'client/public/assets/icons';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

// 1. star.png (Cosmic Golden Star)
const starPng = createPng(48, 48, (x, y) => {
  const dx = x - 24, dy = y - 24;
  const dist = Math.hypot(dx, dy);
  if (dist > 22) return [0, 0, 0, 0];
  const angle = Math.atan2(dy, dx) - Math.PI / 2;
  const r = 14 + 7 * Math.cos(angle * 5);
  if (dist <= r - 2) return [253, 224, 71, 255]; // Bright center
  if (dist <= r) return [245, 158, 11, 255];     // Gold body
  if (dist <= r + 1.5) return [180, 83, 9, 255]; // Dark border
  return [0, 0, 0, 0];
});
fs.writeFileSync(path.join(dir, 'star.png'), starPng);

// 2. target.png (Cyan Crosshair Target)
const targetPng = createPng(48, 48, (x, y) => {
  const dx = x - 24, dy = y - 24;
  const dist = Math.hypot(dx, dy);
  if (dist > 22) return [0, 0, 0, 0];
  const onCross = (Math.abs(dx) <= 1.5 && Math.abs(dy) <= 20) || (Math.abs(dy) <= 1.5 && Math.abs(dx) <= 20);
  if (dist <= 4) return [255, 255, 255, 255]; // Center pip
  if (Math.abs(dist - 16) <= 2 || Math.abs(dist - 9) <= 1.5) return [56, 189, 248, 255]; // Cyan rings
  if (onCross && dist > 5) return [250, 204, 21, 255]; // Yellow crosshairs
  return [0, 0, 0, 0];
});
fs.writeFileSync(path.join(dir, 'target.png'), targetPng);

// 3. bomb.png (Cosmic Dark Bomb with Orange Core)
const bombPng = createPng(48, 48, (x, y) => {
  const dx = x - 24, dy = y - 26;
  const dist = Math.hypot(dx, dy);
  // Fuse cap & spark
  if (x >= 22 && x <= 26 && y >= 10 && y <= 16) return [249, 115, 22, 255];
  if (x >= 24 && x <= 30 && y >= 6 && y <= 11) return [253, 224, 71, 255];
  if (dist <= 18) {
    if (dist <= 6) return [255, 100, 30, 255]; // Core glow
    if (dx < -4 && dy < -4) return [71, 85, 105, 255]; // Highlight
    return [30, 41, 59, 255]; // Slate dark body
  }
  if (dist <= 19.5) return [15, 23, 42, 255]; // Outer rim
  return [0, 0, 0, 0];
});
fs.writeFileSync(path.join(dir, 'bomb.png'), bombPng);

// 4. rainbow.png (Prismatic Spectrum Arcs)
const rainbowPng = createPng(48, 48, (x, y) => {
  const dx = x - 24, dy = y - 30;
  const dist = Math.hypot(dx, dy);
  if (dy > 2) return [0, 0, 0, 0];
  if (dist >= 19 && dist <= 23) return [239, 68, 68, 255];   // Crimson
  if (dist >= 15 && dist < 19) return [245, 158, 11, 255];  // Amber
  if (dist >= 11 && dist < 15) return [16, 185, 129, 255];  // Emerald
  if (dist >= 7 && dist < 11) return [6, 182, 212, 255];    // Cyan
  if (dist >= 3 && dist < 7) return [147, 51, 234, 255];    // Violet
  return [0, 0, 0, 0];
});
fs.writeFileSync(path.join(dir, 'rainbow.png'), rainbowPng);

// 5. fire.png (Stylized Neon Flame)
const firePng = createPng(48, 48, (x, y) => {
  const dx = x - 24, dy = y - 26;
  const dist = Math.hypot(dx, dy);
  if (y < 8 || y > 42 || Math.abs(dx) > 18) return [0, 0, 0, 0];
  const flameW = (40 - y) * 0.45;
  if (Math.abs(dx) <= flameW) {
    if (Math.abs(dx) <= flameW * 0.4 && y >= 20) return [254, 240, 138, 255]; // Yellow heart
    if (Math.abs(dx) <= flameW * 0.7) return [249, 115, 22, 255];             // Orange body
    return [239, 68, 68, 255];                                               // Red border
  }
  return [0, 0, 0, 0];
});
fs.writeFileSync(path.join(dir, 'fire.png'), firePng);

// 6. bubble.png (Glossy Cyan Bubble)
const bubblePng = createPng(48, 48, (x, y) => {
  const dx = x - 24, dy = y - 24;
  const dist = Math.hypot(dx, dy);
  if (dist <= 19) {
    const glint = Math.hypot(dx + 6, dy + 6);
    if (glint <= 5) return [255, 255, 255, 240];
    if (dist <= 14) return [56, 189, 248, 220];
    return [2, 132, 199, 240];
  }
  if (dist <= 21) return [3, 105, 161, 255];
  return [0, 0, 0, 0];
});
fs.writeFileSync(path.join(dir, 'bubble.png'), bubblePng);

// 7. plus.png (Emerald Plus Indicator)
const plusPng = createPng(48, 48, (x, y) => {
  const dx = Math.abs(x - 24), dy = Math.abs(y - 24);
  const dist = Math.hypot(x - 24, y - 24);
  if (dist <= 21) {
    const isBar = (dx <= 4 && dy <= 14) || (dy <= 4 && dx <= 14);
    if (isBar) return [16, 185, 129, 255]; // Emerald
    return [15, 23, 42, 220];              // Slate ring
  }
  if (dist <= 22.5) return [5, 150, 105, 255];
  return [0, 0, 0, 0];
});
fs.writeFileSync(path.join(dir, 'plus.png'), plusPng);

// 8. shuffle.png (Prismatic Crossed Shuffle Arrows)
const shufflePng = createPng(48, 48, (x, y) => {
  const dist = Math.hypot(x - 24, y - 24);
  if (dist > 21) return [0, 0, 0, 0];
  const onPath1 = Math.abs((x - y)) <= 3;
  const onPath2 = Math.abs((x + y - 48)) <= 3;
  if ((onPath1 || onPath2) && x >= 10 && x <= 38 && y >= 10 && y <= 38) {
    return [168, 85, 247, 255]; // Purple arrow lines
  }
  if (dist <= 19) return [30, 41, 59, 200];
  return [71, 85, 105, 255];
});
fs.writeFileSync(path.join(dir, 'shuffle.png'), shufflePng);

// 9. coin.png (Golden Arcade Coin)
const coinPng = createPng(48, 48, (x, y) => {
  const dx = x - 24, dy = y - 24;
  const dist = Math.hypot(dx, dy);
  if (dist <= 18) {
    if (dist <= 13) {
      if (Math.abs(dx) <= 2 && Math.abs(dy) <= 7) return [180, 83, 9, 255]; // Star/bar emboss
      return [253, 224, 71, 255];
    }
    return [245, 158, 11, 255];
  }
  if (dist <= 20) return [180, 83, 9, 255];
  return [0, 0, 0, 0];
});
fs.writeFileSync(path.join(dir, 'coin.png'), coinPng);

// 10. swap.png (Circular Swap Directional Indicator)
const swapPng = createPng(48, 48, (x, y) => {
  const dx = x - 24, dy = y - 24;
  const dist = Math.hypot(dx, dy);
  if (dist > 21) return [0, 0, 0, 0];
  if (Math.abs(dist - 14) <= 3) return [250, 204, 21, 255];
  if (dist <= 19) return [15, 23, 42, 220];
  return [71, 85, 105, 255];
});
fs.writeFileSync(path.join(dir, 'swap.png'), swapPng);

// 11. trophy.png (Golden Championship Cup)
const trophyPng = createPng(48, 48, (x, y) => {
  const dx = x - 24, dy = y - 22;
  if (y >= 10 && y <= 24 && Math.abs(dx) <= 12) return [250, 204, 21, 255]; // Cup bowl
  if (y >= 25 && y <= 32 && Math.abs(dx) <= 3) return [217, 119, 6, 255];  // Stem
  if (y >= 33 && y <= 38 && Math.abs(dx) <= 10) return [180, 83, 9, 255];  // Base
  if (y >= 12 && y <= 20 && Math.abs(dx) >= 12 && Math.abs(dx) <= 16) return [245, 158, 11, 255]; // Handles
  return [0, 0, 0, 0];
});
fs.writeFileSync(path.join(dir, 'trophy.png'), trophyPng);

// 12. heart-broken.png (Defeat Emblem)
const heartBrokenPng = createPng(48, 48, (x, y) => {
  const dx = x - 24, dy = y - 22;
  const dist = Math.hypot(dx, dy);
  if (y >= 10 && y <= 36 && Math.abs(dx) <= (36 - y) * 0.75 + 4) {
    if (Math.abs(dx - (y % 4 - 2)) <= 1.5) return [15, 23, 42, 255]; // Jagged crack
    return [244, 63, 94, 255]; // Rose heart
  }
  return [0, 0, 0, 0];
});
fs.writeFileSync(path.join(dir, 'heart-broken.png'), heartBrokenPng);

console.log('✅ Generated 12 crisp production icons in client/public/assets/icons/');
