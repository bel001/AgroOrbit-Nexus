import { defineConfig, devices } from "@playwright/test";
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
export default defineConfig({
  testDir: "./e2e", fullyParallel: false, workers: 1, timeout: 70_000,
  use: { baseURL, trace: "retain-on-failure" },
  webServer: process.env.CI ? { command: "npm start", url: baseURL, reuseExistingServer: false, timeout: 120_000 } : undefined,
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
    { name: "tablet", use: { viewport: { width: 820, height: 1180 } } },
    { name: "firefox", testMatch: /(reliability|map-loading)\.spec\.ts/, use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", testMatch: /(reliability|map-loading)\.spec\.ts/, use: { ...devices["Desktop Safari"] } },
  ],
});
