import { copyFile, mkdir, writeFile } from "node:fs/promises";
import { builtinModules } from "node:module";
import esbuild from "esbuild";

const external = [
	"obsidian",
	"electron",
	...builtinModules,
	...builtinModules.map((m) => `node:${m}`),
];
await mkdir("dist/plain-directory-sync", { recursive: true });
await esbuild.build({
	entryPoints: ["packages/plugin/src/features/plain-sync/core.ts"],
	bundle: true,
	platform: "node",
	format: "cjs",
	target: "node18",
	external,
	outfile: "dist/plain-core.cjs",
	alias: { "@": "./packages/plugin/src" },
});
if (!process.argv.includes("--core")) {
	await esbuild.build({
		entryPoints: ["packages/plugin/src/plain-main.ts"],
		bundle: true,
		platform: "node",
		format: "cjs",
		target: "node18",
		external,
		outfile: "dist/plain-directory-sync/main.js",
		alias: { "@": "./packages/plugin/src" },
		minify: true,
	});
	await esbuild.build({
		entryPoints: ["packages/plugin/src/plain-styles.css"],
		bundle: true,
		outfile: "dist/plain-directory-sync/styles.css",
	});
	await copyFile(
		"manifest-plain.json",
		"dist/plain-directory-sync/manifest.json",
	);
	await copyFile("LICENSE", "dist/plain-directory-sync/LICENSE");
	await copyFile(
		"node_modules/@jest/diff-sequences/LICENSE",
		"dist/plain-directory-sync/LICENSE-Jest",
	);
	await copyFile(
		"node_modules/yaml/LICENSE",
		"dist/plain-directory-sync/LICENSE-yaml",
	);
	await writeFile(
		"dist/plain-directory-sync/NOTICE",
		"Based on MDSync v1.5.1, copyright k1tbyte. Original MIT license retained. Experimental desktop plain-directory mode. Includes yaml (ISC license in LICENSE-yaml).",
	);
}
