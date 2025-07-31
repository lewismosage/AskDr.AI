import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [
        '@stripe/stripe-js',
        '@stripe/react-stripe-js'
      ],
      input: './src/main.tsx' 
    },
    outDir: './dist', 
    assetsDir: 'assets',
    emptyOutDir: true
  },
  base: '/',
});