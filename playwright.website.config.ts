import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  reporter: 'line',
  testDir: './test/browser',
  testMatch: 'website.spec.ts',
  use: { baseURL: 'http://127.0.0.1:4188', ...devices['Desktop Chrome'] },
  webServer: {
    command:
      'vite --config website/vite.config.ts --host 127.0.0.1 --port 4188',
    reuseExistingServer: !process.env.CI,
    url: 'http://127.0.0.1:4188',
  },
})
