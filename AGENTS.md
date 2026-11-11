# Obsidian Content Sync

独立桌面 Obsidian 插件。`src/sync` 是普通目录同步引擎，`src/ui` 是原生 Obsidian 界面，`src/merge` 仅保留有来源标注的纯文本算法。没有 MDSync 服务、协议包或构建依赖。

- Node 24、pnpm 10；`pnpm check` 检查格式、类型、构建和模块边界；`pnpm test` 运行单元测试及模拟服务故障测试；`pnpm e2e` 仅启动隔离 Obsidian 配置与合成库。
- 保留原始 SHA-256 用于前提核验和恢复。Markdown 顶层 YAML 的 `updated` 只留本机，另用共享内容哈希判断一致性；其他属性照常同步。
- 未知不是缺失。预览零写入；新建、覆盖和删除必须有前提；恢复先观察结果。原始版本及持久化目标不可自动清理。
- 外部 WebDAV 写入保持禁用；只有显式配置的本机模拟服务可写。真实库只读，测试写入只用 `runtime/` 下合成库。
- 凭据不进入代码、日志、报告或 Git；公开证据只保留脱敏聚合结果。`artifacts/` 中原始记录不可发布。
- 提取自 MDSync 的代码必须保留 MIT 许可证与 `THIRD_PARTY_NOTICES.md` 来源说明；不要恢复无关的上游系统。
- GitHub Actions 模板尚未启用；不要自动启用发布或部署。
