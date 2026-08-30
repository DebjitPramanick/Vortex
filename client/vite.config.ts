/// <reference types="vitest/config" />
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { jobFetchProxy } from "./vite/jobFetchProxy.ts";
import svgr from "vite-plugin-svgr";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    jobFetchProxy(),
    svgr({
      include: "**/*.svg",
    }),
  ],
  resolve: {
    alias: {
      "@utils": path.resolve(rootDir, "src/utils"),
      "@components": path.resolve(rootDir, "src/components"),
      "@pages": path.resolve(rootDir, "src/pages"),
      "@store": path.resolve(rootDir, "src/store"),
      "@app-types": path.resolve(rootDir, "src/types"),
      "@icons": path.resolve(rootDir, "src/icons"),
      "@services": path.resolve(rootDir, "src/services"),
      "@constants": path.resolve(rootDir, "src/constants"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
