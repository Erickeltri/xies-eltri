import React, { useState } from 'react';

export default function LoginPesan() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pesanList, setPesanList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchPesan = async () => {
    setLoading(true);
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

  // --- FUNGSI HAPUS PESAN (DENGAN PROTEKSI SECRET HEADER) ---
  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus pesan ini?')) return;

    try {
      const res = await fetch(`/api/deletepesan?id=${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-secret': 'SangatRahasia123',
        },
      });

      // Ambil respon sebagai text dulu untuk mencegah crash parsing JSON
      const textResponse = await res.text();
      let data;
      try {
        data = JSON.parse(textResponse);
      } catch (e) {
        throw new Error(`Respon server bukan JSON: ${textResponse.substring(0, 100)}`);
      }

      if (res.ok && data.success) {
        setPesanList((prevList) => prevList.filter((item) => item._id !== id));
      } else {
        alert(data.message || 'Gagal menghapus pesan.');
      }
    } catch (err) {
      console.error(err);
      alert(`Detail Error: ${err.message}`);
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
        fetchPesan();
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
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </div>

          {loading ? (
            <p style={{ color: '#ccc' }}>Memuat pesan...</p>
          ) : pesanList.length === 0 ? (
            <p style={{ color: '#aaa' }}>Belum ada pesan yang masuk.</p>
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

// Style
const styles = {
  pageBackground: {
    backgroundColor: '#121212',
    minHeight: '85vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 20px',
  },
  card: {
    background: '#1e1e1e',
    border: '1px solid #333',
    padding: '32px',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '380px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
  },
  dashboardCard: {
    background: '#1e1e1e',
    border: '1px solid #333',
    padding: '28px',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '900px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: { color: '#ffffff', textAlign: 'center', marginBottom: '8px', fontSize: '1.4rem' },
  dashboardTitle: { color: '#ffffff', fontSize: '1.3rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { color: '#cccccc', fontSize: '0.85rem' },
  input: {
    padding: '10px 12px',
    borderRadius: '4px',
    border: '1px solid #444',
    background: '#2a2a2a',
    color: '#ffffff',
    outline: 'none',
  },
  button: {
    padding: '10px',
    marginTop: '10px',
    background: '#ff3333',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  logoutBtn: {
    padding: '6px 14px',
    background: '#333',
    color: '#fff',
    border: '1px solid #555',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  deleteBtn: {
    padding: '4px 10px',
    background: '#d32f2f',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  error: { color: '#ff4d4d', fontSize: '0.85rem', textAlign: 'center', margin: '0' },
  tableContainer: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', color: '#e0e0e0', marginTop: '10px' },
  th: { borderBottom: '2px solid #444', padding: '12px', textAlign: 'left', color: '#ff3333' },
  td: { borderBottom: '1px solid #333', padding: '12px' },
};