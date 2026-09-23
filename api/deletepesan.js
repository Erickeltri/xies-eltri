// api/deletepesan.js
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI belum dikonfigurasi di Environment Variables Vercel.');
  }
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Model Pesan (dilengkapi strict: false)
const PesanSchema = new mongoose.Schema({}, { strict: false, collection: 'pesans' });
const Pesan = mongoose.models.Pesan || mongoose.model('Pesan', PesanSchema);

export default async function handler(req, res) {
  // Set header JSON agar browser selalu membaca JSON
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'DELETE') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method tidak diizinkan' 
    });
  }

  // Cek Secret Key (opsional fallback jika env belum terpasang)
  const clientSecret = req.headers['x-admin-secret'];
  const serverSecret = process.env.ADMIN_SECRET_KEY || 'SangatRahasia123';

  if (clientSecret !== serverSecret) {
    return res.status(401).json({ 
      success: false, 
      message: `Akses ditolak! Kunci rahasia tidak cocok.` 
    });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ 
      success: false, 
      message: 'ID pesan tidak ditemukan pada query URL' 
    });
  }

  try {
    await dbConnect();

    let deletedPesan = null;

    // Coba hapus dengan ObjectId Mongoose
    if (mongoose.Types.ObjectId.isValid(id)) {
      deletedPesan = await Pesan.findByIdAndDelete(id);
    }

    // Jika tidak ketemu atau ID berupa String biasa
    if (!deletedPesan) {
      deletedPesan = await Pesan.findOneAndDelete({ _id: id });
    }

    if (!deletedPesan) {
      return res.status(404).json({ 
        success: false, 
        message: 'Pesan tidak ditemukan di database MongoDB' 
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
      message: `Database Error: ${error.message}` 
    });
  }
}