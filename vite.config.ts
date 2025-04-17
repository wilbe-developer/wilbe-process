
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";
import path from "path";

// Dynamically import the componentTagger only in development mode
// to avoid ESM/CommonJS conflicts
const getPlugins = async (mode: string) => {
  const plugins = [
    react(),
    svgr(), // ✅ added here
  ];
  
  if (mode === 'development') {
    try {
      // Use dynamic import for ESM module
      const { componentTagger } = await import('lovable-tagger');
      plugins.push(componentTagger());
    } catch (error) {
      console.warn('Failed to load componentTagger:', error);
    }
  }
  
  return plugins.filter(Boolean);
};

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: await getPlugins(mode),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Ensure we're building for web
  build: {
    target: 'esnext',
    outDir: 'dist',
  },
}));
