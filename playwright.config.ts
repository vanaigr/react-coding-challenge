import { devices, defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './test',
    outputDir: 'testResults',
    retries: 0,
    use: {
        baseURL: 'http://127.0.0.1:3000',
        //trace: 'on',
        trace: 'on-first-retry',
    },
    // We need consistent DB state for each test.
    // It is reset before running each test.
    workers: 1,
    timeout: 60 * 1000,
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    webServer: {
        command: './node_modules/.bin/next dev --turbopack',
        url: 'http://127.0.0.1:3000',
        reuseExistingServer: false,
        env: {
            ...process.env,
            'RCC_TESTING': 'true',
            'DATABASE_URL': "file:./test.db"
        },
    },
});
