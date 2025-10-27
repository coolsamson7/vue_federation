import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import vue from "@vitejs/plugin-vue";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: "productModule",
      filename: "remoteEntry.js",
      exposes: {
        "./ProductList": "./src/components/ProductList.vue",
        "./ProductDetail": "./src/components/ProductDetail.vue",
        "./ProductModule": "./src/ProductModule.ts",
      },
      shared: {
        vue: {
          import: false,
          requiredVersion: "^3.5.22",
          manuallyPackagePathSetting: true,
        },
        "vue-router": {
          import: false,
          requiredVersion: "^4.6.3",
          manuallyPackagePathSetting: true,
        },
        pinia: {
          import: false,
          requiredVersion: "^3.0.3",
          manuallyPackagePathSetting: true,
        },
      } as any,
    }),
  ],
  build: {
    target: "esnext",
    minify: false,
    cssCodeSplit: false,
  },
  preview: {
    port: 5003,
  },
  resolve: {
    alias: [
      {
        // exact `import 'vue'` should use the runtime compiler build
        find: /^vue$/,
        replacement: path.resolve(
          path.dirname(fileURLToPath(import.meta.url)),
          "node_modules/vue/dist/vue.esm-bundler.js"
        ),
      },
      {
        // explicit package.json mapping so tools can still read package metadata
        find: "vue/package.json",
        replacement: path.resolve(
          path.dirname(fileURLToPath(import.meta.url)),
          "node_modules/vue/package.json"
        ),
      },
    ],
  },
});
