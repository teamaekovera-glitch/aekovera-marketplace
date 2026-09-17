import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    // RLS integration tests run against the local/CI PostgreSQL; the unit
    // suites are pure. Single-threaded keeps multi-session role switching
    // deterministic.
    fileParallelism: false,
  },
});
