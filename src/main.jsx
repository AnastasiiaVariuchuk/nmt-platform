import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './NMT_Platform_MVP.jsx'

// Локальна заміна window.storage (у Claude-артефактах він є, у браузері — ні)
if (!window.storage) {
  window.storage = {
    get: async (k) => {
      const v = localStorage.getItem(k)
      if (v === null) throw new Error('not found')
      return { key: k, value: v, shared: false }
    },
    set: async (k, v) => { localStorage.setItem(k, v); return { key: k, value: v, shared: false } },
    delete: async (k) => { localStorage.removeItem(k); return { key: k, deleted: true, shared: false } },
    list: async (p = '') => ({ keys: Object.keys(localStorage).filter(k => k.startsWith(p)), prefix: p, shared: false }),
  }
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
