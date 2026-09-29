import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import javaScriptObfuscator from 'vite-plugin-javascript-obfuscator'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import postcssCustomProperties from 'postcss-custom-properties' // 👈 1. Impor PostCSS compiler

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    cssInjectedByJsPlugin(), 
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
      enforce: 'post', 
    },
  ],
  // ── KUNCI FIX CSS: Menghancurkan variabel kustom dan menghapus blok :root ──
  css: {
    postcss: {
      plugins: [
        postcssCustomProperties({
          preserve: false // Mengubah fungsi var(--name) menjadi kode warna asli dan menghapus :root
        })
      ]
    }
  },
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
    sourcemap: false, 
    minify: 'terser', 
    terserOptions: {   
      compress: {
        drop_console: true,
        passes: 3, 
      },
    },
  },
})
