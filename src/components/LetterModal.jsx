import { useState } from 'react';

export default function LetterModal({ letter, readOnly, onSave, onClose }) {
  const [to,   setTo]   = useState(letter?.to   || '');
  const [body, setBody] = useState(letter?.body || '');
  const [from, setFrom] = useState(letter?.from || '');

  const handleDone = () => {
    if (!readOnly) onSave({ to, body, from });
    else onClose();
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 20,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Envelope + card wrapper */}
      <div style={{ position: 'relative', width: 460, height: 360 }}>

        {/* Envelope — behind, bottom-left */}
        <img
          src="/flowers/envelope.png"
          alt=""
          draggable={false}
          style={{
            position: 'absolute',
            bottom: 0, left: 0,
            width: 280,
            height: 'auto',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />

        {/* Letter card */}
        <div style={{
          position: 'absolute',
          top: 0, right: 0,
          width: 250,
          height: 285,
          background: '#faf7f0',
          border: '1.5px solid #c8c0b0',
          borderRadius: 4,
          padding: '22px 24px 18px',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '3px 6px 22px rgba(0,0,0,0.14)',
        }}>

          {/* Dear [name], */}
          <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: 14, flexWrap: 'wrap', gap: 4 }}>
            <span style={{ fontSize: 25, fontWeight: 700, color: '#2e2a25' }}>Dear</span>
            {readOnly ? (
              <span style={{ fontSize: 25, fontWeight: 700, color: '#2e2a25', marginLeft: 6 }}>
                {to || ''},
              </span>
            ) : (
              <>
                <input
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="Name"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: 25,
                    fontWeight: 700,
                    color: '#2e2a25',
                    width: 100,
                    padding: '0 4px',
                    marginLeft: 3,
                  }}
                />
                <span style={{ fontSize: 25, fontWeight: 700, color: '#2e2a25' }}>,</span>
              </>
            )}
          </div>

          {/* Body */}
          {readOnly ? (
            <p style={{
              flex: 0.7,
              fontSize: 22,
              fontWeight: 700,
              color: '#3a2e22',
              lineHeight: 1,
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
            }}>
              {body || <em style={{ color: '#aaa' }}>No message written.</em>}
            </p>
          ) : (
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message here…"
              autoFocus
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontSize: 22,
                fontWeight: 700,
                color: '#3a2e22',
                lineHeight: 1,
              }}
            />
          )}

          {/* yours, [name] */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginTop: 12, gap: 4 }}>
            <span style={{ fontSize: 25, fontWeight: 700, color: '#2e2a25', fontStyle: 'italic' }}>yours,</span>
            {readOnly ? (
              <span style={{ fontSize: 25, fontWeight: 700, color: '#5a4a38' }}>{from || ''}</span>
            ) : (
              <input
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="Your name"
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: 25,
                  fontWeight: 700,
                  color: '#2e2a25',
                  width: 140,
                  textAlign: 'right',
                  padding: '0 4px',
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Done / Close button */}
      <button
        onClick={handleDone}
        style={{
          marginTop: 20,
          background: '#2a2520',
          border: 'none',
          borderRadius: 6,
          padding: '10px 52px',
          fontSize: 22,
          fontWeight: 700,
          color: '#fff',
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
        }}
      >
        {readOnly ? 'Close' : 'Done'}
      </button>
    </div>
  );
}
