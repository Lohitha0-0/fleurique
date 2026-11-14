/**
 * FlowerHeads — real pixel-art images for 5 flowers, programmatic sprites for the rest.
 *
 * Image flowers use Konva.Image with a white-removal filter.
 * Programmatic flowers use Rect-based pixel art (P=5 grid).
 *
 * Origin of every head: (0,0) = bloom centre.
 * Rotation is applied by the parent Group at the (x,y) position.
 */

import { useState, useEffect } from 'react';
import { Group, Rect, Image as KonvaImage } from 'react-konva';

// ─── White-background removal via HTML canvas ─────────────────────────────────
// Scales the image down to maxW before pixel-processing to avoid main-thread hangs.
// Results are cached by src so each image is processed only once.
const _imgCache = new Map();

function loadAndStrip(src, maxW = 320, lo = 235) {
  if (_imgCache.has(src)) return _imgCache.get(src);
  const p = new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const scale = Math.min(1, maxW / img.naturalWidth);
      const w = Math.round(img.naturalWidth  * scale);
      const h = Math.round(img.naturalHeight * scale);
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);      // scale while drawing
      const px = ctx.getImageData(0, 0, w, h);
      const d  = px.data;
      for (let i = 0; i < d.length; i += 4) {
        const m = Math.min(d[i], d[i + 1], d[i + 2]);
        if (m > lo) d[i + 3] = Math.round(d[i + 3] * (1 - (m - lo) / (255 - lo)));
      }
      ctx.putImageData(px, 0, 0);
      const out = new window.Image();
      out.onload = () => resolve(out);
      out.src    = c.toDataURL('image/png');
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
  _imgCache.set(src, p);
  return p;
}

// ─── Per-flower image config ──────────────────────────────────────────────────
// displayWidth  : render width in canvas px (height auto from aspect ratio)
// bloomCenterY  : fraction of displayHeight where bloom centre sits (0 = top edge)
const IMAGE_CONFIG = {
  peony:    { src: '/flowers/peony.png',    displayWidth: 115, bloomCenterY: 0.48 },
  rose:     { src: '/flowers/lily-pink.png',displayWidth: 120, bloomCenterY: 0.25 },
  tulip:    { src: '/flowers/tulip.png',    displayWidth: 82,  bloomCenterY: 0.19 },
  lily:     { src: '/flowers/lily.png',     displayWidth: 95,  bloomCenterY: 0.27 },
  lavender: { src: '/flowers/lavender.png', displayWidth: 78,  bloomCenterY: 0.14 },
};

// ─── Image-loading hook ───────────────────────────────────────────────────────
function useFlowerImg(src) {
  const [img, setImg] = useState(null);
  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    loadAndStrip(src).then((out) => { if (!cancelled && out) setImg(out); });
    return () => { cancelled = true; };
  }, [src]);
  return img;
}

// ─── Image-based flower head ──────────────────────────────────────────────────
function ImageFlowerHead({ src, displayWidth, bloomCenterY: bcY, x, y, angleDeg }) {
  const img = useFlowerImg(src);
  if (!img) return null;

  const scale         = displayWidth / img.naturalWidth;
  const displayHeight = img.naturalHeight * scale;

  return (
    <KonvaImage
      image={img}
      width={displayWidth}
      height={displayHeight}
      offsetX={displayWidth / 2}
      offsetY={displayHeight * bcY}
      x={x}
      y={y}
      rotation={angleDeg * 0.28}
      shadowEnabled={false}
      perfectDrawEnabled={false}
      listening={false}
    />
  );
}

// ─── Programmatic pixel-art sprites (P = 5 px/unit) ─────────────────────────
const P = 5;
function Px({ x, y, w = 1, h = 1, c }) {
  return (
    <Rect
      x={x * P} y={y * P} width={w * P} height={h * P}
      fill={c}
      strokeEnabled={false} shadowEnabled={false} perfectDrawEnabled={false}
    />
  );
}

