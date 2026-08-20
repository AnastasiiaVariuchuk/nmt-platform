import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const base = './'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
