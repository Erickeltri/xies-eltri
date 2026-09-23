import Lightbox from '../components/Lightbox';

export default function Alamat() {
  return (
    <main className="alamat-main">
      <Lightbox
        type="image"
        src="/images/comingsoon.jpg"
        alt="Foto ELTRI"
        className="alamat-photo page-anim"
      >
        <img src="/images/comingsoon.jpg" alt="Foto ELTRI" />
      </Lightbox>

      <div className="alamat-info page-anim" style={{ animationDelay: '0.15s' }}>
        <h1 className="alamat-name">ELTRI PUTRA ROMBEBUA</h1>

        <p className="alamat-desc">
          Comingsoon
        </p>

        <a
          href="https://maps.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="alamat-location"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 21s-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-7 11-7 11Z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
          Lokasi Lihat
        </a>
      </div>
    </main>
  );
}