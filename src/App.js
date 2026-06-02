import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Text, Rect, Image as KonvaImage } from 'react-konva';

const STICKERS = ['🔥', '⭐', '🎉'];
const GRID = 40; // snap grid size in px

function getSize() {
  const w = Math.min(window.innerWidth - 20, 600);
  return { width: w, height: Math.round(w * 0.66) };
}

function snapToGrid(value) {
  return Math.round(value / GRID) * GRID;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

function snapToGridWithEdgeLock(value, max) {
  const snapped = Math.round(value / GRID) * GRID;
  if (max - value < GRID / 2) return max;
  return clamp(snapped, 0, max);
}

function getEmojiBox(scale = 1) {
  const fontSize = 40 * scale;
  return {
    width: fontSize * 0.72,
    height: fontSize * 0.82,
  };
}

function App() {
  const [stickers, setStickers] = useState([]);
  const stageRef = useRef(null);
  const [size, setSize] = useState(getSize);

  const [selectedStickerId, setSelectedStickerId] = useState(null);
  const [zoomValue, setZoomValue] = useState(100);

  const [bgColor, setBgColor] = useState('#ffffff');
  const [bgImage, setBgImage] = useState(null); // data URL
  const [bgImageObj, setBgImageObj] = useState(null);

  useEffect(() => {
    function updateSize() {
      setSize(getSize());
    }
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    if (!bgImage) {
      setBgImageObj(null);
      return;
    }

    const img = new window.Image();
    img.src = bgImage;
    img.onload = () => setBgImageObj(img);
  }, [bgImage]);

  function addSticker(emoji) {
    setStickers((prev) => [
      ...prev,
      {
        id: Date.now(),
        emoji,
        x: snapToGrid(Math.random() * (size.width - 80)),
        y: snapToGrid(Math.random() * (size.height - 80)),
        scale: 1,
      },
    ]);
  }

  function handleDragEnd(id, e) {
    const sticker = stickers.find((s) => s.id === id);
    if (!sticker) return;

    const box = getEmojiBox(sticker.scale ?? 1);
    const maxX = Math.max(0, size.width - box.width);
    const maxY = Math.max(0, size.height - box.height);

    const x = snapToGridWithEdgeLock(e.target.x(), maxX);
    const y = snapToGridWithEdgeLock(e.target.y(), maxY);

    setStickers((prev) => prev.map((s) => (s.id === id ? { ...s, x, y } : s)));
  }

  function deleteSticker(id) {
    setStickers((prev) => prev.filter((s) => s.id !== id));
    if (selectedStickerId === id) {
      setSelectedStickerId(null);
      setZoomValue(100);
    }
  }

  function downloadCanvas() {
    const uri = stageRef.current.toDataURL();
    const link = document.createElement('a');
    link.download = 'sticker-canvas.png';
    link.href = uri;
    link.click();
  }

  function selectSticker(id) {
    setSelectedStickerId(id);
    const selected = stickers.find((s) => s.id === id);
    setZoomValue(Math.round((selected?.scale ?? 1) * 100));
  }

  function handleStagePointerDown(e) {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedStickerId(null);
    }
  }

  function handleZoomChange(e) {
    const nextZoom = Number(e.target.value);
    setZoomValue(nextZoom);

    if (!selectedStickerId) return;

    const nextScale = nextZoom / 100;

    setStickers((prev) =>
      prev.map((s) => {
        if (s.id !== selectedStickerId) return s;

        const box = getEmojiBox(nextScale);
        const maxX = Math.max(0, size.width - box.width);
        const maxY = Math.max(0, size.height - box.height);

        return {
          ...s,
          scale: nextScale,
          x: clamp(s.x, 0, maxX),
          y: clamp(s.y, 0, maxY),
        };
      })
    );
  }

  function handleBgUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setBgImage(reader.result);
    reader.readAsDataURL(file);
  }

  function clearBackgroundImage() {
    setBgImage(null);
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2 style={{ marginTop: 0 }}>🎨 Sticker Canvas</h2>

      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '16px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {STICKERS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => addSticker(emoji)}
            title={`Add ${emoji}`}
            style={{
              fontSize: '28px',
              cursor: 'pointer',
              background: '#f0f0f0',
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '4px 10px',
            }}
          >
            {emoji}
          </button>
        ))}

        <button
          onClick={downloadCanvas}
          style={{
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '15px',
            background: '#222',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
          }}
        >
          ⬇️ Download
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: '14px', color: '#333' }}>Zoom</label>
          <input
            type="range"
            min="50"
            max="300"
            step="10"
            value={zoomValue}
            onChange={handleZoomChange}
            disabled={!selectedStickerId}
            style={{ cursor: selectedStickerId ? 'pointer' : 'not-allowed' }}
          />
          <span style={{ width: 50, fontSize: '13px', color: '#555' }}>
            {zoomValue}%
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: '14px', color: '#333' }}>Background</label>
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            title="Canvas background color"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleBgUpload}
            style={{ fontSize: '12px' }}
            title="Upload background image"
          />
          <button
            onClick={clearBackgroundImage}
            style={{
              padding: '6px 10px',
              cursor: 'pointer',
              border: '1px solid #ccc',
              borderRadius: '6px',
              background: '#f7f7f7',
            }}
          >
            Remove BG Image
          </button>
        </div>

        <span style={{ fontSize: '13px', color: '#888', marginLeft: 'auto' }}>
          Click sticker to resize · Double-tap to delete · Snaps to {GRID}px grid
        </span>
      </div>

      <Stage
        ref={stageRef}
        width={size.width}
        height={size.height}
        style={{
          border: '2px solid #333',
          borderRadius: '8px',
          background: 'transparent',
          display: 'block',
        }}
        onMouseDown={handleStagePointerDown}
        onTouchStart={handleStagePointerDown}
      >
        <Layer>
          <Rect x={0} y={0} width={size.width} height={size.height} fill={bgColor} />
          {bgImageObj && (
            <KonvaImage
              image={bgImageObj}
              x={0}
              y={0}
              width={size.width}
              height={size.height}
              listening={false}
            />
          )}

          {stickers.map((s) => (
            <Text
              key={s.id}
              text={s.emoji}
              x={s.x}
              y={s.y}
              fontSize={40 * (s.scale ?? 1)}
              draggable
              dragBoundFunc={(pos) => {
                const box = getEmojiBox(s.scale ?? 1);
                const maxX = Math.max(0, size.width - box.width);
                const maxY = Math.max(0, size.height - box.height);

                return {
                  x: clamp(pos.x, 0, maxX),
                  y: clamp(pos.y, 0, maxY),
                };
              }}
              onDragEnd={(e) => handleDragEnd(s.id, e)}
              onClick={() => selectSticker(s.id)}
              onTap={() => selectSticker(s.id)}
              onDblClick={() => deleteSticker(s.id)}
              onDblTap={() => deleteSticker(s.id)}
              shadowColor={s.id === selectedStickerId ? '#3b82f6' : undefined}
              shadowBlur={s.id === selectedStickerId ? 10 : 0}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}

export default App;
