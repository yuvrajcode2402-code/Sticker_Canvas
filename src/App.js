import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Text } from 'react-konva';

const STICKERS = ['🔥', '⭐', '🎉'];
const GRID = 40; // snap grid size in px

function getSize() {
  const w = Math.min(window.innerWidth - 40, 600);
  return { width: w, height: Math.round(w * 0.66) };
}

function snapToGrid(value) {
  return Math.round(value / GRID) * GRID;
}

function App() {
  const [stickers, setStickers] = useState([]);
  const stageRef = useRef(null);
  const [size, setSize] = useState(getSize);

  useEffect(() => {
    function updateSize() { setSize(getSize()); }
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  function addSticker(emoji) {
    setStickers(prev => [...prev, {
      id: Date.now(),
      emoji,
      x: snapToGrid(Math.random() * (size.width - 80)),
      y: snapToGrid(Math.random() * (size.height - 80)),
    }]);
  }

  function handleDragEnd(id, e) {
    const x = snapToGrid(e.target.x());
    const y = snapToGrid(e.target.y());
    setStickers(prev => prev.map(s => s.id === id ? { ...s, x, y } : s));
  }

  function deleteSticker(id) {
    setStickers(prev => prev.filter(s => s.id !== id));
  }

  function downloadCanvas() {
    const uri = stageRef.current.toDataURL();
    const link = document.createElement('a');
    link.download = 'sticker-canvas.png';
    link.href = uri;
    link.click();
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2 style={{ marginTop: 0 }}>🎨 Sticker Canvas</h2>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        {STICKERS.map(emoji => (
          <button
            key={emoji}
            onClick={() => addSticker(emoji)}
            title={`Add ${emoji}`}
            style={{ fontSize: '28px', cursor: 'pointer', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '8px', padding: '4px 10px' }}
          >
            {emoji}
          </button>
        ))}
        <button
          onClick={downloadCanvas}
          style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '15px', background: '#222', color: '#fff', border: 'none', borderRadius: '8px' }}
        >
          ⬇️ Download
        </button>
        <span style={{ fontSize: '13px', color: '#888', marginLeft: 'auto' }}>
          Double-tap a sticker to delete · Snaps to {GRID}px grid
        </span>
      </div>

      {/* Canvas */}
      <Stage
        ref={stageRef}
        width={size.width}
        height={size.height}
        style={{ border: '2px solid #333', borderRadius: '8px', background: '#fff', display: 'block' }}
      >
        <Layer>
          {stickers.map(s => (
            <Text
              key={s.id}
              text={s.emoji}
              x={s.x}
              y={s.y}
              fontSize={40}
              draggable
              onDragEnd={e => handleDragEnd(s.id, e)}
              onDblClick={() => deleteSticker(s.id)}
              onDblTap={() => deleteSticker(s.id)}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}

export default App;
