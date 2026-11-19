import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
    testDir: './e2e',
    testMatch: /.*\.spec\.ts/,
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: 0,
    workers: 1,
    timeout: 180_000,
    reporter: 'list',
    use: {
        locale: 'en-US',
        timezoneId: 'UTC',
        colorScheme: 'light',
        viewport: {
            width: 1280,
            height: 900
        }
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] }
        }
    ]
})