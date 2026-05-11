import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  main: {
    build: {
      target: 'node20',
      rollupOptions: {
        input: path.resolve(__dirname, 'main.js'),
        output: {
          format: 'cjs',
          entryFileNames: '[name].js'
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname)
      }
    }
  },
  preload: {
    build: {
      target: 'node20',
      rollupOptions: {
        input: path.resolve(__dirname, 'preload.js'),
        output: {
          format: 'cjs',
          entryFileNames: '[name].js'
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
