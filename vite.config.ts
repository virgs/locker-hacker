import { readFileSync } from "node:fs";
import { defineConfig, loadEnv } from "vite";
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

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const appVersion = env.APP_VERSION || readPackageVersion();
  const appBuildNumber = env.APP_BUILD_NUMBER || "";

  return {
    plugins: [react()],
    base: mode === "production" ? "/locker-hacker/" : "/",
    define: {
      "import.meta.env.VITE_APP_VERSION": JSON.stringify(appVersion),
      "import.meta.env.VITE_APP_BUILD_NUMBER": JSON.stringify(appBuildNumber),
    },
    build: {
      outDir: "docs",
    },
  };
});
