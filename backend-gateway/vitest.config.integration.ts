import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["**/*.integration.spec.ts"],
		globals: true,
		root: "./",
		environment: "node",
		testTimeout: 120000, // Longer timeout for real network and LLM calls
	},
	plugins: [
		swc.vite({
			module: { type: "es6" },
		}),
	],
});
