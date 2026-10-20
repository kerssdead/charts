import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
    testDir: './e2e',
    testMatch: /.*\.spec\.ts/,
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: 1,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'list',
    use: {
        locale: 'en-US',
        timezoneId: 'UTC',
        colorScheme: 'light',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        viewport: {
            width: 1280,
            height: 720
        }
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] }
        }
    ]
})