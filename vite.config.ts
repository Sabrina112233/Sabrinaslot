import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  root: '.', // 👈 Important: root is current directory (where index.html is)
  plugins: [react()],
  build: {
    outDir: 'dist/public',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src')
    }
  }
})
