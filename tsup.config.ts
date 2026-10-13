import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  outDir: "build",
  format: ["esm"],
  clean: true,
  target: "node24",
  skipNodeModulesBundle: true,
});
