import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    optimizeDeps: {
    exclude: ['lottie-web']
  },
  server: {
    proxy: {
      // More specific routes first — `/api` would otherwise swallow `/api/local`
      "/api/local": {
        target: "http://127.0.0.1:17890",
        changeOrigin: true,
      },
    },
  },
  build: {
    assetsInlineLimit: 4096, // 4KB threshold
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
       // chunkFileNames: 'chunks/[name]-[hash].js',
       // entryFileNames: 'entries/[name]-[hash].js'
      },
     // external: ['lottie-web'],

    }
  },
  plugins: [
    react({
      jsxImportSource: "@emotion/react",
      babel: {
        plugins: ["@emotion/babel-plugin"],
      },
    }),
    tsconfigPaths({
      projects: ["tsconfig.json"],
    }),
  ],
});