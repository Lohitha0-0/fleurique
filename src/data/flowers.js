export const FLOWERS = [
  { id: 'rose',      name: 'Rose',      src: '/flowers/rose.png' },
  { id: 'tulip',     name: 'Tulip',     src: '/flowers/tulip.png' },
  { id: 'sunflower', name: 'Sunflower', src: '/flowers/sunflower.png' },
  { id: 'daisy',     name: 'Daisy',     src: '/flowers/daisy.png' },
  { id: 'gerbera',   name: 'Gerbera',   src: '/flowers/gerbera.png' },
  { id: 'aster',     name: 'Aster',     src: '/flowers/aster.png' },
  { id: 'lily',      name: 'Lily',      src: '/flowers/Lily.png' },
  { id: 'peony',     name: 'Peony',     src: '/flowers/peony.png' },
  { id: 'cosmos',    name: 'Cosmos',    src: '/flowers/cosmos.png' },
  { id: 'dahlia',    name: 'Dahlia',    src: '/flowers/Dahlia.png' },
  { id: 'clematis',  name: 'Clematis',  src: '/flowers/clematis.png' },
  { id: 'image69',   name: 'Blossom',   src: '/flowers/image69.png' },
];

export const CANVAS_W  = 520;
export const CANVAS_H  = 560;
export const BASE_SIZE = 100;

// Centre of the leaf-top zone — where flower heads naturally sit on the bouquet
export const CANVAS_CX = CANVAS_W / 2;        // 260
export const CANVAS_CY = 185;                  // upper third of leaves image

export function initFlowers(ids) {
  const n = ids.length;
  return ids.map((id, i) => {
    const flower = FLOWERS.find(f => f.id === id);
    const angle  = (i / Math.max(n, 1)) * 2 * Math.PI - Math.PI / 2;
    const r      = 50 + (i % 3) * 25;           // 50 / 75 / 100 px — stays ON the bouquet
    return {
      instanceId: `${id}_${i}`,
      flowerId:   id,
      src:        flower.src,
      x:          CANVAS_CX + r * Math.cos(angle),
      y:          CANVAS_CY + r * Math.sin(angle),
      scale:      0.9,
      rotation:   (i % 7 - 3) * 8,
    };
  });
}
