import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import javaScriptObfuscator from 'vite-plugin-javascript-obfuscator'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    javaScriptObfuscator({
      options: {
        rotateStringArray: true,
        stringArray: true,
        stringArrayThreshold: 0.75,
        compact: true,
        controlFlowFlattening: false,
        deadCodeInjection: false,
        debugProtection: false,
        disableConsoleOutput: true,
      },
      apply: 'build', // hanya aktif saat: npm run build
    }),
  ],
})
