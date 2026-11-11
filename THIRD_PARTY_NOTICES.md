# Third-party code

## MDSync

Copyright (c) k1tbyte. MIT license, retained in [LICENSE](LICENSE).
Source baseline: [MDSync v1.5.1, 6f0190e](https://github.com/k1tbyte/mdsync/tree/6f0190efd517b709ff21c4d77bcc0b221bce52b6).

The following pure algorithms are retained with local import changes:

| Local file | Original source |
| --- | --- |
| `src/merge/anchored-hunks.ts` | `packages/plugin/src/features/sync/hunks/anchored-hunks.ts` |
| `src/merge/merge-model.ts` | `packages/plugin/src/features/sync/hunks/merge-model.ts` |
| `src/merge/diff.ts` | `packages/plugin/src/core/utils/diff.ts` |
| `src/merge/eol.ts` | `packages/plugin/src/core/utils/eol.ts` |

The associated merge tests in `tests/merge/` are also derived from MDSync.
`budget.ts` retains the algorithm's comparison limit; `index.ts` is a local facade.
The plugin has no runtime, build or package dependency on MDSync itself.

## Packaged libraries

- `@jest/diff-sequences`: MIT, license copied to `LICENSE-Jest` in the build.
- `yaml`: ISC, license copied to `LICENSE-yaml` in the build.
- Obsidian is the host application; its API is external to the bundle.
