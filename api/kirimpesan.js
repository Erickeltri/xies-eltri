import mongoose from 'mongoose';
import nodemailer from 'nodemailer';

const MONGODB_URI = process.env.MONGODB_URI;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method tidak diizinkan' });
  }

  const { nama, pesan } = req.body;

  if (!nama || !pesan) {
    return res.status(400).json({ success: false, message: 'Nama dan pesan wajib diisi' });
  }

  try {
    // 1. Simpan Pesan ke MongoDB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGODB_URI, { bufferCommands: false });
    }

    const Pesan = mongoose.models.Pesan || mongoose.model('Pesan', new mongoose.Schema({}, { strict: false, collection: 'pesans' }));
    
    await Pesan.create({
      nama,
      pesan,
      createdAt: new Date(),
    });

    // 2. Kirim Notifikasi Email via Nodemailer (Port 465 SSL)
    if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS, // Pastikan tidak ada spasi: mpaqgalwlgytfnxu
        },
      });

      await transporter.sendMail({
        from: `"Web Eltri" <${process.env.GMAIL_USER}>`,
        to: process.env.GMAIL_USER,
        subject: `📩 Pesan Baru dari ${nama}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #ff3333;">Pesan Baru Masuk!</h2>
            <p><strong>Pengirim:</strong> ${nama}</p>
            <p><strong>Pesan:</strong></p>
            <blockquote style="background: #f9f9f9; padding: 10px; border-left: 4px solid #ff3333;">
              ${pesan}
            </blockquote>
            <p style="font-size: 0.8rem; color: #888;">Waktu: ${new Date().toLocaleString('id-ID')}</p>
          </div>
        `,
      });
    }

    return res.status(200).json({ success: true, message: 'Pesan & Email berhasil dikirim!' });

  } catch (error) {
    console.error('Error backend:', error);
    return res.status(500).json({ success: false, message: `Gagal: ${error.message}` });
  }
}