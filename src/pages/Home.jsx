import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Home({ userData }) {
  const preventMediaAction = (e) => e.preventDefault();

  // State untuk menangani form input
  const [nama, setNama] = useState('');
  const [pesan, setPesan] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  // Fungsi pengiriman pesan ke API Serverless
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      const response = await fetch('/api/pesan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama, pesan }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('Pesan berhasil terkirim!');
        setNama('');
        setPesan('');
      } else {
        setStatus(data.message || 'Gagal mengirim pesan.');
      }
    } catch (error) {
      setStatus('Terjadi kesalahan koneksi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main>
        <div className="domino page-anim" style={{ animationDelay: '0.05s' }}>
          <h1>{userData?.name || 'Eltri Putra Rombebua'}</h1>
          <p>
            {userData?.bio ||
              'Mempelajari Teknik Komputer dan teknologi untuk mengembangkan keterampilan di bidang komputer, perangkat keras, jaringan, dan teknologi informasi.'}
          </p>
        </div>
      </main>

      <section className="about-section">
        <div className="about-photos page-anim" style={{ animationDelay: '0.1s' }}>
          <div className="about-photo-back">
            <img
              src="/images/html.jpg"
              alt="html"
              onContextMenu={preventMediaAction}
              onDragStart={preventMediaAction}
            />
          </div>
          <div className="about-photo-front">
            <img
              src="/images/javascript.jpg"
              alt="js"
              onContextMenu={preventMediaAction}
              onDragStart={preventMediaAction}
            />
          </div>
        </div>

        <div className="about-text page-anim" style={{ animationDelay: '0.2s' }}>
          <h2>ELTRI PUTRA ROMBEBUA</h2>
          <p>
            Mempelajari Teknik Komputer dan Jaringan (TKJ) serta mengembangkan keterampilan di bidang Web Development, seperti HTML, CSS, dan JavaScript.
          </p>
          <p>
            Belajar TKJ dan Web Development untuk mengembangkan kemampuan di bidang komputer, jaringan, dan pembuatan website 💻
          </p>
        </div>
      </section>

      <footer className="site-footer">
  <div className="site-footer-inner">
    {/* Kolom 1: Alamat */}
    <div className="footer-col footer-brand">
      <p className="footer-address">
        Jl. XXXXXXXX II NO.30<br />
        Makassar, Sulawesi Selatan
      </p>
      <p className="footer-contact">eltriputrarb@email.com</p>
      <p className="footer-contact">(+62) 853-9740-0903</p>
    </div>

    {/* Kolom 2: Form Kirim Pesan */}
    <div className="footer-col footer-form-col">
      <form className="footer-form" onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Nama kamu lengkap" 
          className="footer-input"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          required 
        />
        <textarea 
          placeholder="Tulis pesanmu" 
          rows="4" 
          className="footer-textarea"
          value={pesan}
          onChange={(e) => setPesan(e.target.value)}
          required
        ></textarea>
        <button type="submit" className="footer-btn" disabled={loading}>
          {loading ? 'Mengirim...' : 'Kirim pesan'}
        </button>
        {status && (
          <p style={{ fontSize: '0.8rem', color: status.includes('berhasil') ? '#04ca5f' : '#ff3333', marginTop: '6px' }}>
            {status}
          </p>
        )}
      </form>
    </div>

    {/* Kolom 3: Menu Navigasi */}
    <div className="footer-col footer-menu-col">
      <h4>MENU</h4>
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
      <Link to="/profile">Profile</Link>
      <Link to="/alamat">Alamat</Link>
    </div>
  </div>
</footer>
    </>
  );
}