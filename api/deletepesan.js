// api/deletepesan.js
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI belum dikonfigurasi di Vercel Environment Variables.');
    }
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Skema Pesan
const PesanSchema = new mongoose.Schema({
  nama: String,
  pesan: String,
  tanggal: String,
});

const Pesan = mongoose.models.Pesan || mongoose.model('Pesan', PesanSchema);

export default async function handler(req, res) {
  // Wajib set header JSON
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'DELETE') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method tidak diizinkan' 
    });
  }

  // Verifikasi Secret Header
  const clientSecret = req.headers['x-admin-secret'];
  const serverSecret = process.env.ADMIN_SECRET_KEY || 'SangatRahasia123';

  if (clientSecret !== serverSecret) {
    return res.status(401).json({ 
      success: false, 
      message: 'Akses ditolak! Kunci rahasia admin salah.' 
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
    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Format ID pesan tidak valid' 
      });
    }

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
      message: error.message || 'Terjadi kesalahan internal server' 
    });
  }
}