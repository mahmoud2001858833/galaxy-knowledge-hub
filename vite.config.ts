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
    target: "es2020",
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("three") || id.includes("@react-three")) {
              return "vendor-three";
            }
            if (id.includes("@tensorflow") || id.includes("@mediapipe") || id.includes("tesseract.js")) {
              return "vendor-ai-vision";
            }
            if (id.includes("@monaco-editor") || id.includes("monaco-editor")) {
              return "vendor-monaco";
            }
            if (id.includes("plotly.js") || id.includes("recharts") || id.includes("d3")) {
              return "vendor-charts";
            }
            if (id.includes("jspdf") || id.includes("html2canvas") || id.includes("pdfjs-dist") || id.includes("mammoth") || id.includes("xlsx")) {
              return "vendor-docs-export";
            }
            if (id.includes("framer-motion")) {
              return "vendor-motion";
            }
            if (id.includes("lucide-react")) {
              return "vendor-icons";
            }
            if (id.includes("@radix-ui")) {
              return "vendor-radix";
            }
            if (id.includes("@supabase")) {
              return "vendor-supabase";
            }
            if (id.includes("react-router-dom") || id.includes("@remix-run")) {
              return "vendor-router";
            }
          }
        },
      },
    },
  },
}));
