# Obsidian Content Sync

基于 [MDSync v1.5.1](https://github.com/k1tbyte/mdsync) 的桌面实验插件，新增普通目录 WebDAV 同步模式。当前版本 **0.2.0**，插件 ID 为 `plain-directory-sync`。笔记和附件保持原有路径与文件格式。

**当前外部 WebDAV 仅开放只读预览。** 服务端并发写入保证尚未确认；写入、冲突应用和恢复可在随附的本机隔离模拟服务中演示。默认不自动连接、不自动同步。

## 已实现

- 完整读取文件，使用 SHA-256 比较内容，不依赖修改时间缓存。
- Markdown 顶部 YAML 的 `updated` 仅保留本机：上传排除该属性，下载保留本机值；正文、其他属性和附件正常同步。
- 首次接管预览、三方比较、冲突选择与文本合并。读取错误视为未知，不推断删除。
- 条件写入、原始版本留存、持久化操作记录和中断恢复，已在隔离模拟服务验证。
- 独立插件入口与元数据目录，保留上游加密模式。

## 构建与验证

使用 Node.js 24、pnpm 10.17.0：

```sh
git clone https://github.com/LLLLAAAA2333/obsidian-content-sync.git
cd obsidian-content-sync
pnpm install --frozen-lockfile
pnpm build:plain
pnpm test:plain
pnpm demo:plain
```

普通模式构建输出为 `dist/plain-directory-sync/`。`pnpm build` 构建上游加密模式，不是此实验插件。安装和写入演示请使用新建的隔离测试库。

本地验证：普通模式 67 项测试、2 项探测与进程故障测试通过；全仓库 3,579 项测试通过。真实 WebDAV 完整只读预览已验证，结论范围与限制见验证记录。

## 文档

- [运行说明与数据保护边界](docs/plain/README.md)
- [设计记录](docs/plain/DESIGN.md)
- [验证证据](docs/plain/VERIFICATION.md)
- [开发进度](PROGRESS.md)
- [上游 MDSync 文档](README.upstream.md)

0.2.0 使用 format 2 检查点，旧 format 1 不自动迁移或重置。新下载文件不继承远端 `updated`，该属性交由本机编辑器维护。

仓库包含源码、测试、工具及已去除真实路径和笔记名称的聚合证据。原始实测报告、真实笔记、凭据、备份、运行目录及构建包不纳入 Git。文档中的 `artifacts/`、`runtime/`、`dist/` 为本地生成目录。

## GitHub Actions

工作流保存在 `.github/workflow-templates/*.yml.example`，当前未启用。首次推送所用 GitHub 授权不包含 `workflow` 权限；源码和测试已正常纳入 Git。之后使用具备该权限的授权，将所需模板恢复为 `.github/workflows/*.yml` 即可启用。CI 模板包含普通模式构建和故障测试；release 与 deploy-relay 模板属于上游加密模式，不用于发布本实验插件。

## 来源与许可

基于 MDSync v1.5.1，基线提交 `6f0190efd517b709ff21c4d77bcc0b221bce52b6`。保留上游版权声明与 [MIT License](LICENSE)。构建包同时携带所使用第三方库的许可证。
