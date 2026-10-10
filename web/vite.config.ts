import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  base: process.env.GITHUB_PAGES === 'true' ? '/NiPath-Architecture/' : '/',
  build: { outDir: '../docs', emptyOutDir: true, sourcemap: false },
  server: { host: '127.0.0.1', port: 5173 },
})
