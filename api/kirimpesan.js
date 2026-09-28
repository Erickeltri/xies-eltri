import mongoose from 'mongoose';
import nodemailer from 'nodemailer';

const MONGODB_URI = process.env.MONGODB_URI;

// Fungsi helper sederhana untuk mencegah XSS (Cross-Site Scripting)
function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export default async function handler(req, res) {
  // 1. Atur Header Keamanan & CORS
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. Hanya Menerima Method POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method tidak diizinkan' });
  }

  // 3. Validasi & Sanitasi Input (Anti-XSS / Anti-Injection)
  let { nama, pesan } = req.body || {};

  if (!nama || !pesan || typeof nama !== 'string' || typeof pesan !== 'string') {
    return res.status(400).json({ success: false, message: 'Nama dan pesan wajib diisi dengan format yang benar.' });
  }

  // Trim spasi berlebih
  nama = nama.trim();
  pesan = pesan.trim();

  // Batasi Panjang Karakter (Mencegah Spam / Payload Bombs)
  if (nama.length > 50) {
    return res.status(400).json({ success: false, message: 'Nama maksimal 50 karakter.' });
  }
  if (pesan.length > 1000) {
    return res.status(400).json({ success: false, message: 'Pesan maksimal 1000 karakter.' });
  }

  // Sanitasi karakter HTML sebelum disimpan/dikirim
  const safeNama = sanitizeInput(nama);
  const safePesan = sanitizeInput(pesan);

  // 4. Validasi Environment Variable
  if (!MONGODB_URI) {
    return res.status(500).json({ success: false, message: 'MONGODB_URI belum terpasang.' });
  }

  try {
    // Koneksi ke MongoDB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGODB_URI, { bufferCommands: false });
    }

    const PesanSchema = new mongoose.Schema({
      nama: String,
      pesan: String,
      createdAt: { type: Date, default: Date.now },
    });

    const Pesan = mongoose.models.Pesan || mongoose.model('Pesan', PesanSchema, 'pesans');

    // Simpan ke Database
    await Pesan.create({
      nama: safeNama,
      pesan: safePesan,
      createdAt: new Date(),
    });

    // 5. Kirim Email Notifikasi via Nodemailer (Non-blocking Error Handling)
    if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true, // Port 465 menggunakan SSL
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS.replace(/\s+/g, ''), // Otomatis hapus spasi pada App Password
          },
        });

        await transporter.sendMail({
          from: `"Web Eltri" <${process.env.GMAIL_USER}>`,
          to: process.env.GMAIL_USER,
          subject: `📩 Pesan Baru dari ${safeNama}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff; color: #333333;">
              <h2 style="color: #ff3333; margin-top: 0;">Pesan Baru Diterima!</h2>
              <p><strong>Pengirim:</strong> ${safeNama}</p>
              <p><strong>Pesan:</strong></p>
              <blockquote style="background: #f9f9f9; padding: 12px; border-left: 4px solid #ff3333; margin: 0; white-space: pre-wrap;">
                ${safePesan}
              </blockquote>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 0.8rem; color: #888;">Dikirim pada: ${new Date().toLocaleString('id-ID')}</p>
            </div>
          `,
        });
      } catch (emailErr) {
        // Log error email tapi jangan batalkan respon sukses ke user (pesan sudah tersimpan di database)
        console.error('Gagal mengirim email notifikasi:', emailErr);
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Pesan berhasil dikirim!' 
    });

  } catch (error) {
    console.error('Error pada kirimpesan.js:', error);
    return res.status(500).json({ success: false, message: 'Gagal memproses pesan.' });
  }
}