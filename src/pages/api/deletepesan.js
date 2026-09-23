// src/pages/api/deletepesan.js
import dbConnect from '../../lib/dbConnect'; // Mundur 2 folder ke src/lib/dbConnect
import Pesan from '../../models/Pesan';       // Mundur 2 folder ke src/models/Pesan
import mongoose from 'mongoose';

export default async function handler(req, res) {
  // Selalu set header JSON
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'DELETE') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method tidak diizinkan' 
    });
  }

  // 1. Verifikasi Header Rahasia Admin
  const clientSecret = req.headers['x-admin-secret'];
  const serverSecret = process.env.ADMIN_SECRET_KEY;

  if (serverSecret && clientSecret !== serverSecret) {
    return res.status(401).json({ 
      success: false, 
      message: 'Akses ditolak! Kunci rahasia tidak cocok.' 
    });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ 
      success: false, 
      message: 'ID pesan tidak ditemukan' 
    });
  }

  try {
    // 2. Hubungkan ke MongoDB
    await dbConnect();

    // 3. Validasi format ObjectId MongoDB
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Format ID pesan tidak valid' 
      });
    }

    // 4. Hapus data dari MongoDB
    const deletedPesan = await Pesan.findByIdAndDelete(id);

    if (!deletedPesan) {
      return res.status(404).json({ 
        success: false, 
        message: 'Pesan tidak ditemukan di database' 
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Pesan berhasil dihapus' 
    });

  } catch (error) {
    console.error('Error deletepesan:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Terjadi kesalahan server saat menghapus pesan' 
    });
  }
}