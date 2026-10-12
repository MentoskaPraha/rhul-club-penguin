import { colyseus } from "colyseus/vite";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  logLevel: "warn",
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ["phaser"]
        }
      }
    },
    minify: "terser",
    terserOptions: {
      compress: {
        passes: 2
      },
      mangle: true,
      format: {
        comments: false
      }
    }
  },
  plugins: [
    colyseus({
      serverEntry: "/src/server/index.ts",
      serveClient: true
    })
  ]
});
