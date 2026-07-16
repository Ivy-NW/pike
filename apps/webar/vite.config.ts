import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // host: true binds to 0.0.0.0 — Vite defaults to localhost-only, which a phone on the
  // same Wi-Fi can't reach even though the server is genuinely running.
  server: { port: 5173, host: true },
});
