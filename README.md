<!-- 项目说明文件，记录 2.5D 自然大厅的技术栈、启动命令和目录约定。 -->

# Tinglai Nature Hall

Phaser + TypeScript + Vite scaffold for a top-down 2D Nature Hall with Y-axis depth sorting and room for later light, particle, audio, and interaction work.

## Repository Structure

```text
tinglai-nature-hall/
├─ .git/                       # Git 仓库元数据目录
├─ .gitignore                  # Git 忽略规则
├─ CHANGELOG.md                # 项目变更记录
├─ LICENSE                     # MIT 许可证文本
├─ README.md                   # 项目说明、命令和架构文档
├─ index.html                  # Vite 入口 HTML，承载 Phaser canvas
├─ log.js                      # Phaser 模板遗留日志脚本
├─ netlify.toml                # Netlify 静态部署配置
├─ package-lock.json           # npm 依赖锁定文件
├─ package.json                # npm 包元数据、脚本和依赖声明
├─ public/                     # Vite 静态资源目录
├─ src/                        # TypeScript 游戏源码
├─ tsconfig.json               # TypeScript 编译和类型检查配置
├─ vercel.json                 # Vercel 静态部署配置
└─ vite/                       # Vite 开发/生产配置
```

本地运行或构建后还可能出现：

| Path | Description |
|------|-------------|
| `node_modules/` | `npm install` 生成的依赖目录，已被 `.gitignore` 忽略。 |
| `dist/` | `npm run build-nolog` 生成的生产构建输出，已被 `.gitignore` 忽略。 |

## Architecture Overview

项目是一个 Phaser + TypeScript + Vite 的 2.5D 自然大厅原型。运行链路为 `index.html -> src/main.ts -> src/game/main.ts -> BootScene -> Preloader -> NatureScene`。

源码按职责分为：

| Layer | Path | Responsibility |
|-------|------|----------------|
| 浏览器入口 | `src/main.ts` | 等待 DOM 就绪，并把 Phaser 游戏挂载到页面容器。 |
| 游戏入口 | `src/game/main.ts` | 创建 Phaser `Game`，注册启动、预加载和主场景。 |
| 场景 | `src/game/scenes/` | 管理启动流程、资源预加载和自然大厅主场景。 |
| 实体 | `src/game/entities/` | 定义玩家和动物 NPC 的占位渲染与实体属性。 |
| 系统 | `src/game/systems/` | 封装输入、碰撞、深度排序、交互、音频、光影和粒子逻辑。 |
| 世界 | `src/game/world/` | 定义大厅边界、可行走区域、展区和场景分层。 |
| 配置 | `src/game/config/` | 集中维护视口、世界尺寸、颜色、出生点和资源清单。 |
| 类型 | `src/game/types/` | 维护实体、世界和深度排序相关 TypeScript 类型。 |
| UI | `src/ui/` | 维护游戏内 HUD 文本和后续交互 UI。 |
| 数据 | `src/data/` | 保存后续内容加载所需的结构化数据种子。 |

## Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies. |
| `npm run dev-nolog` | Start Vite dev server on port 8080. |
| `npm run build-nolog` | Create a production build in `dist`. |
| `npm run typecheck` | Run strict TypeScript checks. |

## File Responsibilities

### Root Files

| File | Responsibility |
|------|----------------|
| `.gitignore` | 忽略日志、依赖目录、构建产物和编辑器临时文件。 |
| `CHANGELOG.md` | 按日期记录项目初始化、结构调整和后续开发变化。 |
| `LICENSE` | 声明项目使用 MIT 许可证。 |
| `README.md` | 记录项目定位、仓库根目录、目录结构、命令和文件职责。 |
| `index.html` | 提供 `#game-container` 容器，引入 `/src/main.ts`，并设置页面和 canvas 基础样式。 |
| `log.js` | Phaser 模板遗留的远程日志脚本；当前主构建脚本不依赖它。 |
| `netlify.toml` | 配置 Netlify 使用 `npm run build` 构建并发布 `dist`，同时将路由回退到 `index.html`。 |
| `package-lock.json` | 锁定 npm 依赖版本，保证安装结果可复现。 |
| `package.json` | 声明项目名称、Node 版本、npm 脚本、Phaser/Vite/TypeScript 等依赖。 |
| `tsconfig.json` | 配置 TypeScript 严格类型检查、ES 模块和 Vite bundler 解析模式。 |
| `vercel.json` | 配置 Vercel 使用 Vite 构建、输出 `dist`，并将路由重写到 `index.html`。 |

