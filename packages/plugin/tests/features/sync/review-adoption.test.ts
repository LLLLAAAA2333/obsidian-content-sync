import { FakeStorage } from "@tests/helpers/fake-storage";
import { TestSession, useEncryptionKey } from "@tests/helpers/session";
import { describe, expect, it } from "vitest";
import { REMOTE_MANIFEST_KEY } from "@/core/constants";
import { pushKey } from "@/features/sync/history/remote";
import { pullPathsOp } from "@/features/sync/operations/pull";
import { pushPathsOp } from "@/features/sync/operations/push";
import { fetchRemoteManifest } from "@/features/sync/remote/manifest";
import { EChangeType } from "@/features/sync/types";

useEncryptionKey();

describe("independent review: plain WebDAV adoption and content comparison", () => {
	it("does not import ordinary remote files when no encrypted manifest exists", async () => {
		const storage = new FakeStorage();
		const plain = new TextEncoder().encode("same content");
		storage.map.set("note.md", plain);
		storage.map.set("remote-only.md", new TextEncoder().encode("only remote"));
		const a = new TestSession("A", storage);
		a.adapter.putText("note.md", "same content");
		const compared = await a.compare();
		expect(compared.remote).toBeNull();
		expect(compared.diff.localChanges.map((c) => c.path)).toEqual(["note.md"]);
		expect(compared.diff.remoteChanges).toEqual([]);
		await pushPathsOp(a.deps(), compared, ["note.md"], a.context());
		expect(storage.map.has(REMOTE_MANIFEST_KEY)).toBe(true);
		expect(
			[...storage.map.keys()].some((key) => key.startsWith("objects/")),
		).toBe(true);
		expect(storage.map.get("note.md")).toEqual(plain);
		const b = new TestSession("B", storage);
		const other = await b.compare();
		expect(Object.keys(other.remote?.files ?? {})).toEqual(["note.md"]);
		expect(other.diff.remoteChanges.map((c) => c.path)).toEqual(["note.md"]);
	});

	it("ignores a timestamp-only local change in an MDSync-managed vault", async () => {
		const a = new TestSession();
		a.adapter.putText("note.md", "same");
		await pushPathsOp(a.deps(), await a.compare(), ["note.md"], a.context());
		a.adapter.setMtime("note.md", 1_000_000);
		const compared = await a.compare();
		expect(compared.diff.localChanges).toEqual([]);
		expect(compared.diff.remoteChanges).toEqual([]);
		expect(compared.diff.conflicts).toEqual([]);
	});

	it("recognizes matching bytes on a new device connected to an MDSync manifest", async () => {
		const storage = new FakeStorage();
		const a = new TestSession("A", storage);
		a.adapter.putText("note.md", "same");
		await pushPathsOp(a.deps(), await a.compare(), ["note.md"], a.context());
		const b = new TestSession("B", storage);
		b.adapter.putText("note.md", "same");
		b.adapter.setMtime("note.md", 8_000_000);
		const compared = await b.compare();
		expect(compared.diff.localChanges).toEqual([]);
		expect(compared.diff.remoteChanges).toEqual([]);
		expect(compared.diff.conflicts).toEqual([]);
		expect(compared.diff.converged).toEqual(["note.md"]);
	});

	it("reuses a stale hash if external content changes keep old size and mtime", async () => {
		const a = new TestSession();
		a.adapter.putText("note.md", "base");
		a.adapter.setMtime("note.md", 1_000);
		await pushPathsOp(a.deps(), await a.compare(), ["note.md"], a.context());
		a.adapter.putText("note.md", "EDIT");
		a.adapter.setMtime("note.md", 1_000);
		const compared = await a.compare();
		expect(compared.diff.localChanges).toEqual([]);
		expect(compared.snapshot.files["note.md"]?.hash).toBe(
			a.state.baseline?.files["note.md"]?.hash,
		);
	});
});

class DelayedPutStorage extends FakeStorage {
	private pause: { reached: () => void; resume: Promise<void> } | null = null;
	arm() {
		let reached!: () => void;
		let release!: () => void;
		const entered = new Promise<void>((resolve) => {
			reached = resolve;
		});
		const resume = new Promise<void>((resolve) => {
			release = resolve;
		});
		this.pause = { reached, resume };
		return { entered, release };
	}
	override async put(key: string, body: Uint8Array): Promise<void> {
		if (key === REMOTE_MANIFEST_KEY && this.pause) {
			const pending = this.pause;
			this.pause = null;
			pending.reached();
			await pending.resume;
		}
		await super.put(key, body);
	}
}

describe("independent review: publication read-check-write race", () => {
	it("lets both pushes succeed, then presents the overwritten addition as a remote deletion", async () => {
		const storage = new DelayedPutStorage();
		const a = new TestSession("A", storage);
		const b = new TestSession("B", storage);
		const depsA = () => ({ ...a.deps(), history: { horizon: null } });
		const depsB = () => ({ ...b.deps(), history: { horizon: null } });
		a.adapter.putText("common.md", "shared base");
		await pushPathsOp(depsA(), await a.compare(), ["common.md"], a.context());
		await pullPathsOp(b.deps(), await b.compare(), ["common.md"], b.context());
		a.adapter.putText("a.md", "A's new note");
		b.adapter.putText("b.md", "B's new note");
		const ca = await a.compare();
		const cb = await b.compare();
		const gate = storage.arm();
		// B has passed the parent precheck when its PUT reaches this gate.
		const pushingB = pushPathsOp(depsB(), cb, ["b.md"], b.context());
		await gate.entered;
		await pushPathsOp(depsA(), ca, ["a.md"], a.context());
		const publishedHash = a.state.baseline?.files["a.md"]?.hash;
		const publishedSnapshot = a.state.baseline?.snapshotId;
		gate.release();
		await pushingB;
		const head = await fetchRemoteManifest(storage, a.deps().key, "");
		expect(Object.keys(head?.files ?? {}).sort()).toEqual([
			"b.md",
			"common.md",
		]);
		const after = await a.compare();
		expect(after.diff.conflicts).toEqual([]);
		expect(after.diff.remoteChanges).toContainEqual(
			expect.objectContaining({ path: "a.md", type: EChangeType.RemoteDelete }),
		);
		await pullPathsOp(a.deps(), after, ["a.md"], a.context());
		expect(a.adapter.hasFile("a.md")).toBe(false);
		expect(a.adapter.hasFile(".trash/a.md")).toBe(false);
		expect(storage.map.has(`objects/${publishedHash}`)).toBe(true);
		expect(storage.map.has(pushKey(publishedSnapshot!))).toBe(true);
		console.log(
			"REVIEW_RACE: both pushes reported success; HEAD omits a.md; next pull deletes local a.md without a conflict; encrypted content and history record still exist",
		);
	});
});
