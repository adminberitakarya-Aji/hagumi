import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,avif,woff2}'],
        runtimeCaching: [{
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
          },
        }],
      },
      manifest: {
        name: 'Hagumi 育み — Virtual Pet',
        short_name: 'Hagumi',
        description: 'Raise and bond with your magical virtual pet',
        theme_color: '#ff6b9d',
        background_color: '#0a0a1a',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        categories: ['games', 'lifestyle', 'simulation'],
        screenshots: [
          { src: '/screenshots/game.webp', sizes: '1080x1920', type: 'image/webp', form_factor: 'narrow' },
          { src: '/screenshots/landing.webp', sizes: '1920x1080', type: 'image/webp', form_factor: 'wide' },
        ],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'My Pet', short_name: 'Pet', url: '/game', icons: [{ src: '/icons/pet-icon.png', sizes: '96x96', type: 'image/png' }] },
          { name: 'Market', short_name: 'Shop', url: '/market', icons: [{ src: '/icons/market-icon.png', sizes: '96x96', type: 'image/png' }] },
        ],
      },
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('framer-motion')) return 'vendor-animation';
            return 'vendor-utils';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: { port: 5173, host: true },
})
