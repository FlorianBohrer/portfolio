import { defineConfig } from "vite";

// base: "./" → relative asset paths so the built site works on GitHub Pages
// subpaths, Netlify, Vercel or any static host without config.
export default defineConfig({
  base: "./",
  server: { port: 5180, host: true },
  build: { target: "es2020" },
});
