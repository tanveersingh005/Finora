import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Highly optimized semantic structural code splitting!
            if (id.includes('recharts') || id.includes('d3') || id.includes('victory')) {
              return 'vendor_charts'; // Chunk mathematical libraries alone
            }
            if (id.includes('framer-motion') || id.includes('gsap')) {
              return 'vendor_animations'; // Chunk heavy graphical physics logic
            }
            if (id.includes('react') || id.includes('redux') || id.includes('react-router')) {
              return 'vendor_core'; // Core framework and state management
            }
            if (id.includes('lucide') || id.includes('sonner')) {
              return 'vendor_ui'; // UI structural components
            }
            return 'vendor'; // Catchall for any remaining node_module logic
          }
        }
      }
    },
    // Optional buffer threshold increment so it doesn't warn if standard bundles gently cross 500k
    chunkSizeWarningLimit: 600,
  }
})
