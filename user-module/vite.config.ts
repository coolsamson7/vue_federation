import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import vue from "@vitejs/plugin-vue";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: "userModule",
      filename: "remoteEntry.js",
      exposes: {
        "./UserList": "./src/components/UserList.vue",
        "./UserProfile": "./src/components/UserProfile.vue",
        "./UserModule": "./src/UserModule.ts",
      },
      shared: {
        vue: {
            requiredVersion: "^3.5.22",
            singleton: true,
          },
          "vue-router": {
            requiredVersion: "^4.6.3",
            singleton: true,
          },
          pinia: {
            requiredVersion: "^3.0.3",
            singleton: true,
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
    port: 5002,
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
