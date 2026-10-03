import React, { useState, useEffect } from 'react';
import Lightbox from '../components/Lightbox';

const customizeItems = [
  { 
    type: 'image', 
    src: '/images/foto1.jpg', 
    caption: 'Kota makassar',
    date: '10 Mei 2026' 
  },
  { 
    type: 'image', 
    src: '/images/foto2.jpg', 
    caption: 'itu saya kecil lama',
    date: '20 Maret 2007' 
  },
  { 
    type: 'image', 
    src: '/images/sad.jpg', 
    caption: 'bantu aku',
    date: '28 Desember 1999' 
  },
  { 
    type: 'image', 
    src: '/images/foto3.jpg',
    caption: 'itu kamar tidur saya',
    date: '27 September 2026'
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
    }, 3500); // 1.5 detik durasi skeleton loader

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
              Array.from({ length: 4 }).map((_, idx) => (
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
                <div className="customize-card" key={idx}>
                  <Lightbox type={item.type} src={item.src} alt={item.caption}>
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