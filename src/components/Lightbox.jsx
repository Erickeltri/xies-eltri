import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Lightbox Component - Anti-lag optimized for iPhone & Android
 * Support type: 'image', 'video', 'youtube'
 * 
 * Performance optimizations:
 * - No backdrop-filter blur transition (GPU killer on mobile)
 * - Static overlay background instead of animated blur
 * - Memoized handlers with useCallback
 * - Conditional portal rendering (no DOM when closed)
 * - GPU-accelerated transforms only (no filter animations)
 * - Passive event listeners
 */
export default function Lightbox({
  type = 'image',
  src,
  videoId,
  alt = '',
  date = '',
  children,
  className = ''
}) {
  const [open, setOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [muted, setMuted] = useState(true);
  const [iframeSrc, setIframeSrc] = useState('');
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const videoRef = useRef(null);
  const closingTimerRef = useRef(null);

  const embedBaseUrl = import.meta.env.VITE_YOUTUBE_EMBED_BASE || 'https://www.youtube.com/embed';
  const finalSrc = type === 'youtube' && videoId ? `${embedBaseUrl}/${videoId}` : src;

  const handleClose = useCallback(() => {
    if (isClosing) return; // prevent double-close
    setIsClosing(true);
    closingTimerRef.current = setTimeout(() => {
      setOpen(false);
      setIsClosing(false);
      setMediaLoaded(false);
      setLoadError(false);
    }, 160);
  }, [isClosing]);

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      setMediaLoaded(false);
      setLoadError(false);

      if (type === 'video' && videoRef.current) {
        videoRef.current.play().catch(() => {});
      }

      if (type === 'youtube') {
        setIframeSrc(finalSrc);
        setMediaLoaded(true);
      }
    } else {
      document.body.style.overflow = '';
      setIframeSrc('');

      if (type === 'video' && videoRef.current) {
        videoRef.current.pause();
      }
    }
    return () => {
      document.body.style.overflow = '';
      if (closingTimerRef.current) {
        clearTimeout(closingTimerRef.current);
      }
    };
  }, [open, type, finalSrc]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, handleClose]);

  const handleMediaLoad = useCallback(() => { setMediaLoaded(true); setLoadError(false); }, []);
  const handleMediaError = useCallback(() => { setLoadError(true); setMediaLoaded(true); }, []);
  const handleRetry = useCallback((e) => { e.stopPropagation(); setLoadError(false); setMediaLoaded(false); }, []);
  const toggleVideoPlay = useCallback((e) => { e.stopPropagation(); const v = videoRef.current; if (v) v.paused ? v.play() : v.pause(); }, []);
  const handleContextMenu = useCallback((e) => e.preventDefault(), []);
  const handleDragStart = useCallback((e) => e.preventDefault(), []);
  const toggleMute = useCallback((e) => { e.stopPropagation(); setMuted((m) => !m); }, []);

  const handleKeyOpen = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(true); }
  }, []);

  // Only render portal when actually needed
  const shouldRenderOverlay = open || isClosing;

  const overlay = shouldRenderOverlay ? (
    <div
      className={`fullscreen-overlay ${open && !isClosing ? 'is-open' : ''} ${isClosing ? 'is-closing' : ''}`}
      onClick={handleClose}
      onContextMenu={handleContextMenu}
      role="dialog"
      aria-modal="true"
    >
      <button
        className="fullscreen-close"
        aria-label="Tutup Pratinjau"
        onClick={(e) => { e.stopPropagation(); handleClose(); }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <div className="fullscreen-content-wrapper" onClick={(e) => e.stopPropagation()}>
        <div className="fullscreen-content" style={{ opacity: mediaLoaded ? 1 : 0, transition: 'opacity 0.12s ease' }}>
          {type === 'image' && (
            <>
              <img
                src={finalSrc}
                alt={alt}
                className="lightbox-protected-img"
                onContextMenu={handleContextMenu}
                onDragStart={handleDragStart}
                onLoad={handleMediaLoad}
                onError={handleMediaError}
                style={{ display: loadError ? 'none' : 'block' }}
                decoding="async"
              />
              {loadError && (
                <div className="lightbox-error" onClick={handleRetry}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span>Gagal memuat gambar</span>
                  <button className="retry-btn" onClick={handleRetry}>Coba Lagi</button>
                </div>
              )}
            </>
          )}

          {type === 'video' && (
            <div className="fullscreen-video-container">
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
                onLoadedData={handleMediaLoad}
                onError={handleMediaError}
                style={{ display: loadError ? 'none' : 'block' }}
              />
              {loadError && (
                <div className="lightbox-error" onClick={handleRetry}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span>Gagal memuat video</span>
                  <button className="retry-btn" onClick={handleRetry}>Coba Lagi</button>
                </div>
              )}
              <button
                className="fullscreen-mute"
                aria-label={muted ? 'Nyalakan suara' : 'Matikan suara'}
                onClick={toggleMute}
              >
                {muted ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
                    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <line x1="23" y1="9" x2="17" y2="15"></line>
                    <line x1="17" y1="9" x2="23" y2="15"></line>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  </svg>
                )}
              </button>
            </div>
          )}

          {type === 'youtube' && iframeSrc && (
            <div className="youtube-fullscreen-wrapper">
              <iframe
                src={iframeSrc}
                title={alt || 'YouTube Video'}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={handleMediaLoad}
                loading="lazy"
              ></iframe>
            </div>
          )}
        </div>

        {(alt || date) && (
          <div className="lightbox-caption-bar">
            {alt && <span className="lightbox-caption-text">{alt}</span>}
            {date && <span className="lightbox-caption-date">{date}</span>}
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <div
        className={`lightbox-trigger ${className}`}
        onClick={handleOpen}
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyOpen}
      >
        {children}
      </div>
      {shouldRenderOverlay && createPortal(overlay, document.body)}
    </>
  );
}