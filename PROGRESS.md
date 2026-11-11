# 实现进度（2026-11-10）

当前版本 0.2.0：在可构建、可隔离运行的首版上增加 Markdown 顶层 updated 本机保留规则。当前代码在本目录，发布分支 `main`（开发提交另保留在 `plain-directory-v1`），上游基线 `6f0190efd517b709ff21c4d77bcc0b221bce52b6`。研究检出及其未跟踪复现文件保持不动；必要复现已复制入开发检出。本轮改动在工作区内，交付源码快照也包含新增文件。

## 已完成

- 独立插件 ID `plain-directory-sync`，独立入口 `src/plain-main.ts`，本地状态 `.plain-sync`，默认不连接、不自动同步。
- `packages/plugin/src/features/plain-sync/`：流式原始哈希、完整扫描、三方比较、默认排除、碰撞处理、逐文件条件写入、完整版本、持久化意图、恢复及手动冲突选择。
- `packages/plugin/src/core/merge/` 提取并复用上游纯合并代码；原 `sync/hunks` 保持兼容出口，加密模式未导入新桌面引擎。
- 只读预览、小文件正文比较、明确执行与恢复入口；真实 Obsidian 1.14.4 独立配置及合成库操作和进程重启测试通过。
- `tools/plain/`：构建、只读扫描、CLI、两设备演示、原子/不安全模拟服务、带重叠请求体的能力探测、真实 SIGKILL 恢复测试、Obsidian UI 驱动。
- 新模式 37 项测试，另有 2 项探测器/真实进程故障测试。全仓库测试、类型、lint、模块依赖与两种构建的最终结果见验证记录和 artifacts 日志。
- 真样本只读：全量元数据 2,969 文件 / 866,538,771 字节 / 1,006 Markdown；范围内哈希 2,575 文件 / 404,571,626 字节。两次 1.18 / 1.31 秒、峰值 RSS 136 / 140 MiB；元数据和范围内内容摘要一致，无原库写入、无网络。
- 用户追加授权使用 Simple WebDAV Sync 设置后，完成科大真实只读 dry run：本地 2,575 / 远端 4,299 文件，一致 2,547、冲突 28、仅远端存在 1,724、上传/删除/未知均 0；耗时 581.8 秒。真实库与远端零文件写入、零状态写入。本地前后元数据与内容、远端两次列表与 ETag 均未发现变化。报告 `artifacts/live-dry-run-20261110/README.md`，聚合证据 `docs/plain/evidence/live-webdav-dry-run-20261110.json`。新增证据未重打包到已有 ZIP。

## 入口和运行

```sh
pnpm install --frozen-lockfile
pnpm build:plain
pnpm test:plain
pnpm demo:plain
pnpm e2e:plain
```

完整回归使用 Node 24；本机可用 `pnpm --package=node@24 dlx node /opt/homebrew/bin/pnpm test`。`pnpm arch` 也需 Node 24。全工作区 `pnpm typecheck`；`pnpm lint` 无错误（保留非阻塞提示）。

构建目录 `dist/plain-directory-sync`，归档 `dist/plain-directory-sync-0.1.0.zip`；源码快照 `dist/plain-sync-source-0.1.0.zip`。说明 `docs/plain/README.md`，设计 `docs/plain/DESIGN.md`，验证 `docs/plain/VERIFICATION.md`，可追踪聚合证据 `docs/plain/evidence/`，截图与运行日志 `artifacts/`，合成测试库 `runtime/`。

## 下一步与明确限制

1. 科大只读实测已完成；本次凭据读取仅限用户授权的 dry run，未保存凭据。条件写入与并发能力仍未实测，后续需明确允许写入合成数据的独立测试父目录；本次授权不包含写入。现有探测模板为 `tools/plain/env.example`。
2. 探测通过不等于原子保证；需结合部署实现/服务端契约决定是否开放真实写入。本版外部服务始终只读，不能用时间戳覆盖降级。
3. 本地保留被移走 inode，缓解编辑竞争；不能宣称与任意外部编辑器之间存在原子文件事务。故障模型及手动恢复方法见说明。
4. 正式安装、移动端、Windows/Linux 实机验证、空目录传播、目录重命名识别、Git、跨设备历史和历史清理不在此次完成范围。
5. 若继续开发，以本开发检出和源码快照为起点；不要重新克隆上游而丢掉本轮新增源码、测试与证据。

## 0.2.0 updated 本机保留（本轮）

- `content.ts` 流式文件头投影，`Seen` 原始/共享双哈希，`local-version.ts` 保留本机属性的持久化目标，format 2 检查点。上传、下载、采用远端、合并与恢复已接通；其他属性正常同步。旧 format 1 暂不自动迁移。
- 普通模式 67 + 工具 2 项测试通过；全仓库 3,579 项通过；类型、arch、两种构建、lint 无错误。已编译核心的两设备隔离验证通过。
- 完成真实只读 dry run：一致 2,565、冲突 5、待下载服务器副本 1,729、上传/删除/未知 0；22 项仅 updated 不同由冲突转为一致。真实库和远端零写入、前后核验无变化。
- 报告 `artifacts/live-dry-run-local-updated-20261110/README.md`；聚合证据 `docs/plain/evidence/live-webdav-local-updated-20261110.json`。新版包与源码快照为 `dist/*-0.2.0.zip`。后续仍须另行决定服务器副本处理和真实写入能力验证。

## GitHub publication (2026-11-11)

Source is published to https://github.com/LLLLAAAA2333/obsidian-content-sync on main as an initial snapshot, retaining upstream licensing and the documented source baseline. The original local research remote is retained as research. Public evidence redacts private filesystem roots, the configured endpoint and real note names; original reports and backups remain in ignored artifacts/. The CI template validates both builds, normal lint/type/architecture checks, all suites and the plain-mode fault tests. Active workflows could not be pushed with the current OAuth workflow scope, so all three are retained as inactive .github/workflow-templates/*.yml.example; no remote CI or deploy is enabled. Obsidian community-release scanner validation is outside this experimental source publication.
