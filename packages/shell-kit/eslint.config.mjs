import { defineConfig } from "eslint/config";
/**
 * @synarava/shell-kit — isolated lint rules.
 * Import this config from the root eslint.config.mjs to enforce
 * the self-containment boundary.
 */
export const shellKitRules = {
  files: ["packages/shell-kit/src/**/*.{ts,tsx}"],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["@/*"],
            message:
              "@synarava/shell-kit must use relative imports only. No host path aliases.",
          },
          {
            group: ["next", "next/*"],
            message:
              "@synarava/shell-kit must not depend on Next.js.",
          },
        ],
      },
    ],
  },
};
// Standalone config for `npm run lint` inside the package
const config = defineConfig([shellKitRules]);
export default config;
