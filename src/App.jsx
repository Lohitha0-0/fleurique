import { useState, useEffect } from 'react';
import { initFlowers } from './data/flowers.js';
import SelectScreen  from './screens/SelectScreen.jsx';
import ArrangeScreen from './screens/ArrangeScreen.jsx';
import DoneScreen    from './screens/DoneScreen.jsx';
import ShareScreen   from './screens/ShareScreen.jsx';
import LetterModal   from './components/LetterModal.jsx';

export default function App() {
  // 'select' | 'arrange' | 'done' | 'share'
  const [view,        setView]       = useState('select');
  const [selectedIds, setSelectedIds] = useState([]);
  const [placed,      setPlaced]     = useState([]);
  const [letter,      setLetter]     = useState({ to: '', body: '', from: '' });
  const [showLetter,  setShowLetter] = useState(false);
  const [letterRO,    setLetterRO]   = useState(false);   // read-only?
  const [isShared,    setIsShared]   = useState(false);

  // Decode share link on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const raw    = params.get('share');
    if (!raw) return;
    try {
      const data = JSON.parse(decodeURIComponent(escape(atob(raw))));
      setPlaced(data.placed || []);
      // support both old string format and new object format
      const l = data.letter;
      setLetter(typeof l === 'string' ? { to: '', body: l, from: '' } : (l || { to: '', body: '', from: '' }));
      setView('share');
      setIsShared(true);
    } catch { /* invalid share link — just start normally */ }
  }, []);

  const openLetter = (readOnly) => {
    setLetterRO(readOnly);
    setShowLetter(true);
  };

  const saveLetter = (text) => {
    setLetter(text);
    setShowLetter(false);
    setView('share');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      {view === 'select' && (
        <SelectScreen
          onNext={(ids) => {
            setSelectedIds(ids);
            setPlaced(initFlowers(ids));
            setView('arrange');
          }}
        />
      )}

      {view === 'arrange' && (
        <ArrangeScreen
          selectedIds={selectedIds}
          placed={placed}
          setPlaced={setPlaced}
          onDone={() => setView('done')}
        />
      )}

      {view === 'done' && (
        <DoneScreen
          placed={placed}
          onWriteLetter={() => openLetter(false)}
        />
      )}

      {view === 'share' && (
        <ShareScreen
          placed={placed}
          letter={letter}
          isShared={isShared}
          onOpenLetter={() => openLetter(true)}
        />
      )}

      {showLetter && (
        <LetterModal
          letter={letter}
          readOnly={letterRO}
          onSave={saveLetter}
          onClose={() => setShowLetter(false)}
        />
      )}
    </div>
  );
}
