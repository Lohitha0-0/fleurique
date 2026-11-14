import { useState } from 'react';
import { CANVAS_W, CANVAS_H, BASE_SIZE } from '../data/flowers.js';

const LEAVES_W = 270;

export default function ShareScreen({ placed, letter, isShared, onOpenLetter }) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    const data    = { placed, letter };
    const encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(data)))));
    const url     = `${window.location.origin}${window.location.pathname}?share=${encoded}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      prompt('Copy this link:', url);
    }
  };

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

      {/* White canvas + isolation */}
      <div style={{
        position: 'relative',
        width: CANVAS_W,
        height: CANVAS_H,
        background: '#ffffff',
        isolation: 'isolate',
        borderRadius: 18,
        boxShadow: '0 4px 28px rgba(0,0,0,0.12)',
        overflow: 'visible',
        userSelect: 'none',
      }}>
        {/* Leaves base */}
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

        {/* Flowers */}
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

        {/* Envelope — tucked top-right like a card in the bouquet */}
        {(letter?.to || letter?.body || letter?.from) && (
          <button
            onClick={onOpenLetter}
            title="Open letter"
            style={{
              position: 'absolute',
              top: 18, right: 18,
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              zIndex: 500,
              transform: 'rotate(14deg)',
              transition: 'transform 0.15s',
              filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.22))',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'rotate(14deg) scale(1.08)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'rotate(14deg) scale(1)'}
          >
            <img
              src="/flowers/envelope.png"
              alt="Letter"
              style={{ width: 90, height: 'auto', display: 'block' }}
            />
          </button>
        )}
      </div>

      {!isShared && (
        <button
          onClick={copyLink}
          style={{
            marginTop: 20,
            background: copied ? '#4a7a4a' : '#2a2520',
            border: 'none',
            borderRadius: 8,
            padding: '11px 48px',
            fontSize: 18, fontWeight: 700,
            color: '#fff',
            cursor: 'pointer',
            transition: 'background 0.25s',
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
            letterSpacing: 0.2,
          }}
        >
          {copied ? '✓ Link copied!' : 'Copy Link'}
        </button>
      )}
    </div>
  );
}
