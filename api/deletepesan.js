import dbConnect from '../lib/dbConnect'; // Pastikan path lib dbConnect benar
import Pesan from '../models/Pesan';       // Pastikan path model Pesan benar
import mongoose from 'mongoose';

export default async function handler(req, res) {
  // Set header agar selalu merespon JSON
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'DELETE') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method tidak diizinkan' 
    });
  }

  // Cek Secret Header
  const clientSecret = req.headers['x-admin-secret'];
  const serverSecret = process.env.ADMIN_SECRET_KEY;

  if (serverSecret && clientSecret !== serverSecret) {
    return res.status(401).json({ 
      success: false, 
      message: 'Akses ditolak! Secret key tidak valid.' 
    });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ 
      success: false, 
      message: 'ID pesan diperlukan' 
    });
  }

  try {
    // 1. Konek ke Database
    await dbConnect();

    // 2. Cek validitas ID MongoDB
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Format ID pesan tidak valid' 
      });
    }

    // 3. Hapus data
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
      message: error.message || 'Terjadi kesalahan saat menghapus pesan' 
    });
  }
} 