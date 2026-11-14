/**
 * BouquetCanvas — dome-style hand-tied bouquet renderer.
 *
 * Composition (bottom → top):
 *  1. Background gradient
 *  2. Sweeping leaves (long, behind everything)
 *  3. Stem bundle (tight parallel lines below flower dome)
 *  4. Flowers (dome-packed, back → front by y position)
 *  5. Ribbon bow (tied around the stem bundle)
 */

import { Stage, Layer, Rect, Group, Text, Shape } from 'react-konva';
import { FlowerHead } from './FlowerHeads.jsx';
import { arrangeBouquet, getLeaves } from '../engine/bouquetEngine.js';
import { WRAPPERS } from './flowerData.js';

export const CANVAS_W = 480;
export const CANVAS_H = 580;

const BG = {
  kraft:  ['#fdf8f2', '#f2e6cc'],
  white:  ['#fafaf8', '#eeede8'],
  velvet: ['#fbf4fc', '#eddcf2'],
  burlap: ['#faf4ec', '#e8d8c0'],
  silk:   ['#fdf0f8', '#f5dcec'],
};

// ─── Leaf shape ───────────────────────────────────────────────────────────────
function SweepingLeaf({ x1, y1, x2, y2, width }) {
  const dx  = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  // Midpoint (slight curve outward)
  const mx  = (x1 + x2) * 0.5 + dy * 0.06;
  const my  = (y1 + y2) * 0.5 - dx * 0.06;
  // Perpendicular for leaf width
  const px  = (-dy / len) * width * 0.5;
  const py  = (dx  / len) * width * 0.5;

  return (
    <Group>
      <Shape
        sceneFunc={(ctx) => {
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.quadraticCurveTo(mx + px, my + py, x2, y2);
          ctx.quadraticCurveTo(mx - px, my - py, x1, y1);
          ctx.closePath();
          ctx.fillStyle = '#4a9632';
          ctx.fill();
          // Midrib
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.quadraticCurveTo(mx + px * 0.12, my + py * 0.12, x2, y2);
          ctx.strokeStyle = '#2d6e1c';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }}
        shadowEnabled={false}
        perfectDrawEnabled={false}
        listening={false}
      />
    </Group>
  );
}

// ─── Stem bundle ─────────────────────────────────────────────────────────────
// Parallel green lines that converge from dome-bottom to ribbon point.
function StemBundle({ cx, topY, bottomY, count }) {
  const spread    = Math.min(36, 8 + count * 2.8);
  const lineCount = Math.min(count + 3, 11);
  const GREENS    = ['#3d7a28', '#2d6018', '#4a9030', '#356820', '#5aaa3c'];

  return (
    <Group listening={false}>
      {Array.from({ length: lineCount }, (_, i) => {
        const t    = lineCount > 1 ? i / (lineCount - 1) - 0.5 : 0;
        const topX = cx + t * spread * 2;
        const botX = cx + t * 4; // almost converges
        return (
          <Shape
            key={i}
            sceneFunc={(ctx) => {
              ctx.beginPath();
              ctx.moveTo(topX, topY);
              ctx.quadraticCurveTo(
                topX * 0.55 + botX * 0.45,
                topY + (bottomY - topY) * 0.55,
                botX, bottomY,
              );
              ctx.strokeStyle = GREENS[i % GREENS.length];
              ctx.lineWidth = 3;
              ctx.lineCap = 'round';
              ctx.stroke();
            }}
            shadowEnabled={false}
            perfectDrawEnabled={false}
            listening={false}
          />
        );
      })}
    </Group>
  );
}

// ─── Ribbon bow ───────────────────────────────────────────────────────────────
function RibbonBow({ x, y, primary, dark }) {
  const U = 5; // unit
  return (
    <Group x={x} y={y} listening={false}>
      {/* Left loop */}
      <Rect x={-5*U} y={-2*U} width={5*U} height={4*U} fill={primary} strokeEnabled={false} shadowEnabled={false} />
      <Rect x={-4*U} y={-U}   width={3*U} height={2*U} fill={dark}    strokeEnabled={false} shadowEnabled={false} />
      {/* Right loop */}
      <Rect x={0}    y={-2*U} width={5*U} height={4*U} fill={primary} strokeEnabled={false} shadowEnabled={false} />
      <Rect x={U}    y={-U}   width={3*U} height={2*U} fill={dark}    strokeEnabled={false} shadowEnabled={false} />
      {/* Knot */}
      <Rect x={-U}   y={-U}   width={2*U} height={2*U} fill={dark}    strokeEnabled={false} shadowEnabled={false} />
      {/* Tails */}
      <Rect x={-2*U} y={U}    width={U}   height={3*U} fill={primary} strokeEnabled={false} shadowEnabled={false} />
      <Rect x={U}    y={U}    width={U}   height={3*U} fill={primary} strokeEnabled={false} shadowEnabled={false} />
    </Group>
  );
}

// ─── Main canvas ──────────────────────────────────────────────────────────────
export default function BouquetCanvas({ selectedFlowers, wrapperId = 'kraft', stageRef }) {
  const wd  = WRAPPERS.find(w => w.id === wrapperId) || WRAPPERS[0];
  const bg  = BG[wrapperId] || BG.kraft;

  const { positions, cx, bundleY, rx, ry, domeCy } =
    arrangeBouquet(selectedFlowers, { width: CANVAS_W, height: CANVAS_H });

  const hasFlowers  = positions.length > 0;
  const domeBottom  = domeCy + ry + 8;   // where leaves + stems start
  const ribbonY     = bundleY + 30;       // bow sits just below the bundle midpoint
  const leaves      = hasFlowers ? getLeaves(cx, domeBottom) : [];

  return (
    <Stage
      ref={stageRef}
      width={CANVAS_W}
      height={CANVAS_H}
      style={{ display: 'block', borderRadius: 16, overflow: 'hidden' }}
      pixelRatio={2}
    >

      {/* 1. Background */}
      <Layer listening={false}>
        <Shape
          sceneFunc={(ctx) => {
            const g = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
            g.addColorStop(0, bg[0]);
            g.addColorStop(1, bg[1]);
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
          }}
          shadowEnabled={false}
          listening={false}
        />
      </Layer>

      {/* 2. Everything else: leaves, stems, flowers, ribbon, empty state */}
      <Layer listening={false}>
        {hasFlowers && <Rect x={50} y={50} width={100} height={100} fill="red" strokeEnabled={false} />}
        {leaves.map((lf, i) => (
          <SweepingLeaf key={i} {...lf} />
        ))}
        {hasFlowers && (
          <StemBundle
            cx={cx}
            topY={domeBottom}
            bottomY={CANVAS_H - 16}
            count={positions.length}
          />
        )}
        {positions.map((p) => (
          <FlowerHead key={p.instanceId} {...p} />
        ))}
        {hasFlowers && (
          <RibbonBow
            x={cx}
            y={ribbonY}
            primary={wd.ribbon}
            dark={wd.dark}
          />
        )}
        {!hasFlowers && (
          <Text
            x={0} y={CANVAS_H / 2 - 30}
            width={CANVAS_W}
            text="Select flowers to build your bouquet"
            fontSize={15}
            fontFamily="Georgia, serif"
            fill="#c0a0b8"
            align="center"
            shadowEnabled={false}
          />
        )}
      </Layer>

    </Stage>
  );
}
