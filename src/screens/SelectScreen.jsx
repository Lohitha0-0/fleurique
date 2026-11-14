import { useState } from 'react';
import { FLOWERS } from '../data/flowers.js';
import CursorTrail from '../components/CursorTrail.jsx';

export default function SelectScreen({ onNext }) {
  const [selected, setSelected] = useState(new Set());

  const toggle = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f2ede6',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '0 20px 40px',
    }}>
      <CursorTrail />

      {/* ── Hero: logo + title centred in viewport ── */}
      <div style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
      }}>
        <img
          src="/logo.png"
          alt="Fleurique logo"
          draggable={false}
          style={{ width: 140, marginBottom: 12 }}
        />
        <h1 style={{
          fontSize: 72,
          fontWeight: 700,
          color: '#2e2a25',
          letterSpacing: 2,
          textAlign: 'center',
          lineHeight: 1.1,
          margin: 0,
        }}>
          Fleurique
        </h1>
        <p style={{
          marginTop: 14,
          fontSize: 14,
          fontWeight: 700,
          color: '#b0a898',
          letterSpacing: 4,
          textTransform: 'uppercase',
        }}>
          scroll to build a bouquet as unique as your story ↓
        </p>
      </div>

      {/* ── Flower grid ── */}
      <h2 style={{
        fontSize: 20,
        fontWeight: 700,
        color: '#7a7068',
        marginBottom: 24,
        letterSpacing: 3,
        textTransform: 'uppercase',
        textAlign: 'center',
      }}>
        Pick your flowers
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 12,
        maxWidth: 600,
        width: '100%',
        marginBottom: 36,
      }}>
        {FLOWERS.map(flower => {
          const isOn = selected.has(flower.id);
          return (
            <button
              key={flower.id}
              onClick={() => toggle(flower.id)}
              style={{
                border: isOn ? '2px solid #555' : '1.5px solid #ddd',
                borderRadius: 12,
                padding: '12px 8px 10px',
                background: isOn ? '#f5f3f0' : '#fff',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                transition: 'border-color 0.12s, background 0.12s',
                outline: 'none',
              }}
            >
              <div style={{ width: 72, height: 72, isolation: 'isolate', background: isOn ? '#f5f3f0' : '#fff', borderRadius: 4 }}>
                <img
                  src={flower.src}
                  alt={flower.name}
                  draggable={false}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }}
                />
              </div>
              <span style={{ fontSize: 13, color: '#555', textAlign: 'center' }}>
                {flower.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Next button */}
      <button
        onClick={() => selected.size > 0 && onNext([...selected])}
        disabled={selected.size === 0}
        style={{
          background: selected.size > 0 ? '#cdc8c0' : '#ebe8e4',
          border: 'none',
          borderRadius: 6,
          padding: '10px 52px',
          fontSize: 22,
          fontWeight: 700,
          color: selected.size > 0 ? '#2e2a25' : '#aaa',
          cursor: selected.size > 0 ? 'pointer' : 'not-allowed',
          transition: 'background 0.12s',
        }}
      >
        Next
      </button>
    </div>
  );
}
