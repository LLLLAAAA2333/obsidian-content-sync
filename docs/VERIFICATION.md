# 0.3.0 独立版验证（2026-11-11）

- 构建、TypeScript 检查与实际模块图边界检查通过，没有 MDSync 包、协议、加密或服务端代码进入构建。
- 85 项单元测试通过：原普通模式 67 项全部保留，另外保留与所用合并算法对应的 18 项回归测试。原仓库其他系统的测试随对应系统一起移出当前目录，不计入新版本测试数量。
- 2 项模拟服务/真实进程故障测试通过，包括 SIGKILL 后恢复和重叠请求能力探测。
- 两设备隔离演示通过，包括新增、附件和响应丢失后的恢复。
- 从仅含当前源码的临时目录执行冻结锁文件安装、检查和全部测试通过，未复用旧仓库的 node_modules 或 packages。
- macOS / Obsidian 1.14.4 隔离实机验证通过：预览不创建状态、原生按钮、确认取消零写入、只读比较、窄窗、附件、冲突应用、响应丢失与重启恢复。截图仅保存在本地 artifacts 中。

机器可读结果见 [standalone-verification.json](evidence/standalone-verification.json)。本轮只使用合成库与模拟服务，没有读取或改写真实库、没有连接真实 WebDAV。

[evidence/live-webdav-local-updated-20261110.json](evidence/live-webdav-local-updated-20261110.json) 与 [local-updated-verification.json](evidence/local-updated-verification.json) 是 0.2.0 的历史实测证据，已脱敏。其路径结构和全仓库 3,579 项测试数描述旧版，不是当前目录和当前测试数量。本轮保留同步逻辑、updated 规则与 format 2 状态格式，仅整理依赖边界、入口和界面辅助代码。

真实服务条件写入和并发保证仍未验证，外部写入保持禁用；旧 format 1 自动迁移、其他操作系统实机和移动端仍未完成。完整边界见 [DESIGN.md](DESIGN.md)。
