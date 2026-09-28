import React from 'react';
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
  const handleContextMenu = (e) => e.preventDefault();
  const handleDragStart = (e) => e.preventDefault();

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
          {customizeItems.map((item, idx) => (
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
                  {/* Tag Otomatis PHOTO atau VIDEO */}
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