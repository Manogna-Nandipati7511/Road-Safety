import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: "/Road-Safety/",    // <-- ADD THIS LINE (VERY IMPORTANT)
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
