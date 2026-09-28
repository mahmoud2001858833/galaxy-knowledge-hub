import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const apiDevMiddlewarePlugin = () => ({
  name: 'zarwat-api-dev-middleware',
  configureServer(server: any) {
    server.middlewares.use((req: any, res: any, next: any) => {
      if (req.url && req.url.startsWith('/api/v1/')) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Authorization, X-API-Key, Content-Type');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.url.startsWith('/api/v1/auth/verify')) {
          res.statusCode = 200;
          res.end(JSON.stringify({
            success: true,
            authenticated: true,
            key: 'ak_live_CB5z...ZSh',
            name: 'Master Production Key',
            scopes: ['*'],
            status: 'Operational'
          }, null, 2));
          return;
        }

        if (req.url.startsWith('/api/v1/openapi.json')) {
          res.statusCode = 200;
          res.end(JSON.stringify({
            openapi: '3.0.3',
            info: { title: 'Zarwat Al-Ilm API', version: '1.0.0' }
          }, null, 2));
          return;
        }
      }
      next();
    });
  }
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    apiDevMiddlewarePlugin(),
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
