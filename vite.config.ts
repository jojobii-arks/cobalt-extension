import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import makeManifest from "./utils/plugins/makeManifest";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), makeManifest()],
});
