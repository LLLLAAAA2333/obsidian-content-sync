# Obsidian Content Sync

独立的 Obsidian 桌面插件，针对普通目录中的笔记和附件做 WebDAV 内容同步。当前版本 **0.4.0**，插件 ID 为 `plain-directory-sync`。

**外部 WebDAV 当前只开放只读预览。** 写入、冲突应用和恢复可在随附的本机隔离模拟服务中验证。默认不自动连接、不自动同步。

## 功能

- 完整内容核验、接管预览和基于共同版本的三方比较。
- Markdown 顶层 YAML 的 `updated` 仅保留本机；正文、其他属性和附件正常同步。
- 条件写入、原始版本留存、冲突选择、文本合并和中断恢复。
- 读取错误视为未知；没有共同基线时不推断删除。

## 开发

使用 Node.js 24、pnpm 10：

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm demo
```

`pnpm build` 直接构建此插件，输出 `dist/plain-directory-sync/`；不再构建 MDSync、Relay 或 Viewer。`pnpm e2e` 在 macOS 上启动独立配置的 Obsidian 和合成库进行界面验证。

```text
src/
  main.ts, register.ts    插件入口与命令
  sync/                  扫描、比较、WebDAV、写入保护与恢复
  ui/                    原生 Obsidian 设置与预览
  merge/                 纯文本差异与三方合并算法
tests/                   同步和合并回归测试
tools/                   构建、模拟服务、故障测试与隔离演示
docs/                    设计、验证与精简记录
```

## 使用与边界

只在隔离测试库安装实验构建。填写已确认的 WebDAV 目录和凭据后手动预览；密码仅保存在当前插件会话，不写入配置文件。新下载的 Markdown 不继承远端 `updated`，该属性由本机编辑器维护。

合并按原始完整行处理，支持相邻独立替换；插入碰到替换/删除边界、重复行定位不确定或统一预算超限时停止。保留混合换行和末尾换行状态，不生成可被误用的冲突正文。

`updated` 规则和 format 2 状态与 0.2.0 保持兼容。旧 format 1 不自动迁移或重置。真实服务器的条件写入和并发保证仍待验证，因此本版不会向外部服务执行写入。

- [文本合并契约、资源限制与保真规则](docs/MERGE_CONTRACT.md)
- [设计与数据保护边界](docs/DESIGN.md)
- [验证结果](docs/VERIFICATION.md)
- [MDSync 占比与精简记录](docs/SLIMMING.md)
- [第三方代码来源](THIRD_PARTY_NOTICES.md)

## 来源与许可

本项目从 MDSync v1.5.1 开始开发，0.3.0 已移除其插件框架、加密同步、协议包、服务端、Viewer 和多包构建。0.4.0 按独立行为契约重新编写文本合并模块和对应测试，替换剩余派生算法及其预算/出口依赖；仍使用通用库 `@jest/diff-sequences`。这不是严格洁净室实现，历史来源记录与版权信息继续保留，无 MDSync 运行或构建依赖。采用 [MIT License](LICENSE)；打包库的许可证随构建附带。

真实笔记、凭据、备份和原始运行记录不纳入 Git。GitHub Actions 的 CI 模板尚未启用；需要具备 `workflow` 权限的授权才能启用。
