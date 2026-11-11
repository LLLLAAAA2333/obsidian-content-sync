import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import {
	copyFile,
	mkdir,
	readdir,
	readFile,
	writeFile,
} from "node:fs/promises";
import net from "node:net";
import { join, resolve } from "node:path";
import { chromium } from "playwright-core";
import { startMock } from "./mock-server.mjs";

const root = resolve("runtime", `obsidian-${Date.now()}`),
	vault = join(root, "vault"),
	profile = join(root, "profile");
const plugin = join(vault, ".obsidian/plugins/plain-directory-sync");
await mkdir(plugin, { recursive: true });
await mkdir(profile, { recursive: true });
await mkdir("artifacts", { recursive: true });
for (const file of ["main.js", "styles.css", "manifest.json"])
	await copyFile(join("dist/plain-directory-sync", file), join(plugin, file));
const server = await startMock();
let child, browser, page, mainPage;
await writeFile(
	join(plugin, "data.json"),
	JSON.stringify({ url: server.url, username: "", mock: true }),
);
await writeFile(
	join(vault, ".obsidian/community-plugins.json"),
	JSON.stringify(["plain-directory-sync"]),
);
await writeFile(
	join(profile, "obsidian.json"),
	JSON.stringify({
		vaults: { "1234567890abcdef": { path: vault, ts: Date.now(), open: true } },
	}),
);
await writeFile(join(vault, "same.md"), "same bytes".repeat(200));
await writeFile(join(vault, "conflict.md"), "local choice");
await writeFile(join(vault, "upload.md"), "upload");
server.put("same.md", "same bytes".repeat(200));
server.put("conflict.md", "remote choice");
server.put("attachment.custom", Buffer.from([0, 255, 10]));
const errors = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function port() {
	const s = net.createServer();
	s.listen(0, "127.0.0.1");
	await once(s, "listening");
	const p = s.address().port;
	await new Promise((r) => s.close(r));
	return p;
}
async function start() {
	const p = await port();
	child = spawn(
		"/Applications/Obsidian.app/Contents/MacOS/Obsidian",
		[`--user-data-dir=${profile}`, `--remote-debugging-port=${p}`],
		{ stdio: ["ignore", "pipe", "pipe"] },
	);
	child.stdout.on("data", () => {});
	child.stderr.on("data", () => {});
	for (let i = 0; i < 120; i++) {
		if (child.exitCode !== null) throw new Error("Isolated Obsidian exited");
		try {
			browser = await chromium.connectOverCDP(`http://127.0.0.1:${p}`);
			page = browser
				.contexts()
				.flatMap((c) => c.pages())
				.find((p) => p.url().startsWith("app://obsidian.md"));
			if (page) break;
			await browser.close();
		} catch {}
		await sleep(250);
	}
	if (!page) throw new Error("No isolated Obsidian page");
	page.on("pageerror", (e) => errors.push(e.message));
	page.on("console", (msg) => {
		if (msg.type() === "error") errors.push(msg.text());
	});
	for (let i = 0; i < 120; i++) {
		for (const candidate of browser.contexts().flatMap((c) => c.pages())) {
			const trust = candidate.getByRole("button", {
				name: /trust author and enable plugins|信任作者.*启用|信任.*启用插件/i,
			});
			if (await trust.isVisible()) await trust.click();
		}
		if (i === 40)
			await page.evaluate(async (expected) => {
				if (app.vault.adapter.getBasePath() !== expected)
					throw new Error("Wrong test vault");
				await app.plugins.enablePluginAndSave("plain-directory-sync");
			}, vault);

		if (
			await page.evaluate(
				() =>
					typeof app !== "undefined" &&
					Boolean(app?.plugins?.plugins?.["plain-directory-sync"]?.host),
			)
		)
			break;
		await sleep(250);
	}
	assert.equal(
		await page.evaluate(() => app.vault.adapter.getBasePath()),
		vault,
	);
	if (
		!(await page.evaluate(() =>
			Boolean(app.plugins.plugins["plain-directory-sync"]),
		))
	) {
		await page.screenshot({ path: "artifacts/obsidian-boot-failure.png" });
		console.log(
			JSON.stringify({ errors, body: await page.locator("body").innerText() }),
		);
		throw new Error("Plugin failed to load");
	}
}
async function stop() {
	if (browser) await browser.close().catch(() => {});
	if (child && child.exitCode === null) {
		const done = once(child, "exit");
		child.kill("SIGTERM");
		await done;
	}
	page = undefined;
	browser = undefined;
}
async function confirmButton(name) {
	for (let i = 0; i < 100; i++) {
		for (const candidate of browser.contexts().flatMap((c) => c.pages())) {
			const button = candidate.getByRole("button", { name, exact: true });
			if (await button.isVisible()) {
				await button.click();
				return;
			}
		}
		await sleep(100);
	}
	throw new Error("Confirmation window not found");
}
async function open() {
	mainPage = page;
	await mainPage.waitForFunction(() => app.workspace.layoutReady === true);
	await mainPage.getByLabel("普通目录同步", { exact: true }).click();
	for (let i = 0; i < 100; i++) {
		const candidates = browser.contexts().flatMap((c) => c.pages());
		for (const candidate of candidates)
			if (await candidate.locator(".mdsync-plain-modal").count()) {
				page = candidate;
				break;
			}
		if (await page.locator(".mdsync-plain-modal").count()) break;
		await sleep(100);
	}

	await page.getByRole("button", { name: "完整核验 / 刷新预览" }).click();
	await page.waitForFunction(
		() =>
			document.querySelector(".mdsync-plain-summary") &&
			!document
				.querySelector(".mdsync-plain-status")
				?.textContent.includes("正在"),
	);
}
try {
	await start();
	await open();
	assert.equal((await readdir(vault)).includes(".plain-sync"), false);
	await page.screenshot({ path: "artifacts/obsidian-preview.png" });
	await page.setViewportSize({ width: 560, height: 700 });
	await page.screenshot({ path: "artifacts/obsidian-narrow.png" });
	await page.setViewportSize({ width: 900, height: 700 });
	await page.getByRole("button", { name: "比较内容", exact: true }).click();
	let comparison;
	for (let i = 0; i < 100 && !comparison; i++) {
		for (const candidate of browser.contexts().flatMap((c) => c.pages()))
			if (await candidate.locator('textarea[aria-label="本地"]').count()) {
				comparison = candidate;
				break;
			}
		if (!comparison) await sleep(100);
	}
	if (!comparison) throw new Error("Comparison window missing");
	assert.equal(
		await comparison.locator('textarea[aria-label="本地"]').inputValue(),
		"local choice",
	);
	assert.equal(
		await comparison.locator('textarea[aria-label="远端"]').inputValue(),
		"remote choice",
	);
	await comparison.screenshot({ path: "artifacts/obsidian-comparison.png" });
	await comparison.locator('textarea[aria-label="本地"]').click();
	await comparison.keyboard.press("Escape");
	assert.equal((await readdir(vault)).includes(".plain-sync"), false);

	assert.match(
		await page.locator(".mdsync-plain-summary").innerText(),
		/计划改写 2 个文件 · 冲突 1/,
	);
	await page.getByRole("button", { name: "执行当前计划", exact: true }).click();
	await confirmButton("执行同步");
	await page.waitForFunction(() =>
		document
			.querySelector(".mdsync-plain-summary")
			?.textContent.includes("计划改写 0 个文件"),
	);
	assert.deepEqual(
		await readFile(join(vault, "attachment.custom")),
		Buffer.from([0, 255, 10]),
	);
	await page.getByRole("button", { name: "采用远端", exact: true }).click();
	await confirmButton("应用选择");
	await page.waitForFunction(() =>
		document
			.querySelector(".mdsync-plain-summary")
			?.textContent.includes("冲突 0"),
	);
	assert.equal(
		await readFile(join(vault, "conflict.md"), "utf8"),
		"remote choice",
	);
	await writeFile(join(vault, "upload.md"), "lost response version");
	await page.getByRole("button", { name: "完整核验 / 刷新预览" }).click();
	await page.waitForFunction(() =>
		document
			.querySelector(".mdsync-plain-summary")
			?.textContent.includes("计划改写 1 个文件"),
	);
	server.hooks.loseResponse = true;
	await page.getByRole("button", { name: "执行当前计划", exact: true }).click();
	await confirmButton("执行同步");
	await page.waitForFunction(() =>
		document
			.querySelector(".mdsync-plain-status")
			?.textContent.includes("操作已停止"),
	);
	const writes = server.counters.put;
	await stop();
	await start();
	await open();
	await page.getByRole("button", { name: "恢复未完成操作" }).click();
	await page.waitForFunction(
		() =>
			document
				.querySelector(".mdsync-plain-summary")
				?.textContent.includes("冲突 0") &&
			!document
				.querySelector(".mdsync-plain-status")
				?.textContent.includes("正在"),
	);
	assert.equal(server.counters.put, writes);
	await page.screenshot({ path: "artifacts/obsidian-recovered.png" });
	assert.deepEqual(errors, []);
	const result = {
		passed: true,
		root,
		vault,
		pluginId: "plain-directory-sync",
		obsidian: "1.14.4 (visible app title)",
		checks: [
			"preview creates no metadata",
			"native preview and execute controls",
			"read-only text comparison and narrow desktop layout",
			"attachment bytes",
			"explicit conflict resolution",
			"lost response visible error",
			"real process restart and idempotent recovery",
		],
		errors,
		requests: server.counters,
	};
	await writeFile(
		"artifacts/obsidian-e2e.json",
		JSON.stringify(result, null, 2),
	);
	console.log(JSON.stringify(result, null, 2));
} catch (error) {
	if (page) {
		await page.screenshot({ path: "artifacts/obsidian-failure.png" });
		console.log(
			JSON.stringify({ errors, body: await page.locator("body").innerText() }),
		);
	}
	throw error;
} finally {
	await stop();
	await server.stop();
}
