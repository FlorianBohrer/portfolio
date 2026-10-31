import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  // GitHub Pages serves the site under /portfolio/, Vercel at the domain root
  // (Vercel sets VERCEL=1 during its builds)
  base: process.env.VERCEL ? '/' : '/portfolio/',
  plugins: [vue()],
})
