/// <reference types="vitest/config" />
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { jobFetchProxy } from "./vite/jobFetchProxy.ts";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), jobFetchProxy()],
  resolve: {
    alias: {
      "@utils": path.resolve(rootDir, "src/utils"),
      "@components": path.resolve(rootDir, "src/components"),
      "@pages": path.resolve(rootDir, "src/pages"),
      "@store": path.resolve(rootDir, "src/store"),
      "@app-types": path.resolve(rootDir, "src/types"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
