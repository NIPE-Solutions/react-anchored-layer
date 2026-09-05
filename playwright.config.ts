import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  expect: { timeout: 5_000 },
  fullyParallel: true,
  reporter: [['line'], ['html', { open: 'never' }]],
  testDir: './test/browser',
  testIgnore: '**/website.spec.ts',
  use: {
    baseURL: 'http://127.0.0.1:4187',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'vite --config test/browser/vite.config.ts',
    reuseExistingServer: !process.env.CI,
    url: 'http://127.0.0.1:4187',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
})
