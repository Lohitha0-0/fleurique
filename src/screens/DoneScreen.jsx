import { CANVAS_W, CANVAS_H, BASE_SIZE } from '../data/flowers.js';

const LEAVES_W = 270;

export default function DoneScreen({ placed, onWriteLetter }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f2ede6',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingBottom: 40,
    }}>
      <div style={{ padding: '22px 0 10px', textAlign: 'center' }}>
        <img src="/logo.png" alt="" draggable={false} style={{ width: 110, display: 'block', margin: '0 auto 8px' }} />
        <h1 style={{ fontSize: 64, fontWeight: 700, color: '#2e2a25', letterSpacing: 2, lineHeight: 1.1, margin: 0 }}>Fleurique</h1>
      </div>

      {/* White canvas — isolation ensures multiply works against white */}
      <div style={{
        position: 'relative',
        width: CANVAS_W,
        height: CANVAS_H,
        background: '#ffffff',
        isolation: 'isolate',
        borderRadius: 18,
        boxShadow: '0 4px 28px rgba(0,0,0,0.12)',
        overflow: 'hidden',
        userSelect: 'none',
      }}>
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
            mixBlendMode: 'multiply',
          }}
        />
        {placed.map((flower, idx) => {
          const w = BASE_SIZE * flower.scale;
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
                zIndex: idx + 2,
                pointerEvents: 'none',
              }}
            >
              <img
                src={flower.src}
                alt=""
                draggable={false}
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'contain', display: 'block',
                  mixBlendMode: 'multiply',
                }}
              />
            </div>
          );
        })}
      </div>

      <button
        onClick={onWriteLetter}
        style={{
          marginTop: 24,
          background: '#2a2520',
          border: 'none',
          borderRadius: 8,
          padding: '11px 44px',
          fontSize: 22, fontWeight: 700,
          color: '#fff', letterSpacing: 0.3,
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
        }}
      >
        Write a letter
      </button>
    </div>
  );
}
