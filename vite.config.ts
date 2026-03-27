import { defineConfig } from "vite-plus";

export default defineConfig({
  lint: {
    plugins: ["unicorn", "typescript", "oxc", "import", "react", "vitest"],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },

  test: {
    projects: ["packages/*"],
    coverage: {
      reporter: ["text", "json", "json-summary"],
      reportOnFailure: true,
    },
  },

  fmt: {
    sortImports: {},
  },
});
