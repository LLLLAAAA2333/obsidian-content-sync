# 普通目录同步 0.2.0

已完成可构建、可在隔离环境运行的桌面实验首版。开发目录为 `<checkout>`，基于 MDSync v1.5.1（`6f0190efd517b709ff21c4d77bcc0b221bce52b6`）；原研究目录及证据未修改。

正式库未安装插件。按用户追加授权，已使用现有 Simple WebDAV Sync 设置完成科大真实只读预览；服务端原子条件写保证尚未确认，因此**外部 WebDAV 只开放预览**。同步、恢复、冲突应用在本版仅开放给明确选择的本机合成模拟服务。

## 构建和运行

建议 Node 24、pnpm 10.17.0。宿主当前 Node 25 可构建，但上游依赖检查明确不支持 25，部分上游测试还会受 Node 25 的 localStorage 行为影响。请使用 Node 24 重现完整检查。

```sh
cd <checkout>
pnpm install --frozen-lockfile
pnpm build:plain
pnpm test:plain
pnpm demo:plain
pnpm e2e:plain
```

- `build:plain` 先检查插件类型，再生成 `dist/plain-directory-sync/{main.js,manifest.json,styles.css,LICENSE,LICENSE-Jest,LICENSE-yaml,NOTICE}` 与命令行核心 `dist/plain-core.cjs`。
- `test:plain` 运行 67 项普通模式测试，以及真实进程 SIGKILL 恢复和重叠请求探测器两项独立测试。先构建，再运行这些工具测试。
- `demo:plain` 新建 `runtime/demo-*`，运行两设备同步、附件导入及丢失响应后的重启恢复。远端为一次性内存模拟服务；本地恢复记录与报告保留。
- `e2e:plain` 使用 `/Applications/Obsidian.app/Contents/MacOS/Obsidian`，新建 `runtime/obsidian-*` 的配置与测试库，验证真实按钮、只读正文比较、窄桌面窗口、附件、冲突选择，以及停止并重新启动应用后的恢复。只关闭自己启动的进程。当前实际验证为 macOS / Obsidian 1.14.4。
- `pnpm build` 仍构建上游加密模式，不能拿它的输出替代普通模式产物。

本机已安装 Node 25 时，可按本次验证方式临时使用 Node 24，不修改全局安装：

```sh
pnpm --package=node@24 dlx node /opt/homebrew/bin/pnpm test
pnpm --package=node@24 dlx node /opt/homebrew/bin/pnpm arch
pnpm typecheck
pnpm lint
```

`/opt/homebrew/bin/pnpm` 是本机路径；其他机器用实际 pnpm 入口或直接切换到 Node 24。

## 操作方式

插件 ID 为 `plain-directory-sync`，名称为 `Plain Directory Sync (实验)`；默认无目标、不自动连接。只应在新建的隔离测试库安装构建包，正式安装留待另行安排。

设置中填写**已经确认的完整 WebDAV 资料库/子目录 URL**。密码只保留在当前插件会话，不写入 data.json；命令行凭据通过 `PLAIN_DAV_USER` / `PLAIN_DAV_PASSWORD` 提供。普通笔记与附件不会转换成加密对象。

“完整核验 / 刷新预览”每次重新读取原始字节，显示一致、上传、下载、冲突、删除、未知、排除。读取量和计划改写数量分别显示。预览及小文件正文比较不创建状态或恢复内容。比较超过 1 MiB 或二进制内容时仅保留计划信息，不加载整份内容到文本窗口。

“执行当前计划”需要明确确认；冲突默认保留，两侧均已改变且内容不同不覆盖。可以先比较正文，再采用某侧或尝试合并普通 Markdown 的非重叠修改。合并需要保存过的共同基线；重叠修改、缺少基线、二进制或大型文件不会强行合并。

界面列表最多展示 200 行。完整计划可从 CLI 输出：

```sh
node tools/plain/cli.mjs preview --vault=/absolute/test-vault --url=https://explicit-collection/
node tools/plain/mock-server.mjs
# 以下 URL 使用模拟服务实际输出的地址；只使用隔离测试库
node tools/plain/cli.mjs sync --vault=/absolute/test-vault --url=http://127.0.0.1:PORT/ --isolated-mock
node tools/plain/cli.mjs recover --vault=/absolute/test-vault --url=http://127.0.0.1:PORT/ --isolated-mock
node tools/plain/cli.mjs resolve --vault=/absolute/test-vault --url=http://127.0.0.1:PORT/ --isolated-mock --path=note.md --choose=remote
```

模拟服务退出后其内存远端消失；重新演示请使用新的隔离库。状态绑定本地根、远端 URL 和用户名身份摘要，目标改变会停止而不是复用旧基线。

## 范围与一致性

所有普通扩展名参与，包括附件及自定义扩展。各层级默认排除 `.obsidian`、`.claudian`、`.git`、`.sync_state.json`、`.DS_Store`、`.plain-sync`、`.trash` 和符号链接。大小写、Unicode 规范化及文件/目录碰撞保守列为冲突。

每次完整读取文件，以原始 SHA-256 保护写入前提和恢复；Markdown 另计算共享内容 SHA-256：仅排除文件开头 YAML 中顶层、大小写精确为 `updated` 的属性。正文、`doneTime`、`area`、嵌套的 `updated`、其他属性和非 Markdown 文件照常参与比较。首轮共享内容相同只保存基线和恢复版本，普通文件零改写；不同则冲突；单侧存在按导入处理，不推断删除。mtime 只检查读取期间是否变化，不决定同步方向，也不作缓存证据。

