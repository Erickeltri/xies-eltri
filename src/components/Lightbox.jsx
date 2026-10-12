import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Modern Cinematic Lightbox Component
 * Support type: 'image', 'video', 'youtube'
 */
export default function Lightbox({
  type = 'image',
  src,
  videoId,
  alt = '',
  date = '',
  children,
  className = '',
  loadTimeout = 43000
}) {
  const [open, setOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [muted, setMuted] = useState(true);
  const [iframeSrc, setIframeSrc] = useState('');
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const videoRef = useRef(null);
  const timeoutRef = useRef(null);
  const mediaLoadedRef = useRef(false);
  const minSpinnerTimeoutRef = useRef(null);

  // Gunakan VITE_YOUTUBE_EMBED_BASE dari env atau default
  const embedBaseUrl = import.meta.env.VITE_YOUTUBE_EMBED_BASE || 'https://www.youtube.com/embed';

  // Rakit URL embed YouTube jika type 'youtube'
  const finalSrc = type === 'youtube' && videoId
    ? `${embedBaseUrl}/${videoId}`
    : src;

  const handleClose = () => {
    setIsClosing(true);
    setMediaLoaded(false);
    setLoadError(false);
    setShowSpinner(false);
    mediaLoadedRef.current = false;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (minSpinnerTimeoutRef.current) clearTimeout(minSpinnerTimeoutRef.current);
    setTimeout(() => {
      setOpen(false);
      setIsClosing(false);
    }, 200);
  };

  // Handling Buka / Tutup Lightbox & Scroll Lock
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      setMediaLoaded(false);
      setLoadError(false);
      setShowSpinner(false);
      mediaLoadedRef.current = false;

      // Minimum spinner delay (800ms) so user sees loading state
      minSpinnerTimeoutRef.current = setTimeout(() => {
        setShowSpinner(true);
      }, 800);

      // Timeout fallback - force show content after loadTimeout
      timeoutRef.current = setTimeout(() => {
        if (!mediaLoadedRef.current) {
          mediaLoadedRef.current = true;
          setMediaLoaded(true);
        }
      }, loadTimeout);

      if (type === 'video' && videoRef.current) {
        videoRef.current.play().catch(() => {});
      }

      if (type === 'youtube') {
        setIframeSrc(finalSrc);
        setMediaLoaded(true);
        mediaLoadedRef.current = true;
      }
    } else {
      document.body.style.overflow = '';
      setIframeSrc('');
      setMediaLoaded(false);
      setLoadError(false);
      setShowSpinner(false);
      mediaLoadedRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (minSpinnerTimeoutRef.current) clearTimeout(minSpinnerTimeoutRef.current);

      if (type === 'video' && videoRef.current) {
        videoRef.current.pause();
      }
    }

    return () => {
      document.body.style.overflow = '';
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (minSpinnerTimeoutRef.current) clearTimeout(minSpinnerTimeoutRef.current);
    };
  }, [open, type, finalSrc, loadTimeout]);

  // Escape key handler
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape' && open) handleClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  const handleImageLoad = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (minSpinnerTimeoutRef.current) clearTimeout(minSpinnerTimeoutRef.current);
    mediaLoadedRef.current = true;
    setMediaLoaded(true);
    setLoadError(false);
  };

  const handleImageError = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (minSpinnerTimeoutRef.current) clearTimeout(minSpinnerTimeoutRef.current);
    mediaLoadedRef.current = true;
    setLoadError(true);
    setMediaLoaded(true);
  };

  const handleVideoLoad = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (minSpinnerTimeoutRef.current) clearTimeout(minSpinnerTimeoutRef.current);
    mediaLoadedRef.current = true;
    setMediaLoaded(true);
    setLoadError(false);
  };

  const handleVideoError = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (minSpinnerTimeoutRef.current) clearTimeout(minSpinnerTimeoutRef.current);
    mediaLoadedRef.current = true;
    setLoadError(true);
    setMediaLoaded(true);
  };

  const handleRetry = (e) => {
    e.stopPropagation();
    setLoadError(false);
    setMediaLoaded(false);
    setShowSpinner(false);
    mediaLoadedRef.current = false;
    if (type === 'image' || type === 'video') {
      minSpinnerTimeoutRef.current = setTimeout(() => {
        setShowSpinner(true);
      }, 800);
      timeoutRef.current = setTimeout(() => {
        mediaLoadedRef.current = true;
        setMediaLoaded(true);
      }, loadTimeout);
    }
  };

  const toggleVideoPlay = (e) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  };

  const handleContextMenu = (e) => e.preventDefault();
  const handleDragStart = (e) => e.preventDefault();

  const overlay = (open || isClosing) ? (
    <div
      className={`fullscreen-overlay ${open && !isClosing ? 'is-open' : ''} ${isClosing ? 'is-closing' : ''}`}
      onClick={handleClose}
      onContextMenu={handleContextMenu}
      role="dialog"
      aria-modal="true"
    >
      {/* Tombol Close Glassmorphic */}
      <button
        className="fullscreen-close"
        aria-label="Tutup Pratinjau"
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <div className="fullscreen-content-wrapper" onClick={(e) => e.stopPropagation()}>
        {showSpinner && !mediaLoaded && (
          <div className="lightbox-spinner" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 12 12"
                  to="360 12 12"
                  dur="0.9s"
                  repeatCount="indefinite"
                />
              </path>
            </svg>
          </div>
        )}
        <div className="fullscreen-content" style={{ opacity: mediaLoaded ? 1 : 0, transition: 'opacity 0.18s ease' }}>
          {/* Render Gambar */}
          {type === 'image' && (
            <>
              <img
                src={finalSrc}
                alt={alt}
                className="lightbox-protected-img"
                onContextMenu={handleContextMenu}
                onDragStart={handleDragStart}
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{ display: loadError ? 'none' : 'block' }}
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

          {/* Render Video MP4 */}
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
                onLoadedData={handleVideoLoad}
                onError={handleVideoError}
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
                onClick={(e) => {
                  e.stopPropagation();
                  setMuted((m) => !m);
                }}
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

          {/* Render YouTube Embed */}
          {type === 'youtube' && iframeSrc && (
            <div className="youtube-fullscreen-wrapper">
              <iframe
                src={iframeSrc}
                title={alt || 'YouTube Video'}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => {
                  mediaLoadedRef.current = true;
                  setMediaLoaded(true);
                }}
              ></iframe>
            </div>
          )}
        </div>

        {/* Caption Bar Melayang Halus di Bawah Media */}
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
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        {children}
      </div>
      {createPortal(overlay, document.body)}
    </>
  );
}