import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true
  },
  build: {
    target: 'esnext',
    brotliSize: false,
  }
})
