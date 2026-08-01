import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageDirArg = process.argv[2];

if (!packageDirArg) {
  console.error("Usage: node scripts/prepare-package-dist.mjs <package-directory>");
  process.exit(1);
}

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const packageDir = resolve(repoRoot, packageDirArg);
const distDir = join(packageDir, "dist");
const packageJsonPath = join(packageDir, "package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));

if (!existsSync(distDir)) {
  console.error(`Build output missing: ${distDir}`);
  process.exit(1);
}

const extraExports = packageJson.synaravaPackage?.extraExports ?? {};
const copyFiles = packageJson.synaravaPackage?.copyFiles ?? [];

for (const relativePath of copyFiles) {
  const sourcePath = join(packageDir, relativePath);
  const destinationPath = join(distDir, basename(relativePath));
  mkdirSync(dirname(destinationPath), { recursive: true });
  cpSync(sourcePath, destinationPath);
}

cpSync(join(packageDir, "README.md"), join(distDir, "README.md"));

const distPackageJson = {
  name: packageJson.name,
  version: packageJson.version,
  description: packageJson.description,
  type: "module",
  main: "./index.js",
  module: "./index.js",
  types: "./index.d.ts",
  exports: {
    ".": {
      types: "./index.d.ts",
      import: "./index.js",
      default: "./index.js"
    },
    ...extraExports,
    "./package.json": "./package.json"
  },
  files: ["**/*"],
  publishConfig: {
    access: packageJson.publishConfig?.access ?? "restricted"
  },
  peerDependencies: packageJson.peerDependencies,
  peerDependenciesMeta: packageJson.peerDependenciesMeta,
  dependencies: packageJson.dependencies,
  keywords: packageJson.keywords,
  license: packageJson.license,
  homepage: packageJson.homepage,
  repository: packageJson.repository,
  sideEffects: Object.keys(extraExports).length > 0 ? ["**/*.css"] : false
};

writeFileSync(
  join(distDir, "package.json"),
  `${JSON.stringify(distPackageJson, null, 2)}\n`,
  "utf8"
);
