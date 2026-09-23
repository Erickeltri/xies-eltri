import mongoose from 'mongoose';
import nodemailer from 'nodemailer';

const MONGODB_URI = process.env.MONGODB_URI;

export default async function handler(req, res) {
  // Hanya menerima HTTP Method POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method tidak diizinkan' });
  }

  const { nama, pesan } = req.body;

  if (!nama || !pesan) {
    return res.status(400).json({ success: false, message: 'Nama dan pesan wajib diisi' });
  }

  try {
    // 1. Koneksi dan Simpan ke MongoDB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGODB_URI, { bufferCommands: false });
    }

    const PesanSchema = new mongoose.Schema({
      nama: String,
      pesan: String,
      createdAt: { type: Date, default: Date.now },
    });

    const Pesan = mongoose.models.Pesan || mongoose.model('Pesan', PesanSchema, 'pesans');
    
    await Pesan.create({
      nama,
      pesan,
      createdAt: new Date(),
    });

    // 2. Kirim Email Notifikasi via Nodemailer
    if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // Port 465 menggunakan SSL
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS, // Gunakan App Password Gmail tanpa spasi
        },
      });

      await transporter.sendMail({
        from: `"Web Eltri" <${process.env.GMAIL_USER}>`,
        to: process.env.GMAIL_USER,
        subject: `📩 Pesan Baru dari ${nama}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #ff3333; margin-top: 0;">Pesan Baru Diterima!</h2>
            <p><strong>Pengirim:</strong> ${nama}</p>
            <p><strong>Pesan:</strong></p>
            <blockquote style="background: #f9f9f9; padding: 12px; border-left: 4px solid #ff3333; margin: 0;">
              ${pesan}
            </blockquote>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 0.8rem; color: #888;">Dikirim pada: ${new Date().toLocaleString('id-ID')}</p>
          </div>
        `,
      });
    }

    return res.status(200).json({ success: true, message: 'Pesan berhasil disimpan dan dikirim via email!' });

  } catch (error) {
    console.error('Error pada kirimpesan.js:', error);
    return res.status(500).json({ success: false, message: `Gagal memproses pesan: ${error.message}` });
  }
}