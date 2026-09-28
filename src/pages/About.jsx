import Lightbox from '../components/Lightbox';

const galleryItems = [
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
  }
];

export default function About() {
  const handleContextMenu = (e) => e.preventDefault();
  const handleDragStart = (e) => e.preventDefault();

  return (
    <main className="gallery-main" onContextMenu={handleContextMenu}>
      <h1 className="gallery-title page-anim" style={{ animationDelay: '0.05s' }}>
        Gallery
      </h1>

      <div className="gallery-grid">
        {galleryItems.map((item, idx) => (
          <div className="gallery-item" key={idx}>
            <Lightbox type={item.type} src={item.src} alt={item.caption} className="media-wrap">
              {item.type === 'image' ? (
                <div className="img-box">
                  <img 
                    src={item.src} 
                    alt={item.caption}
                    loading="lazy"
                    onContextMenu={handleContextMenu}
                    onDragStart={handleDragStart}
                    style={{ pointerEvents: 'none' }}
                  />
                </div>
              ) : (
                <video 
                  src={item.src} 
                  autoPlay 
                  muted 
                  loop 
                  playsInline 
                  controlsList="nodownload"
                  onContextMenu={handleContextMenu}
                />
              )}
            </Lightbox>

            <div className="gallery-info">
              <div className="gallery-caption">{item.caption}</div>
              {item.date && <div className="gallery-date">{item.date}</div>}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}