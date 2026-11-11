# Third-party code

## MDSync

Copyright (c) k1tbyte. MIT license, retained in [LICENSE](LICENSE).
Source baseline: [MDSync v1.5.1, 6f0190e](https://github.com/k1tbyte/mdsync/tree/6f0190efd517b709ff21c4d77bcc0b221bce52b6).

Historical inventory: versions 0.1.0–0.3.0 included these derived pure algorithms (0.3.0 paths shown):

| Local file | Original source |
| --- | --- |
| `src/merge/anchored-hunks.ts` | `packages/plugin/src/features/sync/hunks/anchored-hunks.ts` |
| `src/merge/merge-model.ts` | `packages/plugin/src/features/sync/hunks/merge-model.ts` |
| `src/merge/diff.ts` | `packages/plugin/src/core/utils/diff.ts` |
| `src/merge/eol.ts` | `packages/plugin/src/core/utils/eol.ts` |

The two associated test files (`anchored-hunks.test.ts`, `merge-model.test.ts`) were also derived from MDSync. The former `budget.ts` retained its comparison limit; `index.ts` was a local facade.

In 0.4.0 these four implementations, the old budget and both derived test files were removed; the facade was replaced. New `text-merge.ts`, `limits.ts`, and contract tests were written from the documented behavior contract, using `@jest/diff-sequences` as a general-purpose LCS dependency. The engine no longer imports the old helpers or normalizes merged line endings. This is not a claim of strict clean-room development: the project began from MDSync, and prior implementation interfaces and provenance were known during development.

A local audit of all current src/tests/tools files found no unchanged whole-file matches with the upstream baseline; this does not prove absence of derivative fragments. See `docs/evidence/merge-source-audit.json` and `docs/SLIMMING.md` for scope. The original MIT copyright and license remain unchanged. Git history and historical evidence remain available. Replacement does not establish eligibility under the Obsidian community policy; publication requires separate review.

The plugin has no runtime, build or package dependency on MDSync itself.

## Packaged libraries

- `@jest/diff-sequences`: MIT, license copied to `LICENSE-Jest` in the build.
- `yaml`: ISC, license copied to `LICENSE-yaml` in the build.
- Obsidian is the host application; its API is external to the bundle.