### Vite Config

| File | Responsibility |
|------|----------------|
| `vite/config.dev.mjs` | 本地开发配置，固定 dev server 端口为 `8080`，并把 Phaser 拆成独立 chunk。 |
| `vite/config.prod.mjs` | 生产构建配置，启用 Terser 压缩、移除注释，并保留 Phaser 独立分包策略。 |

### Public Assets

| Path | Responsibility |
|------|----------------|
| `public/assets/README.md` | 说明运行时素材应放在 `public/assets` 下，并通过 `/assets/...` 访问。 |
| `public/animals/` | 预留动物 NPC 精灵、图像或展示素材目录。 |
| `public/audio/ambient/` | 预留自然大厅环境循环音频目录。 |
| `public/audio/animals/` | 预留动物音效目录。 |
| `public/audio/ui/` | 预留 UI 操作音效目录。 |
| `public/characters/` | 预留玩家、访客等角色素材目录。 |
| `public/effects/` | 预留粒子、光照遮罩和视觉特效素材目录。 |
| `public/maps/` | 预留大厅地图 JSON 或地图数据目录。 |
| `public/tilesets/` | 预留地图 tileset 图像目录。 |

### Source Files

| File | Responsibility |
|------|----------------|
| `src/main.ts` | 浏览器入口，DOM 加载完成后调用 `StartGame('game-container')`。 |
| `src/data/animals.json` | 动物内容数据种子文件，目前为空数组，供后续数据驱动加载扩展。 |
| `src/game/main.ts` | Phaser 游戏入口，读取 `gameConfig` 并注册 `BootScene`、`Preloader`、`NatureScene`。 |
| `src/game/config/assetManifest.ts` | 集中登记未来地图、tileset、角色、动物、音频和特效资源路径。 |
| `src/game/config/gameConfig.ts` | 集中维护视口大小、世界尺寸、颜色、玩家出生点和动物生成点。 |
| `src/game/entities/AnimalNPC.ts` | 定义动物 NPC 容器，保存 `id`、`species`、`displayName`，并绘制占位身体、阴影和标记。 |
| `src/game/entities/Player.ts` | 定义玩家容器，设置移动速度、占位身体、脸部和阴影。 |
| `src/game/scenes/BootScene.ts` | 启动场景，完成 Phaser 场景链路衔接并进入 `Preloader`。 |
| `src/game/scenes/Preloader.ts` | 资源预加载场景，目前显示加载文本，并预留后续资源加载入口。 |
| `src/game/scenes/NatureScene.ts` | 主游戏场景，创建大厅占位图形、分层、光影粒子锚点、玩家、动物、输入、HUD 和摄像机跟随。 |
| `src/game/systems/AudioSystem.ts` | 封装环境音循环播放和停止全部音频的入口。 |
| `src/game/systems/CollisionSystem.ts` | 根据 `hallLayout.walkableArea` 限制玩家位置，预留墙体和展陈物碰撞扩展点。 |
| `src/game/systems/DepthSystem.ts` | 按对象 Y 坐标设置深度，实现俯视 2D 的前后遮挡关系。 |
| `src/game/systems/InputSystem.ts` | 读取方向键和 WASD 输入，并按 delta time 驱动玩家移动。 |
| `src/game/systems/InteractionSystem.ts` | 在指定半径内查找离玩家最近的动物 NPC，供 HUD 和后续交互触发使用。 |
| `src/game/systems/LightingSystem.ts` | 创建环境光占位图形，预留后续伪 3D 光照和局部高光能力。 |
| `src/game/systems/ParticleSystem.ts` | 创建粒子发射器占位锚点，预留尘埃、落叶、水汽等效果。 |
| `src/game/types/Entities.ts` | 定义实体生成配置、动物生成配置和可深度排序对象接口。 |
| `src/game/types/World.ts` | 定义场景层名称、世界边界和大厅生成点类型。 |
| `src/game/types/index.ts` | 聚合导出实体和世界类型，简化跨目录导入。 |
| `src/game/world/HallLayout.ts` | 定义世界边界、可行走区域和两个展区占位数据。 |
| `src/game/world/LayerRegistry.ts` | 创建 `ground`、`walls`、`entities`、`foreground`、`effects` 五个 Phaser 层并设置深度。 |
| `src/ui/HudOverlay.ts` | 创建固定在屏幕上的交互提示文本，并提供更新文本的方法。 |
