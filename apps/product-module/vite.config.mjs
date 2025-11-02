import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import vue from "@vitejs/plugin-vue";
import federation from "@originjs/vite-plugin-federation";
import { sharedPlugins } from "../../vite.shared.config";
import swc from "vite-plugin-swc-transform";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Determine mode: lib for MFE, dev otherwise
const isLibBuild = true;// process.env.BUILD_MODE === "lib";

console.log(process.env);
console.log("is lib=" + isLibBuild);

export default defineConfig({
  root: path.resolve(__dirname),

  plugins: [
   swc({
      swcOptions: {
        jsc: {
          transform: {
            legacyDecorator: true,
            decoratorMetadata: true,
          },
          target: "es2021",
        },
      },
    }),

    vue(),
    ...sharedPlugins,

     federation({
          name: "productModule",
          filename: "remoteEntry.js",
          exposes: {
            "./ProductList": path.resolve(__dirname, "src/components/ProductList.vue"),
            "./ProductDetail": path.resolve(__dirname, "src/components/ProductDetail.vue"),
            "./ProductModule": path.resolve(__dirname, "src/ProductModule.ts"),
          }
      })
  ],

  resolve: {
    alias: [
      {
        find: /^portal(\/.*)?$/,
        replacement: path.resolve(__dirname, "../../libs/portal/src$1"),
      },
      {
        find: /^vue$/,
        replacement: path.resolve(
          path.dirname(fileURLToPath(import.meta.url)),
          "node_modules/vue/dist/vue.esm-bundler.js"
        ),
      },
    ],
  },

   define: {
        'process.env': {}, // ✅ prevent 'process is not defined' in remoteEntry
      },

  build: isLibBuild
      ? {
          target: "esnext",
          minify: false,
          cssCodeSplit: false,
          lib: {
            entry: path.resolve(__dirname, "src/ProductModule.ts"),
            name: "productModule",
            fileName: "remoteEntry",
            formats: ["es"],
          },
        }
      : {
          outDir: "dist",
          target: "esnext",
          minify: false,
          cssCodeSplit: false,
        },

    server: !isLibBuild
      ? {
          port: 5002,
          cors: true,
          fs: {
                strict: false
              }
        }
      : undefined,

    preview: !isLibBuild
      ? {
          port: 5002,
          cors: true,
          fs: {
                strict: false
              }
        }
      : undefined,
  });