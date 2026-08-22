import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Expose ANTHROPIC_API_KEY to the client via import.meta.env
  envPrefix: "ANTHROPIC_",
});
