import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import uiPro from '@nuxt/ui-pro/vite'
import { espViteBuild } from '@aidenvigue/vite-plugin-static-c'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    uiPro({
      ui: {
        colors: {
          primary: 'green',
          neutral: 'slate'
        }
      },
      theme: {
        colors: []
      }
    }),
    espViteBuild()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
