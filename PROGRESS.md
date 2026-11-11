# 当前进度：0.3.0 独立插件

代码位于本目录，标准入口为 `src/main.ts`。直接运行 `pnpm install --frozen-lockfile`、`pnpm check`、`pnpm test`。真实 Obsidian 隔离验证使用 `pnpm e2e`。

本轮完成单包化、移除 MDSync 框架与无关系统、原生界面辅助代码、合并算法明确归属、独立构建/测试和干净目录复现。85 项单元测试、2 项故障测试及隔离实机测试通过。同步规则与 format 2 状态保持 0.2.0 兼容。

- 设计和限制：docs/DESIGN.md
- 占比与精简：docs/SLIMMING.md
- 验证结果：docs/VERIFICATION.md
- 本地详细日志：artifacts/standalone-refactor/
- 历史完整代码：Git 父提交及 archive/mdsync-monorepo-0.2.0 分支

外部 WebDAV 仍只读，真实服务写入能力需另行验证；远端服务器副本的清理不在此次范围。GitHub CI 模板未启用。本轮未访问真实笔记或远端数据。
