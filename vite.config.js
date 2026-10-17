import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import JavaScriptObfuscator from 'javascript-obfuscator'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

function customObfuscatorPlugin() {
  return {
    name: 'vite-plugin-custom-obfuscator',
    apply: 'build',
    enforce: 'post',
    generateBundle(options, bundle) {
      for (const fileName in bundle) {
        const file = bundle[fileName]
        // Hanya obfuskasi file utama, lewati vendor/polyfill agar tetap bersih
        if (fileName.endsWith('.js') && file.type === 'chunk' && !fileName.includes('vendor') && !fileName.includes('polyfill')) {
          const result = JavaScriptObfuscator.obfuscate(file.code, {
            compact: true,
            identifierNamesGenerator: 'mangled',
            renameGlobals: false,
            selfDefending: false,
            stringArray: true,
            stringArrayEncoding: ['base64'],
            stringArrayThreshold: 1,
            stringArrayCallsTransform: false,
            stringArrayRotate: true,
            stringArrayShuffle: true,
            stringArrayIndexShift: true,
            stringArrayWrappersCount: 1,
            stringArrayWrappersChainedCalls: false,
            debugProtection: true, // Memaksa browser masuk ke mode 'debugger' tanpa henti saat F12 ditekan
            debugProtectionInterval: 2000, // Mengulang pembekuan devtools setiap 2 detik
            splitStrings: false,
            transformObjectKeys: true,       // 👈 Ubah menjadi true agar 'className', 'src', dll ikut terobfuskasi
            unicodeEscapeSequence: true,     // 👈 Ubah menjadi true agar format teksnya tertutup rapat
            simplify: true,
          })
          file.code = result.getObfuscatedCode()
        }
      }
    }
  }
}

// https://vite.dev
export default defineConfig({
  plugins: [
    react(),
    cssInjectedByJsPlugin({
      topExecutionPriority: true,
      minify: true,
    }),
    customObfuscatorPlugin(),
  ],
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