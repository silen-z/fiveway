import { defineConfig } from "vite-plus";

export default defineConfig({
  run: {
    tasks: {
      ci: {
        command: "vp check && vp test run --coverage",
        dependsOn: [
          "@fiveway/core#build",
          "@fiveway/react#build",
          "@fiveway/solid#build",
          "@fiveway/devtools#build",
        ],
      },
      dev: {
        command:
          "pnpm run --parallel --filter @fiveway/core --filter @fiveway/react --filter @fiveway/solid dev",
      },
      "example:react": {
        command: "vp run @fiveway/react-example#dev",
        dependsOn: ["@fiveway/core#build", "@fiveway/react#build", "@fiveway/devtools#build"],
      },
      "example:solid": {
        command: "vp run @fiveway/solid-example#dev",
        dependsOn: ["@fiveway/core#build", "@fiveway/solid#build", "@fiveway/devtools#build"],
      },
    },
  },
  lint: {
    ignorePatterns: ["packages/fiveway-extension"],
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
