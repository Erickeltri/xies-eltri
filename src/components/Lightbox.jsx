import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function Lightbox({ type = 'image', src, alt = '', children, className = '' }) {
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(true);
  const [iframeSrc, setIframeSrc] = useState(''); // State khusus untuk YouTube
  const videoRef = useRef(null);

  // Efek saat Lightbox Dibuka / Ditutup
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      
      if (type === 'video' && videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
      
      // Jika tipe YouTube: Pasang URL tanpa autoplay (video dalam keadaan jeda/pause)
      if (type === 'youtube') {
        setIframeSrc(src);
      }
    } else {
      document.body.style.overflow = '';
      
      // Saat ditutup: Kosongkan SRC YouTube seketika agar video PAUSE / MATI TOTAL
      setIframeSrc('');
      
      if (type === 'video' && videoRef.current) {
        videoRef.current.pause();
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open, type, src]);

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

  const handleContextMenu = (e) => e.preventDefault();
  const handleDragStart = (e) => e.preventDefault();

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
        {/* Render Gambar */}
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

        {/* Render Video MP4 Lokal */}
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

        {/* Render YouTube Embed (Dipause saat buka, mati seketika saat tutup) */}
        {open && type === 'youtube' && iframeSrc && (
          <div className="youtube-fullscreen-wrapper">
            <iframe
              src={iframeSrc}
              title={alt || 'YouTube Video'}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div 
        className={className} 
        style={{ cursor: 'pointer' }} 
        onClick={() => setOpen(true)}
      >
        {children}
      </div>
      {createPortal(overlay, document.body)}
    </>
  );
}