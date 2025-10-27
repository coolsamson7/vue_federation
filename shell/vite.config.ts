import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import vue from "@vitejs/plugin-vue";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: "shell",
      remotes: {
        productModule: "http://localhost:5003/assets/remoteEntry.js",
        userModule: "http://localhost:5002/assets/remoteEntry.js",
      },
      shared: {
       vue: {
           singleton: true,
           requiredVersion: "^3.5.22",
         },
         "vue-router": {
           singleton: true,
           requiredVersion: "^4.6.3",
         },
         pinia: {
           singleton: true,
           requiredVersion: "^3.0.3",
         },
      } as any,
    }),
  ],
  build: {
    target: "esnext",
    minify: false,
    cssCodeSplit: false,
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
  server: {
    port: 5000,
    cors: true, // ADDED
  },
});
