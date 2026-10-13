import { colyseus } from "colyseus/vite";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  logLevel: "warn",
  build: {
    target: "es2022",
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/phaser")) {
            return "phaser";
          }
        },
      },
    },
    minify: "terser",
    terserOptions: {
      compress: {
        passes: 2,
      },
      mangle: true,
      format: {
        comments: false,
      },
    },
  },
  environments: {
    colyseus: {
      build: { copyPublicDir: false },
    },
  },
  plugins: [
    colyseus({
      serverEntry: "/src/server/index.ts",
      serveClient: true,
    }),
  ],
});
