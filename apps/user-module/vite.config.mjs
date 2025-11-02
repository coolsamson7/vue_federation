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
      name: "userModule",
      filename: "remoteEntry.js",
      exposes: isLibBuild
        ? {
            "./UserModule": "./src/UserModule.ts",
            "./UserList": "./src/components/UserList.vue",
            "./UserProfile": "./src/components/UserProfile.vue",
          }
        : {}, // nothing exposed in dev mode
      shared: {
        vue: { singleton: true, requiredVersion: false },
        "vue-router": { singleton: true, requiredVersion: false },
        pinia: { singleton: true, requiredVersion: false },
      },
    }),
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

  build: isLibBuild
    ? {
        target: "esnext",
        minify: false,
        cssCodeSplit: false,
        lib: {
          entry: path.resolve(__dirname, "src/UserModule.ts"),
          name: "userModule",
          fileName: "remoteEntry",
          formats: ["es"],
        },
        outDir: path.resolve(__dirname, "../../dist/apps/user-module"),
      }
    : {
        target: "esnext",
        minify: false,
        cssCodeSplit: false,
        outDir: path.resolve(__dirname, "../../dist/apps/user-module"),
      },

  server: !isLibBuild
    ? {
        port: 5003,
        cors: true,
        fs: { strict: false },
      }
    : undefined,

  preview: !isLibBuild
    ? {
        port: 5003,
        cors: true,
        fs: { strict: false },
      }
    : undefined,
});
