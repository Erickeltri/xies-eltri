import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Lightbox reusable.
 * Sudah dilengkapi proteksi anti klik kanan (Save image as) & anti-drag.
 */
export default function Lightbox({ type = 'image', src, alt = '', children, className = '' }) {
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      if (type === 'video' && videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open, type]);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const toggleVideoPlay = (e) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  };

  // Handler Anti Klik Kanan
  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  // Handler Anti Drag / Tarik Gambar
  const handleDragStart = (e) => {
    e.preventDefault();
  };

  const overlay = (
    <div
      className={`fullscreen-overlay${open ? ' is-open' : ''}`}
      onClick={() => setOpen(false)}
      onContextMenu={handleContextMenu}
    >
      <button
        className="fullscreen-close"
        aria-label="Tutup"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(false);
        }}
      >
        &times;
      </button>

      <div className="fullscreen-content" onClick={(e) => e.stopPropagation()}>
        {open && type === 'image' && (
          <img 
            src={src} 
            alt={alt} 
            onContextMenu={handleContextMenu}
            onDragStart={handleDragStart}
            style={{ 
              pointerEvents: 'none', 
              userSelect: 'none', 
              WebkitUserSelect: 'none' 
            }}
          />
        )}
        {open && type === 'video' && (
          <>
            <video
              ref={videoRef}
              src={src}
              loop
              muted={muted}
              playsInline
              controlsList="nodownload"
              onContextMenu={handleContextMenu}
              onClick={toggleVideoPlay}
              style={{ userSelect: 'none' }}
            />
            <button
              className="fullscreen-mute"
              aria-label={muted ? 'Nyalakan suara' : 'Matikan suara'}
              onClick={(e) => {
                e.stopPropagation();
                setMuted((m) => !m);
              }}
            >
              {muted ? '\u{1F508}' : '\u{1F50A}'}
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div 
        className={className} 
        style={{ cursor: 'zoom-in' }} 
        onClick={() => setOpen(true)}
      >
        {children}
      </div>
      {createPortal(overlay, document.body)}
    </>
  );
}