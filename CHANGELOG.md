<!-- 项目修改日志文件，按日期记录每一次初始化和后续开发更新。 -->

# Changelog

## 2026-08-17

完成 2.5D 自然大厅项目初始化架构收口。

- 扁平化项目结构，将 Vite 应用移动到 git 仓库根目录，移除 workspace 依赖链路，避免 Windows 下 `npm ci` 访问外层 workspace 链接时报 `EACCES`。
- 修复部署平台从仓库根目录执行构建时找不到 `package.json` / `dist` 的问题，改为仓库根目录直接构建，并保留 Vercel、Netlify 静态输出配置。
- 更新项目包元数据，明确项目名称、私有属性和 Phaser + TypeScript + Vite 技术栈说明。
- 为源码、Vite 配置、TypeScript 配置和文档补充文件开头功能说明。
- 新增资源清单、分层管理、布局规划、碰撞、光影、粒子和 HUD 占位模块。
- 扩展 README 的目录约定，记录 2.5D 伪 3D 后续开发的模块落点。
- 清理 Phaser 模板默认统计/宣传构建输出，使项目脚本更贴合自然大厅初始化状态。
- 将 `esbuild` 固定为直接开发依赖，避免本地或部署环境漏装 Vite 间接可选依赖时构建报 `ERR_MODULE_NOT_FOUND`。

## 2026-08-16

Initialized the Phaser + TypeScript + Vite Nature Hall project skeleton.

- Replaced missing template scene references with `BootScene -> Preloader -> NatureScene`.
- Added a runnable top-down 2D scene scaffold with Y-axis depth sorting and layered placeholders.
- Added minimal player, animal NPC, input, interaction, audio, and depth systems.
- Added type and config files for future 2.5D Nature Hall expansion.
- Added static asset directory notes and a concise README update.
