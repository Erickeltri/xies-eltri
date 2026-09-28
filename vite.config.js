import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import javaScriptObfuscator from 'vite-plugin-javascript-obfuscator'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      ...javaScriptObfuscator({
        include: [/\.(js|ts|tsx|jsx)$/],
        options: {
          compact: true,
          // ── Mengacak Seluruh String & Link Secara Agresif ──
          stringArray: true,
          stringArrayThreshold: 1, // 100% string wajib diacak
          stringArrayEncoding: ['base64', 'rc4'], // Mengunci teks dengan enkripsi ganda
          rotateStringArray: true,
          
          // ── Mengacak Logika Alur Komponen ──
          controlFlowFlattening: true,
          controlFlowFlatteningThreshold: 1,
          
          // ── Mengubah Nama Variabel Menjadi Kode Heksadesimal ──
          identifierNamesGenerator: 'hexadecimal', 
          
          // ── Perlindungan Tambahan (Anti Inspect Element) ──
          debugProtection: true, // Memaksa browser masuk ke mode 'debugger' tanpa henti
          debugProtectionInterval: 2000, // Mengulang pembekuan devtools setiap 2 detik
          
          deadCodeInjection: false,
          disableConsoleOutput: true,
        },
        apply: 'build',
      }),
      enforce: 'post', // Memaksa obfuscator berjalan di akhir setelah semua JSX diubah menjadi JS standar
    },
  ],
  // ── KUNCI FIX: Menghapus Data Log Metadata Vercel Yang Bocor di Browser ──
  define: {
    'import.meta.env.VITE_VERCEL_GIT_COMMIT_AUTHOR_LOGIN': JSON.stringify(''),
    'import.meta.env.VITE_VERCEL_GIT_COMMIT_AUTHOR_NAME': JSON.stringify(''),
    'import.meta.env.VITE_VERCEL_GIT_COMMIT_MESSAGE': JSON.stringify(''),
    'import.meta.env.VITE_VERCEL_GIT_REPO_OWNER': JSON.stringify(''),
    'import.meta.env.VITE_VERCEL_GIT_REPO_SLUG': JSON.stringify(''),
    'import.meta.env.VITE_VERCEL_GIT_COMMIT_SHA': JSON.stringify(''),
    'import.meta.env.VITE_VERCEL_GIT_PROVIDER': JSON.stringify(''),
  },
  build: {
    sourcemap: false, // Mematikan source map agar teks asli tidak direkonstruksi
    minify: 'terser', // Menggunakan Terser untuk menghancurkan susunan struktur fungsi JS
    terserOptions: {
      compress: {
        drop_console: true,
        passes: 3, // Memproses kode berkali-kali agar fungsi menyatu menjadi baris acak
      },
    },
  },
})
