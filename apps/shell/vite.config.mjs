import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import vue from "@vitejs/plugin-vue";
import federation from "@originjs/vite-plugin-federation";
import { sharedPlugins } from "../../vite.shared.config";
import ViteTS from "vite-plugin-tsc";

// __dirname Fix für ES Module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // serve from project root so index.html at apps/shell/index.html is found
  root: path.resolve(__dirname),

  plugins: [
    vue(),
    //ViteTS(),
    ...sharedPlugins, // enthält vite-tsconfig-paths()
    // federation plugin temporarily disabled for syntax isolation
  ],

  resolve: {
    alias: [
      {
        find: /^portal(\/.*)?$/,
        replacement: path.resolve(__dirname, "../../libs/portal/src$1"),
      },
      {
        find: /^vue$/,
        // point to repository root node_modules so package-local node_modules are not required
        replacement: path.resolve(
          __dirname,
          "../../node_modules/vue/dist/vue.esm-bundler.js"
        ),
      },
    ],
  },

  build: {
    target: "esnext",
    minify: false,
    cssCodeSplit: false,
    outDir: "dist",
    rollupOptions: {
      input: "index.html",
    },
  },

  server: {
    port: 5000,
    fs: {
      // allow Vite to serve files from the app folder and workspace root
      allow: [path.resolve(__dirname), path.resolve(__dirname, '../../')]
    }
  },

  preview: {
    port: 5000,
  },

  esbuild: {
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
      },
    },
  },
});
