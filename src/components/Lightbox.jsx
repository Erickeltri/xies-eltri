import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Lightbox Component
 * Support type: 'image', 'video', 'youtube'
 */
export default function Lightbox({ 
  type = 'image', 
  src, 
  videoId, 
  alt = '', 
  children, 
  className = '' 
}) {
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(true);
  const [iframeSrc, setIframeSrc] = useState('');
  const videoRef = useRef(null);

  // Gunakan VITE_YOUTUBE_EMBED_BASE dari env atau default
  const embedBaseUrl = import.meta.env.VITE_YOUTUBE_EMBED_BASE || 'https://www.youtube.com/embed';
  
  // Rakit URL embed YouTube dari videoId jika kodenya memakai prop videoId
  const finalSrc = type === 'youtube' && videoId 
    ? `${embedBaseUrl}/${videoId}` 
    : src;

  // Handling Buka / Tutup Lightbox
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      
      if (type === 'video' && videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
      
      if (type === 'youtube') {
        setIframeSrc(finalSrc);
      }
    } else {
      document.body.style.overflow = '';
      setIframeSrc(''); // Hapus iframe src agar playback terhenti instan
      
      if (type === 'video' && videoRef.current) {
        videoRef.current.pause();
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open, type, finalSrc]);

  // Escape key handler
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
            src={finalSrc} 
            alt={alt} 
            className="lightbox-protected-img"
            onContextMenu={handleContextMenu}
            onDragStart={handleDragStart}
          />
        )}

        {/* Render Video MP4 Lokal */}
        {open && type === 'video' && (
          <>
            <video
              ref={videoRef}
              src={finalSrc}
              loop
              muted={muted}
              playsInline
              controlsList="nodownload"
              className="lightbox-video-player"
              onContextMenu={handleContextMenu}
              onClick={toggleVideoPlay}
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

        {/* Render YouTube Embed */}
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
        className={`lightbox-trigger ${className}`}
        onClick={() => setOpen(true)}
      >
        {children}
      </div>
      {createPortal(overlay, document.body)}
    </>
  );
}