import { devices, defineConfig } from '@playwright/test';
// @ts-ignore
import { quote } from 'shell-quote'
import path from 'node:path'

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
        command: quote([path.join(import.meta.dirname, 'node_modules', '.bin', 'next'), 'dev', '--turbopack']),
        cwd: import.meta.dirname,
        url: 'http://127.0.0.1:3000',
        reuseExistingServer: false,
        env: {
            ...process.env,
            RCC_TESTING: 'true',
            DATABASE_URL: 'file:./test.db',
        }
    },
});
