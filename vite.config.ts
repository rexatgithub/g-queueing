import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/g-queueing/',
  plugins: [tailwindcss(), react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});
