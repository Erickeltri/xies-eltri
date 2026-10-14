import React, { useState, useEffect, useCallback } from 'react';
import Lightbox from '../components/Lightbox';

const customizeItems = [
  {
    type: 'image',
    src: '/images/foto1.jpg',
    caption: 'Kota makassar',
    date: '10/05 Mei 2026'
  },
  {
    type: 'image',
    src: '/images/foto2.jpg',
    caption: 'itu saya kecil lama',
    date: '20/?? Maret 2007'
  },
  {
    type: 'image',
    src: '/images/sad.jpg',
    caption: 'bantu aku',
    date: '28/?? Desember 1999'
  },
  {
    type: 'image',
    src: '/images/foto3.jpg',
    caption: 'itu kamar tidur saya',
    date: '27/09 September 2026'
  },
  {
    type: "video",
    src: "/video/yonatanpapa.mp4",
    caption: "jadi pengendali api",
    date: "13/10 Oktober 2026"
  },
];

/**
 * About / Gallery Page - Anti-lag skeleton loader
 * 
 * Skeleton pakai setTimeout 300ms (cukup untuk render skeleton terlihat, 
 * tapi tidak lama sampai lag)
 */
export default function Customize() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Anti-lag: delay 150ms — cukup skeleton terlihat, tidak lama sampai lag
    const timer = setTimeout(() => setLoaded(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleContextMenu = useCallback((e) => e.preventDefault(), []);
  const handleDragStart = useCallback((e) => e.preventDefault(), []);

  return (
    <div className="customize-page-wrapper">
      {/* BANNER HERO ATAS */}
      <div className="customize-hero">
        <div className="hero-content">
          <h1 className="hero-title">Gallery</h1>
          <div className="breadcrumb-pill">
            <span className="active">Saya</span>
          </div>
        </div>
      </div>

      {/* GRID KONTEN */}
      <div className="customize-container">
        <div className="customize-grid">
          {!loaded
            ? Array.from({ length: 5 }).map((_, idx) => (
              <div className="skeleton-card" key={`sk-${idx}`}>
                <div className="skeleton-media" />
                <div className="skeleton-body">
                  <div className="skeleton-text short" />
                  <div className="skeleton-text short" />
                  <div className="skeleton-text title" />
                </div>
              </div>
            ))
            : customizeItems.map((item, idx) => (
              <div
                className="customize-card"
                key={idx}
              >
                <Lightbox
                  type={item.type}
                  src={item.src}
                  alt={item.caption}
                  date={item.date}
                >
                  <div className="media-container">
                    {item.type === 'image' ? (
                      <img
                        src={item.src}
                        alt={item.caption}
                        loading="lazy"
                        decoding="async"
                        onContextMenu={handleContextMenu}
                        onDragStart={handleDragStart}
                        className="card-img"
                        width="400"
                        height="300"
                      />
                    ) : (
                      <video
                        src={item.src}
                        autoPlay
                        muted
                        loop
                        playsInline
                        controlsList="nodownload"
                        onContextMenu={handleContextMenu}
                        className="card-video"
                      />
                    )}
                    <div className="card-zoom-indicator">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        <line x1="11" y1="8" x2="11" y2="14"></line>
                        <line x1="8" y1="11" x2="14" y2="11"></line>
                      </svg>
                    </div>
                  </div>
                </Lightbox>

                <div className="card-body">
                  <div className="card-meta">
                    <span className="card-tag">
                      {item.type === 'image' ? 'PHOTO' : 'VIDEO'}
                    </span>
                    {item.date && <span className="card-date">{item.date}</span>}
                  </div>
                  <h3 className="card-title">{item.caption}</h3>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}