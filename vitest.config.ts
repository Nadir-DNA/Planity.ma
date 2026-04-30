import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    globals: true,
    
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      include: ["src/**"],
      exclude: [
        "src/app/**", // Next.js pages (tested via E2E)
        "src/types/**",
        "src/lib/db.ts",
        "src/lib/container.ts", // DI setup
        "**/*.d.ts",
      ],
      // Progressive thresholds - start low, increase over time
      thresholds: {
        statements: 33,
        branches: 26,
        functions: 34,
        lines: 33,
      },
    },
    
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    exclude: ["tests/e2e/**", "node_modules/**"],
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