// SUNFLOWER — 16×16 grid (80×80 px), offset (40, 35)
function SunflowerHead({ primaryColor: p, darkColor: d, highlightColor: h, centerColor: cc, centerDark: cd }) {
  const cMain = cc || '#5c3317', cDark = cd || '#3b2008', g = '#3d8c28';
  return (
    <Group offsetX={40} offsetY={35}>
      <Px x={7} y={0} w={2} h={3} c={p} /><Px x={7} y={1} w={1} h={2} c={h} />
      <Px x={7} y={13} w={2} h={3} c={p} />
      <Px x={0} y={7} w={3} h={2} c={p} />
      <Px x={13} y={7} w={3} h={2} c={p} /><Px x={13} y={7} w={2} h={1} c={h} />
      <Px x={2} y={2} w={3} h={3} c={p} /><Px x={2} y={2} w={2} h={2} c={d} /><Px x={3} y={2} w={1} h={1} c={h} />
      <Px x={11} y={2} w={3} h={3} c={p} /><Px x={12} y={2} w={2} h={2} c={d} /><Px x={12} y={2} w={1} h={1} c={h} />
      <Px x={2} y={11} w={3} h={3} c={p} /><Px x={2} y={12} w={2} h={2} c={d} />
      <Px x={11} y={11} w={3} h={3} c={p} /><Px x={12} y={12} w={2} h={2} c={d} />
      <Px x={4} y={4} w={8} h={8} c={cDark} />
      <Px x={5} y={5} w={6} h={6} c={cMain} />
      <Px x={5} y={5} w={2} h={1} c={cDark} /><Px x={9} y={5} w={2} h={1} c={cDark} />
      <Px x={5} y={7} w={6} h={1} c={cDark} />
      <Px x={5} y={9} w={2} h={1} c={cDark} /><Px x={9} y={9} w={2} h={1} c={cDark} />
      <Px x={6} y={16} w={4} h={1} c={g} />
    </Group>
  );
}

// DAISY — 14×14 grid (70×70 px), offset (35, 30)
function DaisyHead({ primaryColor: p, darkColor: d, centerColor: cc, centerDark: cd }) {
  const petal = p || '#ffffff', pDark = d || '#ddd';
  const cMain = cc || '#ffd23f', cDark = cd || '#e8a800', g = '#3d8c28';
  return (
    <Group offsetX={35} offsetY={30}>
      <Px x={6} y={0} w={2} h={4} c={petal} /><Px x={6} y={0} w={1} h={3} c={pDark} />
      <Px x={6} y={10} w={2} h={4} c={petal} />
      <Px x={0} y={6} w={4} h={2} c={petal} /><Px x={0} y={6} w={3} h={1} c={pDark} />
      <Px x={10} y={6} w={4} h={2} c={petal} />
      <Px x={2} y={2} w={2} h={3} c={petal} /><Px x={2} y={2} w={3} h={2} c={petal} />
      <Px x={10} y={2} w={2} h={3} c={petal} /><Px x={9} y={2} w={3} h={2} c={petal} />
      <Px x={2} y={9} w={2} h={3} c={petal} /><Px x={2} y={10} w={3} h={2} c={petal} />
      <Px x={10} y={9} w={2} h={3} c={petal} /><Px x={9} y={10} w={3} h={2} c={petal} />
      <Px x={4} y={4} w={6} h={6} c={cMain} />
      <Px x={5} y={5} w={4} h={4} c={cDark} />
      <Px x={6} y={6} w={2} h={2} c={cMain} />
      <Px x={5} y={14} w={4} h={1} c={g} />
    </Group>
  );
}

