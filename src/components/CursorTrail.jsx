import { useEffect, useRef } from 'react';
import { FLOWERS } from '../data/flowers.js';

const SRCS = FLOWERS.map(f => f.src);

export default function CursorTrail() {
  const containerRef = useRef(null);
  const lastPos      = useRef({ x: -999, y: -999 });
  const indexRef     = useRef(0);

  useEffect(() => {
    const container = containerRef.current;

    const onMove = (e) => {
      const dx   = e.clientX - lastPos.current.x;
      const dy   = e.clientY - lastPos.current.y;
      if (Math.sqrt(dx * dx + dy * dy) < 48) return; // throttle by distance
      lastPos.current = { x: e.clientX, y: e.clientY };

      const src  = SRCS[indexRef.current % SRCS.length];
      indexRef.current++;

      const size = 100 + Math.random() * 60;          // 100–160 px
      const rot  = Math.random() * 360;

      const el   = document.createElement('img');
      el.src     = src;
      Object.assign(el.style, {
        position:      'fixed',
        pointerEvents: 'none',
        left:          `${e.clientX - size / 2}px`,
        top:           `${e.clientY - size / 2}px`,
        width:         `${size}px`,
        height:        `${size}px`,
        objectFit:     'contain',
        zIndex:        '9998',
        opacity:       '1',
        transform:     `rotate(${rot}deg) scale(1)`,
        transition:    'opacity 0.7s ease, transform 0.7s ease',
        mixBlendMode:  'multiply',
      });

      container.appendChild(el);

      // kick off fade + float after next paint
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.style.opacity   = '0';
        el.style.transform = `rotate(${rot + 30}deg) translateY(-28px) scale(0.4)`;
      }));

      setTimeout(() => {
        if (container.contains(el)) container.removeChild(el);
      }, 750);
    };

    document.addEventListener('mousemove', onMove);
    return () => document.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9998 }}
    />
  );
}
