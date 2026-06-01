import { useState, useRef } from 'react';
import { Stage, Layer, Text } from 'react-konva';

const STICKERS = ['🔥', '⭐', '🎉'];

function App() {
  const [stickers, setStickers] = useState([]);
  const stageRef = useRef(null);

  function addSticker(emoji) {
    setStickers([...stickers, {
      id: Date.now(),
      emoji: emoji,
      x: 100,
      y: 100,
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
    <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>

      {/* Left: Sticker Buttons + Download */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {STICKERS.map((emoji) => (
          <button key={emoji} onClick={() => addSticker(emoji)}
            style={{ fontSize: '30px', cursor: 'pointer' }}>
            {emoji}
          </button>
        ))}
        <button onClick={downloadCanvas}
          style={{ marginTop: '20px', padding: '8px', cursor: 'pointer' }}>
          ⬇️ Download
        </button>
      </div>

      {/* Right: Canvas */}
      <Stage ref={stageRef} width={600} height={400} style={{ border: '2px solid black' }}>
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