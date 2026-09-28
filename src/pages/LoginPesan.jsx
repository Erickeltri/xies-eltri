import React, { useState, useEffect } from 'react';

export default function LoginPesan() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pesanList, setPesanList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-fetch saat komponen terpasang dan status login aktif
  useEffect(() => {
    if (isLoggedIn) {
      fetchPesan();
    }
  }, [isLoggedIn]);

  const fetchPesan = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/getpesan');
      const result = await res.json();
      if (res.ok && result.success) {
        setPesanList(result.data);
      } else {
        setErrorMsg('Gagal mengambil history pesan.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Kesalahan jaringan saat memuat pesan.');
    } finally {
      setLoading(false);
    }
  };

  // --- FUNGSI HAPUS PESAN ---
  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus pesan ini?')) return;

    try {
      const res = await fetch(`/api/deletepesan?id=${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-secret': 'SangatRahasia123',
        },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Update tampilan state secara real-time
        setPesanList((prevList) => prevList.filter((item) => item._id !== id));
      } else {
        alert(data.message || 'Gagal menghapus pesan.');
      }
    } catch (err) {
      console.error('Error saat hapus pesan:', err);
      alert(`Terjadi kesalahan: ${err.message}`);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/loginpesan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsLoggedIn(true);
      } else {
        setErrorMsg(data.message || 'Username atau password salah.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Terjadi kesalahan koneksi.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    setPesanList([]);
  };

  if (isLoggedIn) {
    return (
      <div style={styles.pageBackground}>
        <div style={styles.dashboardCard}>
          <div style={styles.header}>
            <h2 style={styles.dashboardTitle}>History Pesan Masuk</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={fetchPesan} style={styles.refreshBtn} disabled={loading}>
                {loading ? 'Refreshing...' : '🔄 Refresh'}
              </button>
              <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
            </div>
          </div>

          {errorMsg && <p style={styles.error}>{errorMsg}</p>}

          {loading && pesanList.length === 0 ? (
            <p style={{ color: '#ccc', textAlign: 'center' }}>Memuat pesan...</p>
          ) : pesanList.length === 0 ? (
            <p style={{ color: '#aaa', textAlign: 'center' }}>Belum ada pesan yang masuk.</p>
          ) : (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>No</th>
                    <th style={styles.th}>Tanggal</th>
                    <th style={styles.th}>Nama</th>
                    <th style={styles.th}>Pesan</th>
                    <th style={{ ...styles.th, textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pesanList.map((item, index) => (
                    <tr key={item._id || index}>
                      <td style={styles.td}>{index + 1}</td>
                      <td style={styles.td}>
                        {item.createdAt ? new Date(item.createdAt).toLocaleString('id-ID') : '-'}
                      </td>
                      <td style={styles.td}><strong>{item.nama}</strong></td>
                      <td style={styles.td}>{item.pesan}</td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        <button
                          onClick={() => handleDelete(item._id)}
                          style={styles.deleteBtn}
                          title="Hapus Pesan"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageBackground}>
      <form onSubmit={handleLogin} style={styles.card}>
        <h2 style={styles.title}>Login Admin Pesan</h2>

        {errorMsg && <p style={styles.error}>{errorMsg}</p>}

        <div style={styles.inputGroup}>
          <label style={styles.label}>Username</label>
          <input
            type="text"
            placeholder="Masukkan username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <input
            type="password"
            placeholder="Masukkan password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
        </div>

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Memproses...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

// Style yang sudah dioptimalkan untuk Desktop & Mobile (iOS / Android)
const styles = {
  pageBackground: {
    backgroundColor: '#121212',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px 12px', // Padding lebih kecil di mobile agar area konten lebih luas
    boxSizing: 'border-box',
    WebkitFontSmoothing: 'antialiased', // Render teks lebih halus di iPhone/Safari
  },
  card: {
    background: '#1e1e1e',
    border: '1px solid #333',
    padding: '24px 20px', // Padding menyesuaikan layar HP
    borderRadius: '12px', // Corner lebih smooth modern
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
    boxSizing: 'border-box',
  },
  dashboardCard: {
    background: '#1e1e1e',
    border: '1px solid #333',
    padding: '24px 16px', // Fleksibel untuk mobile & desktop
    borderRadius: '12px',
    width: '100%',
    maxWidth: '1000px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap', // Agar header otomatis turun rapi jika di layar HP yang sangat sempit
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
  },
  title: { 
    color: '#ffffff', 
    textAlign: 'center', 
    marginBottom: '8px', 
    fontSize: '1.4rem',
    fontWeight: '600',
  },
  dashboardTitle: { 
    color: '#ffffff', 
    fontSize: '1.25rem',
    fontWeight: '600',
    margin: 0,
  },
  inputGroup: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '6px' 
  },
  label: { 
    color: '#cccccc', 
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  input: {
    padding: '12px 14px', // Touch-friendly untuk layar sentuh HP
    borderRadius: '6px',
    border: '1px solid #444',
    background: '#2a2a2a',
    color: '#ffffff',
    fontSize: '1rem', // Minimal 16px agar Safari/iPhone tidak auto-zoom saat diklik
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
  },
  button: {
    padding: '12px',
    marginTop: '10px',
    background: '#ff3333',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '1rem',
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent', // Menghilangkan highlight biru saat ditap di HP
  },
  refreshBtn: {
    padding: '8px 16px',
    background: '#1976d2',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    WebkitTapHighlightColor: 'transparent',
  },
  logoutBtn: {
    padding: '8px 16px',
    background: '#333',
    color: '#fff',
    border: '1px solid #555',
    borderRadius: '6px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
  },
  deleteBtn: {
    padding: '6px 12px', // Diperbesar sedikit agar mudah ditekan di HP
    background: '#d32f2f',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.85rem',
    fontWeight: '500',
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
  },
  error: { 
    color: '#ff4d4d', 
    fontSize: '0.85rem', 
    textAlign: 'center', 
    margin: '0 0 10px 0' 
  },
  tableContainer: { 
    overflowX: 'auto', // Scroll horizontal halus di iPhone/Android
    WebkitOverflowScrolling: 'touch', // Kinetic scroll halus untuk iOS Safari
    borderRadius: '6px',
    border: '1px solid #333',
  },
  table: { 
    width: '100%', 
    borderCollapse: 'collapse', 
    color: '#e0e0e0',
    minWidth: '600px', // Mencegah isi tabel berdesakan/hancur di layar HP
  },
  th: { 
    borderBottom: '2px solid #444', 
    padding: '12px 14px', 
    textAlign: 'left', 
    color: '#ff3333',
    backgroundColor: '#252525',
    fontSize: '0.9rem',
    whiteSpace: 'nowrap',
  },
  td: { 
    borderBottom: '1px solid #333', 
    padding: '12px 14px',
    fontSize: '0.9rem',
    wordBreak: 'break-word',
  },
};