import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Text } from 'react-konva';

const STICKERS = ['🔥', '⭐', '🎉'];

function App() {
  const [stickers, setStickers] = useState([]);
  const stageRef = useRef(null);
  const [size, setSize] = useState({ width: 600, height: 400 });

  useEffect(() => {
    function updateSize() {
      const w = Math.min(window.innerWidth - 40, 600);
      setSize({ width: w, height: Math.round(w * 0.66) });
    }
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  function addSticker(emoji) {
    setStickers([...stickers, {
      id: Date.now(),
      emoji: emoji,
      x: Math.random() * (size.width - 60),
      y: Math.random() * (size.height - 60),
    }]);
  }

  function handleDragEnd(id, e) {
    setStickers(stickers.map((s) =>
      s.id === id ? { ...s, x: e.target.x(), y: e.target.y() } : s
    ));
  }

  function downloadCanvas() {
    const uri = stageRef.current.toDataURL();
    const link = document.createElement('a');
    link.download = 'sticker-canvas.png';
    link.href = uri;
    link.click();
  }

  return (
    <div style={{ padding: '20px' }}>

      {/* Sticker Buttons Row */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {STICKERS.map((emoji) => (
          <button key={emoji} onClick={() => addSticker(emoji)}
            style={{ fontSize: '30px', cursor: 'pointer' }}>
            {emoji}
          </button>
        ))}
        <button onClick={downloadCanvas}
          style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '16px' }}>
          ⬇️ Download
        </button>
      </div>

      {/* Canvas */}
      <Stage ref={stageRef} width={size.width} height={size.height}
        style={{ border: '2px solid black' }}>
        <Layer>
          {stickers.map((s) => (
            <Text
              key={s.id}
              text={s.emoji}
              x={s.x}
              y={s.y}
              fontSize={40}
              draggable
              onDragEnd={(e) => handleDragEnd(s.id, e)}
              onDblClick={() => setStickers(stickers.filter((st) => st.id !== s.id))}
            />
          ))}
        </Layer>
      </Stage>

    </div>
  );
}

export default App;