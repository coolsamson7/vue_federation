import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import vue from "@vitejs/plugin-vue";
import federation from "@originjs/vite-plugin-federation";
import { sharedPlugins } from "../../vite.shared.config";
import ViteTS from "vite-plugin-tsc";
import babel from "vite-plugin-babel";
import { createRequire } from "module";
import swc from "vite-plugin-swc-transform";

const require = createRequire(import.meta.url);
// load babel config explicitly so vite-plugin-babel always uses the expected config
// prefer CommonJS config to avoid ESM/CommonJS issues under "type": "module"
//const babelConfig = require("../../babel.config.cjs");

// __dirname Fix für ES Module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // serve from project root so index.html at apps/shell/index.html is found
  root: path.resolve(__dirname),

  plugins: [
    /* run Babel first so decorators/metadata are emitted correctly for TSyringe
    babel({
            presets: [["@babel/preset-typescript", { allowDeclareFields: true }]],
            plugins: [
              // emit TypeScript design:paramtypes metadata for decorators (must run before decorators transform)
              "babel-plugin-transform-typescript-metadata",
              ["@babel/plugin-proposal-decorators", { legacy: true }],
              ["@babel/plugin-proposal-class-properties", { loose: true }],
            ],
          }),*/
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
    //ViteTS(),
    ...sharedPlugins, // enthält vite-tsconfig-paths()
    federation({
      name: "shell",
      remotes: {},
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
        portal: { singleton: true },
        tsyringe: { singleton: true, eager: true },
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
      allow: [path.resolve(__dirname), path.resolve(__dirname, "../../")],
    },
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
