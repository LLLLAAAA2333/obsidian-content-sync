# 当前进度：0.4.0 独立文本合并首版（2026-11-11）

本轮从干净的 `b43656c`（0.3.0）工作区继续。已完成行为契约、独立测试、纯计算模块替换、引擎接入及隔离验证。0.4.0 通过普通新增提交管理，保留现有 Git 历史；不创建 Release 或向真实库安装。

- 规则与限制：`docs/MERGE_CONTRACT.md`；模块 `src/merge/text-merge.ts`、`limits.ts`、`index.ts`。
- 删除四个派生算法文件、旧预算及两个派生测试；保留开发来源、原 MIT 许可证和全部 Git 历史。来源核对见 `docs/SLIMMING.md`、`THIRD_PARTY_NOTICES.md`。
- 精确保留原始行和 BOM，允许相邻独立替换；插入碰到改动边界、重复内容定位不可靠或统一预算超限则停止。失败结果无正文。
- `updated` 仍在同步层保留本机，format 2 不变。新增合并超限/冲突零目标写入、执行前原始版本核验、合并目标恢复及幂等性测试。
- 验证结果与覆盖映射：`docs/VERIFICATION.md`、`docs/evidence/merge-verification.json`；本地日志 `artifacts/independent-merge-20261111/`。
- 构建目录 `dist/plain-directory-sync/`；安装 ZIP、源码 ZIP 与 SHA-256 清单均在 `dist/`，版本 0.4.0。未向真实 Note 库安装。

本轮没有读取真实笔记、配置或凭据，没有连接真实 WebDAV。外部服务继续只读。YAML 字段合并、移动识别、字符级合并、性能优化、正式库安装和发布不在本轮范围。重复行删增/移动会保守拒绝；JS RSS 与实时延迟没有硬保证。后续安装、市场政策核实、真实服务条件写入均需另行开展。

历史：0.3.0 完成独立单包化，85 项单元测试和 2 项故障测试通过；历史证据保留于 `docs/evidence/standalone-verification.json`。真实 dry run 结果仍是此前只读观测，本轮未重新连接。
