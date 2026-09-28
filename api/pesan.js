import { MongoClient } from 'mongodb';
import nodemailer from 'nodemailer';

const uri = process.env.MONGODB_URI;

// Connection Caching untuk Vercel Serverless (Mencegah error 'Too Many Connections')
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('eltri_db');

  cachedClient = client;
  cachedDb = db;
  return { client, db };
}

// Fungsi Sanitasi Input untuk Mencegah XSS (Cross-Site Scripting)
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
  // 1. Header Keamanan & CORS
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. Validasi Method (Hanya POST)
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  // 3. Validasi Environment Variable
  if (!uri) {
    return res.status(500).json({
      success: false,
      message: 'MONGODB_URI belum terpasang di Vercel Environment Variables.',
    });
  }

  try {
    // 4. Validasi & Sanitasi Input (Anti-XSS & Anti-Spam / Payload Bombing)
    let { nama, pesan } = req.body || {};

    if (!nama || !pesan || typeof nama !== 'string' || typeof pesan !== 'string') {
      return res.status(400).json({ success: false, message: 'Nama dan pesan wajib diisi dengan format yang benar.' });
    }

    nama = nama.trim();
    pesan = pesan.trim();

    // Pembatasan Panjang Karakter
    if (nama.length > 50) {
      return res.status(400).json({ success: false, message: 'Nama maksimal 50 karakter.' });
    }
    if (pesan.length > 1000) {
      return res.status(400).json({ success: false, message: 'Pesan maksimal 1000 karakter.' });
    }

    // Sanitasi karakter HTML sebelum disimpan & dikirim
    const safeNama = sanitizeInput(nama);
    const safePesan = sanitizeInput(pesan);

    // 5. Simpan ke MongoDB dengan Connection Pooling
    const { db } = await connectToDatabase();
    await db.collection('pesan').insertOne({
      nama: safeNama,
      pesan: safePesan,
      createdAt: new Date(),
    });

    // 6. Kirim Notifikasi Email via Nodemailer (Resilient / Non-blocking Error)
    if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true, // Gunakan SSL
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
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; max-width: 600px; background-color: #ffffff;">
              
              <!-- Header Table -->
              <table width="100%" cellPadding="0" cellSpacing="0" border="0" style="margin-bottom: 20px;">
                <tr>
                  <td align="left" style="vertical-align: middle;">
                    <h2 style="color: #ff3333; margin: 0; font-size: 1.3rem;">Pesan Baru Diterima!</h2>
                  </td>
                  <td align="right" style="vertical-align: middle; width: 60px;">
                    <img src="https://xies-eltri.vercel.app/images/logo.png" alt="Logo" width="50" height="50" style="display: block; width: 50px; height: 50px; object-fit: contain; border-radius: 50%; border: 0;" />
                  </td>
                </tr>
              </table>

              <!-- Detail Pengirim & Pesan -->
              <p style="margin: 8px 0; color: #333;"><strong>Pengirim:</strong> ${safeNama}</p>
              <p style="margin: 8px 0 4px 0; color: #333;"><strong>Pesan:</strong></p>
              
              <blockquote style="background: #f9f9f9; padding: 12px 16px; border-left: 4px solid #ff3333; margin: 0; border-radius: 4px; color: #222; line-height: 1.5; white-space: pre-wrap;">
                ${safePesan}
              </blockquote>

              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0 12px 0;" />
              
              <!-- Waktu Masuk -->
              <p style="font-size: 0.8rem; color: #888; margin: 0;">Waktu Masuk: ${new Date().toLocaleString('id-ID')}</p>
            </div>
          `,
        });
      } catch (emailError) {
        // Log error email tanpa menggagalkan respon sukses user
        console.error('Nodemailer Error:', emailError);
      }
    }

    return res.status(200).json({ success: true, message: 'Pesan berhasil terkirim & email notifikasi dikirim!' });

  } catch (error) {
    console.error('Mongo Error:', error);
    // Sembunyikan error.message asli untuk menyembunyikan detail kredensial/database dari pengguna luar
    return res.status(500).json({
      success: false,
      message: 'Gagal memproses dan menyimpan pesan.',
    });
  }
}