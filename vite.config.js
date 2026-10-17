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
        if (fileName.endsWith('.js') && file.type === 'chunk') {
          const result = JavaScriptObfuscator.obfuscate(file.code, {
            compact: true,
            identifierNamesGenerator: 'hexadecimal',
            renameGlobals: false,
            selfDefending: false,
            stringArray: true,
            stringArrayEncoding: ['base64'],
            stringArrayThreshold: 1, // 100% teks string diobfuskasi
            stringArrayCallsTransform: true,
            stringArrayCallsTransformThreshold: 1,
            stringArrayRotate: true,
            stringArrayShuffle: true,
            stringArrayIndexShift: true,
            stringArrayWrappersCount: 2,
            stringArrayWrappersChainedCalls: true,
            splitStrings: true,
            splitStringsChunkLength: 4,
            transformObjectKeys: false, // 👈 DIUBAH MENJADI FALSE agar properti React/objek (className, src, dll) tidak rusak
            unicodeEscapeSequence: true,
            simplify: true,
            // Melindungi nama properti standar React agar aman dari perubahan ekstrem
            reservedNames: [
              '^className$',
              '^children$',
              '^src$',
              '^alt$',
              '^loading$',
              '^decoding$',
              '^width$',
              '^height$'
            ]
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