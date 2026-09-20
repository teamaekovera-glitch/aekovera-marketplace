import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  esbuild: { jsx: "automatic" },
  test: {
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    environment: "node",
    // RLS integration tests run against the local/CI PostgreSQL; the unit
    // suites are pure. Single-threaded keeps multi-session role switching
    // deterministic.
    fileParallelism: false,
  },
});
