import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html', { open: 'never' }], [
    '@qualitywatcher/playwright-reporter',
    {
      apiKey: process.env.QUALITY_WATCHER_API_KEY || "qj3i0nq4539j2r9j3i0nq4539j2r9j3i0nq4539j2r9j3i0nq4539j2r9",
      projectId: process.env.QUALITY_WATCHER_PROJECT_ID || "8",
      testRunName: `${new Date().toLocaleDateString(
        'en-US'
      )} - automated run`,
      description: `triggered by automated run`,
      includeAllCases: true, // true/false
      complete: true, // optional - mark test run as completed to lock results
      includeCaseWithoutId: true, // optional - store results without mapping suite and case IDs
      excludeSkipped: false, // optional - whether or not to track skipped results
    },
  ],],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: process.env.REST_API_BASE_URL || 'https://your-api-domain.com',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Timeout for API requests */
    timeout: 30000,
  },

  /* Configure projects for API testing */
  projects: [
    {
      name: 'api-tests',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
