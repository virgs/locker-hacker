import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

interface PackageJson {
  version?: string;
}

const readPackageVersion = (): string => {
  const packageJson = JSON.parse(
    readFileSync(new URL("./package.json", import.meta.url), "utf8"),
  ) as PackageJson;
  return packageJson.version ?? "0.0.0";
};

const appVersion = process.env.APP_VERSION ?? readPackageVersion();
const appBuildNumber = process.env.APP_BUILD_NUMBER ?? "";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/locker-hacker/' : '/',
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
    __APP_BUILD_NUMBER__: JSON.stringify(appBuildNumber),
  },
  build: {
    outDir: 'docs',
  },
}))
