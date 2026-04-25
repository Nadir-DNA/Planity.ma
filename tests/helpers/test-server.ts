/**
 * Test server setup for integration tests.
 *
 * Provides a lightweight test server wrapper for Next.js API routes.
 * In CI environments, this connects to a running Next.js dev server.
 * In local environments, it can start/stop the server automatically.
 */

export interface TestServerConfig {
  baseUrl: string;
  timeout: number;
}

const defaultConfig: TestServerConfig = {
  baseUrl: process.env.TEST_API_URL || "http://localhost:3000/api/v1",
  timeout: 30000,
};

let serverConfig: TestServerConfig = defaultConfig;

/**
 * Configure the test server URL.
 */
export function configureTestServer(config: Partial<TestServerConfig>): void {
  serverConfig = { ...defaultConfig, ...config };
}

/**
 * Get the current test server configuration.
 */
export function getTestServerConfig(): TestServerConfig {
  return serverConfig;
}

/**
 * Check if the test server is reachable.
 */
export async function isServerReady(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${serverConfig.baseUrl.replace("/api/v1", "")}/`, {
      signal: controller.signal,
    });

    clearTimeout(timeout);
    return response.status < 500;
  } catch {
    return false;
  }
}

/**
 * Wait for the server to be ready with retries.
 */
export async function waitForServer(
  maxRetries = 12,
  delayMs = 5000
): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    if (await isServerReady()) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return false;
}
