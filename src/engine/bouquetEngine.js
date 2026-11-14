import { FLOWER_META } from '../canvas/flowerData.js';

const ROLE_ORDER = { main: 0, secondary: 1, filler: 2 };

// Golden angle: ensures uniform sunflower-spiral coverage
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)); // ≈ 137.508°

/**
 * Dome bouquet arrangement — like a hand-tied round bouquet.
 *
 * Flowers are packed in a sunflower-spiral ellipse (dome) at the top.
 * Main/focal flowers land in the center, fillers at the edges.
 * Stems are NOT individually tracked — the canvas draws a tight bundle.
 */
export function arrangeBouquet(selectedFlowers, { width, height }) {
  const cx = width / 2;

  const instances = [];
  selectedFlowers.forEach(({ id, count }) => {
    const meta = FLOWER_META[id];
    if (!meta || count <= 0) return;
    for (let i = 0; i < count; i++) {
      instances.push({ ...meta, instanceId: `${id}_${i}` });
    }
  });

  const n = instances.length;
  const domeCy    = height * 0.30;          // vertical center of bloom cluster
  const rx        = Math.min(185, 48 + n * 13); // horizontal dome radius
  const ry        = Math.min(125, 32 + n * 8);  // vertical dome radius
  const bundleY   = domeCy + ry + 80;       // where stems converge (ribbon here)

  if (!n) return { positions: [], cx, bundleY, rx, ry, domeCy };

  // Sort: main flowers (lower index → center of spiral)
  instances.sort((a, b) => (ROLE_ORDER[a.category] || 1) - (ROLE_ORDER[b.category] || 1));

  // Sunflower spiral — natural, gap-free packing
  const positions = instances.map((item, i) => {
    const r     = Math.sqrt(i / Math.max(n - 1, 1));  // 0 at center, 1 at edge
    const theta = i * GOLDEN_ANGLE;
    const x     = cx + r * rx * Math.cos(theta);
    const y     = domeCy + r * ry * Math.sin(theta);

    // Flowers at the edge tilt outward slightly
    const tilt = ((x - cx) / (rx || 1)) * 28;

    return { ...item, x, y, angleDeg: tilt, bundleX: cx, bundleY, renderDepth: y };
  });

  // Back-to-front: lower y = higher up = rendered first (behind)
  positions.sort((a, b) => a.renderDepth - b.renderDepth);

  return { positions, cx, bundleY, rx, ry, domeCy };
}

/**
 * Long sweeping leaves that radiate from the stem bundle area.
 * They appear behind the flowers — the classic "hand-tied" look.
 */
export function getLeaves(cx, bundleTopY) {
  // [angleDeg from vertical, length, x offset at base]
  const config = [
    { a: -62, len: 195, xOff: -20 },
    { a: -40, len: 175, xOff: -10 },
    { a: -20, len: 155, xOff:   0 },
    { a:   5, len: 150, xOff:   5 },
    { a:  22, len: 158, xOff:   0 },
    { a:  42, len: 178, xOff:  10 },
    { a:  64, len: 198, xOff:  20 },
  ];

  return config.map(({ a, len, xOff }) => {
    const rad = (a * Math.PI) / 180;
    const ox  = cx + xOff;
    const oy  = bundleTopY;
    return {
      x1: ox,
      y1: oy,
      x2: ox + Math.sin(rad) * len,
      y2: oy - Math.cos(rad) * len,
      width: 15,
    };
  });
}
