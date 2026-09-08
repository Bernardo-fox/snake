import { defineConfig } from "vite";

export default defineConfig({
  base: "/snake/",
  server: {
    port: 5173,
    open: true,
  },
});
