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
        reuseExistingServer: !process.env.CI,
    },
});
