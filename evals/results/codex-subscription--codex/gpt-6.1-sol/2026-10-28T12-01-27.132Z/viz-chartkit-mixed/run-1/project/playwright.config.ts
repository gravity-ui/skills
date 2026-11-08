import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  use: { baseURL: "http://localhost:4180", headless: true },
  webServer: {
    command:
      "npm run build && npm exec vite preview -- --host 0.0.0.0 --port 4180",
    url: "http://localhost:4180",
    reuseExistingServer: !process.env.CI,
  },
  reporter: "list",
});
