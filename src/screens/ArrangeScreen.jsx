import { useRef, useState, useEffect } from 'react';
import { FLOWERS, CANVAS_W, CANVAS_H, CANVAS_CX, CANVAS_CY, BASE_SIZE } from '../data/flowers.js';

const LEAVES_W = 270;

export default function ArrangeScreen({ selectedIds, placed, setPlaced, onDone }) {
  const [selectedId, setSelectedId] = useState(null);
  const canvasRef = useRef(null);
  const dragRef   = useRef(null);

  // ── Global pointer move / up ────────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e) => {
      if (!dragRef.current || !canvasRef.current) return;
      const d    = dragRef.current;
      const rect = canvasRef.current.getBoundingClientRect();
      const raw  = e.touches ? e.touches[0] : e;
      const mx   = raw.clientX - rect.left;
      const my   = raw.clientY - rect.top;
      const sf   = d.startFlower;

      setPlaced(prev => prev.map(f => {
        if (f.instanceId !== d.instanceId) return f;
        if (d.type === 'move')   return { ...f, x: sf.x + (mx - d.startMX), y: sf.y + (my - d.startMY) };
        if (d.type === 'rotate') {
          const ang = Math.atan2(my - sf.y, mx - sf.x);
          return { ...f, rotation: sf.rotation + (ang - d.startAngle) * (180 / Math.PI) };
        }
        if (d.type === 'scale') {
          const dist = Math.sqrt((mx - sf.x) ** 2 + (my - sf.y) ** 2);
          if (d.startDist < 1) return f;
          return { ...f, scale: Math.max(0.25, Math.min(3.2, sf.scale * (dist / d.startDist))) };
        }
        return f;
      }));
    };

    const onUp = () => { dragRef.current = null; };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend',  onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend',  onUp);
    };
  }, [setPlaced]);

  // ── Begin a drag / rotate / scale ──────────────────────────────────────────
  const beginDrag = (e, flower, type) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedId(flower.instanceId);

    setPlaced(prev => {
      const idx = prev.findIndex(f => f.instanceId === flower.instanceId);
      if (idx < 0) return prev;
      return [...prev.filter((_, i) => i !== idx), prev[idx]];
    });

    const rect = canvasRef.current.getBoundingClientRect();
    const raw  = e.touches ? e.touches[0] : e;
    const mx   = raw.clientX - rect.left;
    const my   = raw.clientY - rect.top;
    const sf   = { ...flower };

    if (type === 'move')   dragRef.current = { type, instanceId: flower.instanceId, startMX: mx, startMY: my, startFlower: sf };
    if (type === 'rotate') dragRef.current = { type, instanceId: flower.instanceId, startAngle: Math.atan2(my - sf.y, mx - sf.x), startFlower: sf };
    if (type === 'scale')  dragRef.current = { type, instanceId: flower.instanceId, startDist: Math.max(1, Math.sqrt((mx - sf.x) ** 2 + (my - sf.y) ** 2)), startFlower: sf };
  };

  // ── Add a flower copy from the tray ────────────────────────────────────────
  const addFromTray = (flowerId) => {
    const flower = FLOWERS.find(f => f.id === flowerId);
    const jitter = () => (Math.random() - 0.5) * 80;
    const fresh = {
      instanceId: `${flowerId}_${Date.now()}`,
      flowerId,
      src:      flower.src,
      x:        CANVAS_CX + jitter(),
      y:        CANVAS_CY + jitter(),
      scale:    0.9,
      rotation: (Math.random() - 0.5) * 28,
    };
    setPlaced(prev => [...prev, fresh]);
    setSelectedId(fresh.instanceId);
  };

  const deleteFlower = (instanceId) => {
    setPlaced(prev => prev.filter(f => f.instanceId !== instanceId));
    setSelectedId(null);
  };

  const trayFlowers = FLOWERS.filter(f => selectedIds.includes(f.id));

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f2ede6',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingBottom: 40,
    }}>

      {/* ── Header ── */}
      <div style={{ padding: '22px 0 10px', textAlign: 'center' }}>
        <img src="/logo.png" alt="" draggable={false} style={{ width: 110, marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
        <h1 style={{ fontSize: 64, fontWeight: 700, color: '#2e2a25', letterSpacing: 2, lineHeight: 1.1, margin: 0 }}>Fleurique</h1>
      </div>

      {/* ── Canvas board ── */}
      <div
        ref={canvasRef}
        style={{
          position: 'relative',
          width: CANVAS_W,
          height: CANVAS_H,
          background: '#ffffff',
          isolation: 'isolate',          /* blend modes composite against white */
          borderRadius: 18,
          boxShadow: '0 4px 28px rgba(0,0,0,0.12)',
          overflow: 'visible',
          touchAction: 'none',
          userSelect: 'none',
        }}
        onMouseDown={(e) => { if (e.target === canvasRef.current) setSelectedId(null); }}
      >
        {/* ── Leaves bouquet base ── */}
        <img
          src="/flowers/leaves.png"
          alt=""
          draggable={false}
          style={{
            position: 'absolute',
            width: LEAVES_W,
            left: (CANVAS_W - LEAVES_W) / 2,
            top: '50%',
            transform: 'translateY(-52%)',
            pointerEvents: 'none',
            zIndex: 1,
            mixBlendMode: 'multiply',    /* removes cream background */
          }}
        />

        {/* ── Flower stickers ── */}
        {placed.map((flower, idx) => {
          const isSel = selectedId === flower.instanceId;
          const w     = BASE_SIZE * flower.scale;

          return (
            <div
              key={flower.instanceId}
              style={{
                position: 'absolute',
                left: flower.x - w / 2,
                top:  flower.y - w / 2,
                width: w,
                height: w,
                transform: `rotate(${flower.rotation}deg)`,
                transformOrigin: 'center center',
                zIndex: isSel ? 900 : idx + 2,
                cursor: 'grab',
              }}
              onMouseDown={(e) => beginDrag(e, flower, 'move')}
              onTouchStart={(e) => beginDrag(e, flower, 'move')}
            >
              {/* The flower image — white background removed via multiply */}
              <img
                src={flower.src}
                alt=""
                draggable={false}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  display: 'block',
                  pointerEvents: 'none',
                  mixBlendMode: 'multiply',   /* key: merges into bouquet */
                }}
              />

              {/* ── Selection handles (not multiplied) ── */}
              {isSel && (
                <>
                  {/* Selection ring */}
                  <div style={{
                    position: 'absolute', inset: -3,
                    border: '2px dashed rgba(80,120,255,0.6)',
                    borderRadius: 6,
                    pointerEvents: 'none',
                  }} />

                  {/* Delete — top-left */}
                  <div
                    title="Remove"
                    onMouseDown={(e) => { e.stopPropagation(); deleteFlower(flower.instanceId); }}
                    onTouchStart={(e) => { e.stopPropagation(); deleteFlower(flower.instanceId); }}
                    style={{
                      position: 'absolute', top: -13, left: -13,
                      width: 26, height: 26,
                      borderRadius: '50%',
                      background: '#ff4444',
                      color: '#fff',
                      fontSize: 17, fontWeight: 700,
                      lineHeight: '26px', textAlign: 'center',
                      cursor: 'pointer', zIndex: 10,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.28)',
                    }}
                  >×</div>

                  {/* Rotate — top-right */}
                  <div
                    title="Rotate"
                    onMouseDown={(e) => beginDrag(e, flower, 'rotate')}
                    onTouchStart={(e) => beginDrag(e, flower, 'rotate')}
                    style={{
                      position: 'absolute', top: -13, right: -13,
                      width: 26, height: 26,
                      borderRadius: '50%',
                      background: '#fff',
                      border: '1.5px solid #bbb',
                      fontSize: 17, lineHeight: '24px', textAlign: 'center',
                      cursor: 'crosshair', zIndex: 10,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    }}
                  >↻</div>

                  {/* Scale — bottom-right */}
                  <div
                    title="Resize"
                    onMouseDown={(e) => beginDrag(e, flower, 'scale')}
                    onTouchStart={(e) => beginDrag(e, flower, 'scale')}
                    style={{
                      position: 'absolute', bottom: -11, right: -11,
                      width: 24, height: 24,
                      borderRadius: '50%',
                      background: '#fff',
                      border: '1.5px solid #bbb',
                      fontSize: 17, lineHeight: '22px', textAlign: 'center',
                      cursor: 'se-resize', zIndex: 10,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    }}
                  >⤡</div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Sticker tray ── */}
      <div style={{
        width: CANVAS_W,
        marginTop: 16,
        background: '#fff',
        borderRadius: 16,
        padding: '14px 18px 16px',
        boxShadow: '0 4px 18px rgba(0,0,0,0.09)',
      }}>
        <p style={{
          fontSize: 17, fontWeight: 700,
          letterSpacing: '0.1em', color: '#b0a898',
          textTransform: 'uppercase', marginBottom: 10,
        }}>
          Tap a flower to add it
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {trayFlowers.map(flower => (
            <button
              key={flower.id}
              onClick={() => addFromTray(flower.id)}
              title={`Add ${flower.name}`}
              style={{
                background: '#faf6f1',
                border: '1.5px solid #ece6de',
                borderRadius: 12,
                padding: '8px 10px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                transition: 'transform 0.1s, box-shadow 0.1s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.07)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)';    e.currentTarget.style.boxShadow = 'none'; }}
            >
              {/* Tray thumbnails also use multiply so no white box */}
              <div style={{ width: 54, height: 54, background: '#faf6f1', borderRadius: 8, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', isolation: 'isolate' }}>
                <img
                  src={flower.src}
                  alt={flower.name}
                  draggable={false}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }}
                />
              </div>
              <span style={{ fontSize: 17, color: '#7a7068' }}>{flower.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Done button ── */}
      <button
        onClick={onDone}
        style={{
          marginTop: 20,
          background: '#2a2520',
          border: 'none',
          borderRadius: 8,
          padding: '11px 56px',
          fontSize: 22, fontWeight: 700,
          color: '#fff',
          cursor: 'pointer',
          letterSpacing: 0.3,
          boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
        }}
      >
        Done arranging
      </button>
    </div>
  );
}
