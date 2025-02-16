import { devices, defineConfig } from '@playwright/test';

export default defineConfig({
    outputDir: 'testResults',
    //globalSetup: require.resolve('./global-setup'),
    //globalTeardown: require.resolve('./global-teardown'),
    retries: 0,
    use: {
        baseURL: 'http://127.0.0.1:3000',
        trace: 'on', //'on-first-retry',
    },
    // We need consistent DB state for each test.
    // It is reset before running each test.
    workers: 1,
    timeout: 10 * 1000,
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
        env: { ...process.env, 'RCC_TESTING': 'true' },
    },
});
