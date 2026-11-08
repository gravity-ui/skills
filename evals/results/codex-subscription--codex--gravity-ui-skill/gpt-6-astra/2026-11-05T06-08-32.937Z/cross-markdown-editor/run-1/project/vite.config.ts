import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // markdown-it 13 imports the Node name; use its browser-compatible package.
    alias: [{ find: /^punycode$/, replacement: "punycode/" }],
  },
});
