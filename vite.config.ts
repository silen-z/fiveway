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
					"@fiveway/inspector#build",
				],
			},
			preparePublish: {
				command: "true",
				dependsOn: [
					"@fiveway/core#build",
					"@fiveway/react#build",
					"@fiveway/solid#build",
					"@fiveway/inspector#build",
				],
			},
			"example:react": {
				command: "vp run @fiveway/react-example#dev",
				dependsOn: ["@fiveway/core#build", "@fiveway/react#build"],
			},
			"example:solid": {
				command: "vp run @fiveway/solid-example#dev",
				dependsOn: ["@fiveway/core#build", "@fiveway/solid#build"],
			},
		},
	},

	test: {
		projects: ["packages/*"],
		coverage: {
			reporter: ["text", "json", "json-summary"],
			reportOnFailure: true,
		},
	},

	lint: {
		plugins: ["unicorn", "typescript", "oxc", "import", "react", "vitest"],
		options: {
			typeAware: true,
			typeCheck: true,
		},
		rules: {
			"import/consistent-type-specifier-style": ["error", "prefer-inline"],
		},
	},

	fmt: {
		useTabs: true,
		sortImports: true,
	},
});
