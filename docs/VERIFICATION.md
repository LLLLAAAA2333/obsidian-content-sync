# 0.4.0 独立合并验证（2026-11-11）

## 实际执行结果

冻结锁文件安装、`pnpm check`（格式/类型/构建/实际模块图边界）、`pnpm test`、`pnpm demo`、`pnpm e2e` 均通过。118 项单元测试、2 项工具故障测试；lint 无错误，26 项非阻塞风格警告和 2 项提示保留在本地日志。另在 `runtime/merge-clean-verification/` 从无 node_modules 的源码副本冻结安装，构建及全部测试通过。

macOS / Obsidian 1.14.4 使用独立 profile、`runtime/` 合成库及本机模拟服务。保留原生按钮、零写入预览/取消、只读比较、窄窗、附件、明确选择的原有检查；新增点击“合并文本”后相邻替换成功、混合换行和本机 updated 保留、重叠冲突停止且两端原文不变，以及合并上传丢失响应后的真实进程重启恢复。远端写入次数在恢复时不增加，页面错误为空。成功和冲突截图已人工视觉检查，未发现遮挡或错误状态缺失。

机器可读证据：[merge-verification.json](evidence/merge-verification.json)、[merge-source-audit.json](evidence/merge-source-audit.json)。详细日志仅在本地 `artifacts/independent-merge-20261111/`；界面截图在 `artifacts/obsidian-1794398259231/`。

## 覆盖变化（不能仅由数量推断质量）

| 范围 | 本轮处理与验证对象 |
| --- | --- |
| 原 67 项同步测试 | 全部保留：updated 投影/恢复、原始前提、条件请求、选择冲突、未知读取、恢复与幂等性等 |
| 原 18 项派生算法测试 | 删除两个派生测试文件；不再把上游锚点回退、整段临时冲突正文和相邻改动一律成区作为正确性依据 |
| 新 40 项契约测试 | 先写其中 35 项并观察新接口缺失而失败，后实现；再补充组合边界、来源与偏移、传递重叠、非法预算、预算交换对称性 |
| 生成性质用例 | 240 份 Unicode/混合换行文档的单方、相同、相邻独立修改；60 份插入与删除文档；共同文本长度 1～6 的全部 4,675 对已知单次编辑组合。预期正文由原文和已知编辑构造，不调用旧算法或新 diff 做 oracle |
| 文本保真与停止 | LF/CRLF/混合、BOM、单独 CR、末行有无换行、空文本、全删除、纯插入、中文/Emoji/长行、重复段落、空行、列表、代码块、YAML 不格式化；重复删增/移动定位停止、整任务输入/行/工作预算、失败无正文 |
| 新 11 项同步接入测试 | 7 类冲突/停止检查 local.change 与 remote.change 均未调用且基线/意图不变；BOM 与混合换行原文；updated-only 预览过期；归档后执行前再核验；合并目标丢失响应恢复及重复执行幂等性 |
| 2 项工具故障测试 | 保留 SIGKILL/延迟提交/死锁恢复及重叠请求能力探测；最终运行使用本轮新构建 |
| 模块边界 | 核对实际 esbuild 图中仅三个新 merge 模块，只能引用自身或 diff-sequences，不能导入同步、界面或 Node I/O |

BOM 集成测试曾观察到旧同步入口解码会去掉 BOM，改为 `ignoreBOM: true` 后通过。移除了旧的合并结果整文件换行转换，format 2 兼容且 updated 仍由同步层处理。

## 交付与限制

安装包 `dist/plain-directory-sync-0.4.0.zip`，可重建源码快照 `dist/plain-sync-source-0.4.0.zip`，校验清单 `dist/SHA256SUMS-0.4.0.txt`。安装包包含 main.js、manifest.json、styles.css、原 MIT 许可证、来源说明及两个打包库许可证；尚未安装到真实库或发布。

重复内容删增、移动和部分本可确定的编辑会保守停止；不实现 YAML 字段、字符级或移动合并。总字符/总行限制约束分配规模，工作单位限制算法回调与本模块遍历；不等同 JS RSS 硬上限或实时超时。Windows/Linux、移动端、真实服务条件写入和社区市场资格尚未验证。

本轮没有读取真实 Note 库、配置或凭据，也没有连接真实 WebDAV；只使用隔离合成数据，外部写入开关仍禁用。已有真实 dry run 证据未重跑或改写。

---

以下为 0.3.0 历史结果，保留当时的覆盖和来源说明：

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
