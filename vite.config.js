import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon/favicon.ico",
        "favicon/apple-touch-icon.png",
        "favicon/icon-192.png",
        "favicon/icon-512.png",
        "favicon/favicon.svg",
        "logo.png",
        "robots.txt",
      ],
      manifest: {
        name: "Quiz Craze",
        short_name: "QuizCraze",
        description: "Test your knowledge with Quiz Craze!",
        theme_color: "#0f172a",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "favicon/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "favicon/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
