import React, { useState, useEffect } from 'react';
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
    type: "image",
    src: "/images/foto4.jpg",
    caption: "tadi foto kamera 🥀😅",
    date: "10/11 Oktober 2026"
  },
];

export default function Customize() {
  const [loading, setLoading] = useState(true);

  const handleContextMenu = (e) => e.preventDefault();
  const handleDragStart = (e) => e.preventDefault();

  // Simulasi jaringan / delay loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // Durasi skeleton loader yang responsif & wajar

    return () => clearTimeout(timer);
  }, []);

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
          {loading
            ? /* TAMPILKAN 4 SKELETON CARD SAAT LOADING */
            Array.from({ length: 5 }).map((_, idx) => (
              <div className="customize-card skeleton-card" key={idx}>
                <div className="media-container skeleton" />
                <div className="card-body">
                  <div className="card-meta">
                    <div className="skeleton skeleton-text short" />
                    <div className="skeleton skeleton-text short" />
                  </div>
                  <div className="skeleton skeleton-text title" />
                </div>
              </div>
            ))
            : /* TAMPILKAN KARTU ASLI SETELAH LOADING SELESAI */
            customizeItems.map((item, idx) => (
              <div 
                className="customize-card" 
                key={idx}
                style={{ animationDelay: `${idx * 0.08}s` }}
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
                        onContextMenu={handleContextMenu}
                        onDragStart={handleDragStart}
                        className="card-img"
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