上传只发送不含顶层 `updated` 的共享版本；下载、采用远端或文本合并保留本机已有的 `updated`。本机缺少该属性（包括新下载的文件）就继续不带此属性，不继承服务器时间、不凭空生成时间，由本机自己的编辑器或插件维护。仅 `updated` 不同不触发普通文件写入；已有服务器版本中的旧 `updated` 不会仅因启用规则而自动清除，下次真正上传共享内容时才去掉。界面将共享内容一致而原始字节不同的项目单独注明。

YAML 解析保留其他字段及正文原始格式，仅缓冲最多 256 KiB 的文件头，正文和附件继续流式读取。支持 UTF-8 BOM、CRLF、带引号的键和多行值；空的 YAML 包装（删除 updated 后仅剩空白）不参与共享内容。重复键、无闭合文件头、无效 YAML、锚点/别名、含 updated 的顶层 flow map、缩进/显式 updated 键及超限文件头均保守标为未知，阻止本轮执行。不会全局删除正文中名为 updated 的内容。

目录列举不是原子快照。任何列举/读取失败使本轮停止执行；执行每路径再次检查两端，远端新建用 `If-None-Match: *`，覆盖/删除用强 ETag `If-Match`。没有共享清单，因此不同路径并发新增不会互相抹掉目录记录。多文件操作可能部分成功，只推进已确认的逐文件基线。

## 中断和恢复

`.plain-sync/versions/<SHA-256>` 同时保存两端完整原始版本、排除本机属性后的共享版本，以及保留本机 updated 的下载目标版本；`.plain-sync/displaced/<操作 ID>` 保留本地被替换的旧 inode；编号 JSON 检查点保存基线与未完成操作。首版不自动删除历史。

覆盖或删除前先保存两侧原始版本及目标版本并落盘意图；完成后确认共享内容一致再推进基线。真实字节哈希和服务器 ETag 仍用于检测读取后发生的编辑；下载不会用旧 updated 覆盖并发产生的新本机值。恢复先观察上次结果：已经完成则不重传；仍为旧值时在正确条件下继续；出现更新的内容则冻结为冲突。最新状态损坏会停止，不静默退回旧状态。状态文件和历史未加密，应与本地笔记同等保护。

本地文件系统没有与所有外部编辑器协作的原子 compare-and-swap。本版先把旧 inode 移到恢复区，检查其字节，再以不覆盖已有名称的方式发布新 inode。迟到写入仍保留在 displaced；碰撞停止。该机制可恢复内容，但不能宣称对任意编辑器、恶意符号链接拓扑变更、硬件故障或断电具有全目录事务保证。运行期间发现路径空缺/冲突时请先恢复；不要删除 `.plain-sync`。

0.2.0 使用 format 2 检查点。0.1.0 的 format 1 是整文件基线，新版会明确拒绝直接复用；尚未实现自动迁移。请用旧版完成旧的未完成操作，再安排显式迁移；不要删除或重置旧 `.plain-sync`。当前真实库未创建过该状态，不受此限制影响。

需要人工取回旧内容时，根据检查点中的路径、操作 ID 或哈希定位上述文件，先复制到新的独立恢复文件进行核验；不要直接覆盖现有工作内容。自动历史浏览/清理与跨设备历史存储留待后续。

## WebDAV 能力探测

```sh
node tools/plain/probe.mjs --mock --out=artifacts/probe-atomic.json
node tools/plain/probe.mjs --unsafe-mock --out=artifacts/probe-unsafe.json
```

探测覆盖路径编码、列举与 GET、ETag、条件新建/覆盖/删除、延迟请求体形成的重叠请求、上传中断及 404。错误模拟另由同步测试覆盖 403、网络错误、截断下载、部分扫描和状态保存失败。安全模拟服务通过 13 项观测；不安全模拟服务通过串行条件检查，但四项重叠操作检查全部失败。

科大写能力实测需先确认任务凭据和允许写入合成数据的测试父目录；已经完成的只读 dry run 不包含这项授权。模板是 `tools/plain/env.example`。提供 `PLAIN_TEST_PARENT_URL` 后，工具只在其下创建随机命名的 `plain-probe-*` 目录，写入合成数据；报告记录请求时序、结果和未知项，不记录密码。探测工具不会读取原库插件配置，也不会从本地路径推导云盘 URL。工具默认保留测试目录及 createdFiles 清单，不递归清理远端。

有限探测不能证明所有服务器调度下的原子性。**探测报告不会自动开放外部服务写入。** 后续需结合部署实现/明确服务端保证决定是否开放；未实现 WebDAV LOCK，也未验证锁范围或租约。

## 验证证据与未完成项

见 [VERIFICATION.md](VERIFICATION.md) 及 `evidence/`；设计见 [DESIGN.md](DESIGN.md)，会话进度见根目录 `PROGRESS.md`。

本版已完成科大认证、目录列举、完整内容读取及只读预览，见 `evidence/live-webdav-dry-run-20261110.json`。未完成科大条件写入及并发保证验证、正式安装、移动端与 Windows/Linux 实机测试、空目录传播、目录重命名识别、Git、自动历史清理、断电/硬件损坏恢复认证。界面深色/第三方主题、辅助技术及超长列表的人机可用性未作完整实测。文件同步与历史存储已经分开，后续可独立扩展。

交付源码快照包含新增源码、测试和聚合证据，不包含 node_modules、运行库或 Git 历史；解压后安装锁定依赖即可构建，如需运行启用 Git 集成的检查，可先在解压目录执行 `git init`。完整开发检出仍保留在上述路径。
