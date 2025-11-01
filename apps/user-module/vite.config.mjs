import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import vue from "@vitejs/plugin-vue";
import federation from "@originjs/vite-plugin-federation";
import viteTsconfigPaths from "vite-tsconfig-paths";
import { sharedPlugins } from "../../vite.shared.config"; // 👈 import shared config

// Determine mode: 'lib' for remote, 'dev' for local dev
const isLibBuild = process.env.BUILD_MODE === "lib";
console.log("Vite root:", __dirname);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    root: path.resolve(__dirname),

  plugins: [
    vue(),
    ...sharedPlugins,
    federation({
      name: "userModule",
      filename: "remoteEntry.js",
      exposes: {
        "./UserList":  path.resolve(__dirname, "src/components/UserList.vue"),
        "./UserProfile":  path.resolve(__dirname, "src/components/UserProfile.vue"),
        "./UserModule":  path.resolve(__dirname, "src/UserModule.ts"),
      },
      shared: {
        vue: { singleton: true, requiredVersion: "^3.5.22" },
        "vue-router": { singleton: true, requiredVersion: "^4.6.3" },
        pinia: { singleton: true, requiredVersion: "^3.0.3" },
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
      }
    : {
        outDir: "dist",
        target: "esnext",
        minify: false,
        cssCodeSplit: false,
      },

  server: !isLibBuild
    ? {
        port: 5003,
         cors: true,
                fs: {
                      strict: false
                    }
      }
    : undefined,

  preview: !isLibBuild
    ? {
        port: 5003,
         cors: true,
                fs: {
                      strict: false
                    }
      }
    : undefined,
});
