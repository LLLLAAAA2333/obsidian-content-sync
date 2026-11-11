import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const { core, plugin } = JSON.parse(
	await readFile("dist/build-meta.json", "utf8"),
);
for (const build of [core, plugin]) {
	for (const path of Object.keys(build.inputs)) {
		assert.ok(
			path.startsWith("src/") || path.startsWith("node_modules/"),
			`Unexpected module: ${path}`,
		);
		assert.ok(
			!/mdsync|packages\/|core\/crypto|core\/protocol/.test(path),
			`Upstream system dependency: ${path}`,
		);
	}
}
assert.ok(
	Object.keys(core.inputs).every((p) => !p.startsWith("src/ui/")),
	"Engine imports UI",
);
const deps = JSON.parse(await readFile("package.json", "utf8")).dependencies;
assert.deepEqual(Object.keys(deps).sort(), ["@jest/diff-sequences", "yaml"]);
console.log(
	"Standalone boundaries verified: no MDSync package or system imports.",
);
