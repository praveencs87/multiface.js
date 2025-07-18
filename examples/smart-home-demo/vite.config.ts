import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@multiface.js/inputs': path.resolve(__dirname, '../../packages/inputs/dist/index.esm.js'),
      '@multiface.js/core': path.resolve(__dirname, '../../packages/core/dist/index.esm.js'),
      '@multiface.js/outputs': path.resolve(__dirname, '../../packages/outputs/dist/index.esm.js'),
    },
  },
}); 