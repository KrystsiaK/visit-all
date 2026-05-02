import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["__tests__/ui/**/*.test.tsx"],
    globals: true,
    setupFiles: ["./setup-tests.ts"],
  },
});
