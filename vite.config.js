import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    build: {
      lib: {
        entry: 'main.js',
        formats: ['cjs']
      },
      rollupOptions: {
        output: {
          format: 'cjs'
        }
      }
    }
  },
  preload: {
    build: {
      lib: {
        entry: 'preload.js',
        formats: ['cjs']
      },
      rollupOptions: {
        output: {
          format: 'cjs'
        }
      }
    }
  },
  renderer: {
    root: 'src',
    plugins: [react()],
    base: './',
    build: {
      outDir: '../dist/renderer',
      emptyOutDir: true
    },
    server: {
      port: 5173,
      open: true
    }
  }
})
