import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Project site: https://dannywang0822.github.io/rocket-explorer-3d/
export default defineConfig({
  base: '/rocket-explorer-3d/',
  plugins: [react()],
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
  },
});
