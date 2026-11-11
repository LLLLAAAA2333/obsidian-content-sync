# 普通目录同步（桌面实验模式）

独立入口 `src/plain-main.ts` → `app/plain` → 本模块。`manifest-plain.json` 使用 `plain-directory-sync`，本地状态仅在 `.plain-sync`。没有自动启动扫描或定时同步，也不启动 MDSync 加密控制器。

- `model.ts`：范围、受控并发完整扫描、B/L/R 分类；错误使本轮全部未知，路径碰撞阻止操作。
- `files.ts`：64 KiB 流式 SHA-256；本地普通文件覆盖先移走旧 inode，再核验并 exclusive hard-link 新 inode；迟到写入仍保留在 displaced 中。
- `webdav.ts`：Depth 1 递归列举、严格解析、逐文件 GET，原子条件 PUT/DELETE；不使用共享清单。HTTP 重定向和无条件重试均不启用。
- `state.ts`：身份绑定、不可变检查点、fsync、每次操作独立进程锁、完整历史字节；损坏最新状态立即停止。
- `engine.ts`：每路径意图 → 远端 → 本地 → 双侧确认 → 基线。恢复检查实际结果，未预期的新值成为阻塞冲突；人工选择后仍保留历史。
- `core.ts` 是 CLI 的无 UI 导出；`index.ts` 是跨模块 facade；`ui/` 复用上游窗口与确认组件。

文本三方合并复用从上游提取的 `core/merge`，原 `sync/hunks` 文件继续导出兼容接口。新引擎不调用原清单发布、缓存或恢复逻辑。

限制和运行命令见 `docs/plain/README.md`。真实服务默认只读；`isolatedMock` 只允许 loopback 合成测试。此开关是测试人员对随附模拟服务的显式选择，不是任意 localhost 服务的能力认证。没有服务端保证时，不开放真实远端同步写入。未实现文件锁协议、空目录传播、历史清理、Git 或移动端。
