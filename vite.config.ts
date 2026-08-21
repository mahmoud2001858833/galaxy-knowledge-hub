import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
/**
 * The dev component tagger injects `data-lov-*` / `data-component-*` props into JSX.
 * react-three-fiber treats dashed props as pierced paths (e.g. `data.lov.id`) and throws.
 * Strip those attributes from 3D scene modules only.
 */
const stripTagsFrom3D = () => ({
  name: "strip-tagger-attrs-in-3d",
  enforce: "post" as const,
  transform(code: string, id: string) {
    if (!/simulations3d|sim3d|3D\.tsx/.test(id)) return null;
    if (!code.includes("data-lov-")) return null;
    return {
      code: code.replace(/"data-(?:lov|component)-[a-z-]+":\s*"[^"]*",?\s*/g, ""),
      map: null,
    };
  },
});

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    stripTagsFrom3D(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
