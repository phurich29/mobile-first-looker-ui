import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      external: [
        // Mark React Native as external to prevent bundling issues
        'react-native'
      ],
      output: {
        globals: {
          'react-native': 'ReactNative'
        }
      }
    }
  },
  define: {
    // Define global variables for conditional compilation
    __IS_WEB__: true,
    __IS_NATIVE__: false,
  },
  optimizeDeps: {
    exclude: [
      // Exclude React Native packages from dependency optimization
      'react-native'
    ]
  }
}));
