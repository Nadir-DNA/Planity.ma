/**
 * MSW Browser Setup for E2E/Playwright tests
 */

import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);

export async function setupMockWorker() {
  return worker.start({ onUnhandledRequest: "bypass" });
}
