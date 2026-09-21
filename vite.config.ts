import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves this repo from a /lifestyledashboard/ subpath; local
  // dev and Vercel/Netlify-style hosts serve it from the root.
  base: process.env.GH_PAGES ? '/lifestyledashboard/' : '/',
  plugins: [react(), tailwindcss()],
})
