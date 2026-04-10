import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    include: ["tests/ui/**/*.test.tsx"],
    globals: true,
    setupFiles: ["./tests/ui/setup.ts"],
  },
});
