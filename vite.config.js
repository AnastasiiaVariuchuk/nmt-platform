import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const base = '/nmt-platform/'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
