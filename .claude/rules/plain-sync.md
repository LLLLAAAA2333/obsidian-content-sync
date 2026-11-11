---
paths:
  - 'packages/plugin/src/features/plain-sync/**'
  - 'packages/plugin/src/app/plain/**'
  - 'packages/plugin/src/plain-main.ts'
  - 'packages/plugin/tests/features/plain-sync/**'
  - 'tools/plain/**'
---

# Plain-directory experimental mode

This separately bundled desktop-only plugin may use Node filesystem/HTTP APIs for bounded streaming. The mobile encrypted entry must not import it. Domain order includes plain-sync after sync; its pure merge dependency is core/merge. The old sync/hunks exports remain compatible.

Read every raw byte and retain raw SHA-256 for preconditions and recovery; never use the encrypted scanner's timestamp cache or manifest. For Markdown, compare a second SHA-256 after removing only the top-level YAML `updated` property. Upload this shared representation; restore the existing device-local `updated` on download and resolution, preserving absence for new notes. Other properties, nested updated and body text remain shared. Keep frontmatter parsing bounded and fail closed on ambiguous YAML. Format-2 journals contain shared baselines and separate durable local target hashes; never reinterpret format-1 checkpoints. Errors are unknown, not absence. Preview performs no writes. Metadata and configs are excluded on both sides. No unguarded remote mutation or automatic retries. Only explicitly selected loopback synthetic mock mode can write in this build. Probe observations alone cannot enable production writes.

Archive both raw observed sides and their shared representations before mutation; intent must be durable first. Preserve displaced local inodes, including late editor writes. Checkpoints and byte versions are never garbage collected. A damaged newest checkpoint stops the engine. Interrupted operations observe both sides before continuing; newer edits block. A per-file baseline advances only after verified agreement.

Real sample vault is read-only. Synthetic test writes belong in runtime/ or artifacts/ in this checkout. Never install the plugin in the sample. Read original plugin credentials only with explicit user authorization for the scoped read-only task; keep credentials in memory, never in reports. Reports contain aggregate metrics, paths, hashes and synthetic data only.