// ORCHID — 14×12 grid (70×60 px), offset (35, 25)
function OrchidHead({ primaryColor: p, darkColor: d, highlightColor: h }) {
  const g = '#3d8c28';
  return (
    <Group offsetX={35} offsetY={25}>
      <Px x={1} y={0} w={4} h={5} c={p} /><Px x={2} y={0} w={2} h={3} c={h} />
      <Px x={9} y={0} w={4} h={5} c={p} /><Px x={10} y={0} w={2} h={3} c={h} />
      <Px x={0} y={3} w={5} h={4} c={p} /><Px x={0} y={4} w={3} h={2} c={h} />
      <Px x={9} y={3} w={5} h={4} c={p} /><Px x={11} y={4} w={2} h={2} c={h} />
      <Px x={3} y={6} w={8} h={5} c={d} />
      <Px x={4} y={7} w={6} h={3} c={p} />
      <Px x={5} y={8} w={4} h={2} c={h} />
      <Px x={5} y={2} w={4} h={5} c={d} /><Px x={6} y={3} w={2} h={3} c={h} />
      <Px x={5} y={11} w={4} h={1} c={g} />
    </Group>
  );
}

// HYDRANGEA — 4 florets in 2×2, 14×14 grid (70×70 px), offset (35, 30)
function HydrangeaHead({ primaryColor: p, darkColor: d, highlightColor: h }) {
  const g = '#3d8c28';
  function Floret({ ox, oy }) {
    return (
      <Group x={ox * P} y={oy * P}>
        <Px x={2} y={0} w={2} h={2} c={p} />
        <Px x={0} y={2} w={2} h={2} c={p} />
        <Px x={4} y={2} w={2} h={2} c={p} />
        <Px x={2} y={4} w={2} h={2} c={p} />
        <Px x={2} y={2} w={2} h={2} c={d} />
        <Px x={2} y={2} w={1} h={1} c={h} />
      </Group>
    );
  }
  return (
    <Group offsetX={35} offsetY={30}>
      <Floret ox={0} oy={0} /><Floret ox={7} oy={0} />
      <Floret ox={0} oy={7} /><Floret ox={7} oy={7} />
      <Px x={5} y={14} w={4} h={1} c={g} />
    </Group>
  );
}

// MARIGOLD — 14×13 grid (70×65 px), offset (35, 30)
function MarigoldHead({ primaryColor: p, darkColor: d, highlightColor: h }) {
  const g = '#3d8c28';
  return (
    <Group offsetX={35} offsetY={30}>
      <Px x={4} y={0}  w={6} h={2} c={p} /><Px x={4} y={0} w={2} h={1} c={h} />
      <Px x={1} y={1}  w={3} h={3} c={p} /><Px x={10} y={1} w={3} h={3} c={p} />
      <Px x={0} y={4}  w={2} h={6} c={p} /><Px x={0} y={4} w={1} h={2} c={h} />
      <Px x={12} y={4} w={2} h={6} c={p} />
      <Px x={1} y={10} w={3} h={3} c={p} /><Px x={10} y={10} w={3} h={3} c={p} />
      <Px x={4} y={12} w={6} h={2} c={p} />
      <Px x={2} y={2}  w={10} h={2} c={d} />
      <Px x={2} y={4}  w={10} h={6} c={d} />
      <Px x={2} y={10} w={10} h={2} c={d} />
      <Px x={4} y={4}  w={6} h={6} c={p} />
      <Px x={5} y={5}  w={4} h={4} c={d} />
      <Px x={6} y={6}  w={2} h={2} c={h} />
      <Px x={4} y={13} w={6} h={1} c={g} />
    </Group>
  );
}

const PROG_MAP = {
  sunflower: SunflowerHead,
  daisy:     DaisyHead,
  orchid:    OrchidHead,
  hydrangea: HydrangeaHead,
  marigold:  MarigoldHead,
};

// ─── Public dispatcher ────────────────────────────────────────────────────────
export function FlowerHead({ id, x, y, angleDeg, ...meta }) {
  // Image-based flower?
  const imgCfg = IMAGE_CONFIG[id];
  if (imgCfg) {
    return <ImageFlowerHead {...imgCfg} x={x} y={y} angleDeg={angleDeg} />;
  }

  // Programmatic pixel-art sprite
  const Component = PROG_MAP[id];
  if (!Component) return null;
  return (
    <Group x={x} y={y} rotation={angleDeg * 0.28}>
      <Component {...meta} />
    </Group>
  );
}
