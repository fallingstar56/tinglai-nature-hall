<!-- 项目修改日志文件，按日期记录每一次初始化和后续开发更新。 -->

# Changelog

## 2026-08-17

Updated asset onboarding documentation for future art/resource contributors.

- Clarified in `ResEmbed.md` which resource paths are currently active, which ones are future conventions, and how missing portrait/audio fallbacks behave.
- Added stricter `ResEmbed.md` asset format guidance for fixed filenames, PNG/MP3 expectations, transparent sprite/marker backgrounds, 2D bird sprite style, portrait aspect ratio, photo angle recommendations, and cross-bird visual consistency.
- Updated `CopyAsset.md` so new bird instructions match the current `BirdProfile` schema, current DOM image/audio loading behavior, and current `BirdInfoPanel.show(...)` flow.
- Added a README section directing future developers to read `ResEmbed.md` before embedding runtime resources and `CopyAsset.md` before copying bird assets or reusing bird interaction logic.
- Documented that ordinary new birds should be added through `public/birds/{birdId}/` plus `src/data/birds.json`, not by copying interaction systems or panel code.

Developer completed the first data-driven bird interaction milestone.

- Added a `BirdProfile` data contract and `src/data/birds.json` seed data for the red-crowned crane, including the public asset path convention for future sprite, portrait, and audio files.
- Added a Phaser `BirdNPC` entity that renders an interactive placeholder crane with a breathing highlight, click hit area, and Y-axis depth sorting support.
- Updated `NatureScene` to create bird NPCs from data, show a unique nearest-bird interaction hint, open the bird detail panel via `E` or pointer click, and pause player movement while the panel is open.
- Added a DOM-based `BirdInfoPanel` for bird portrait fallback, Chinese and Latin names, summary, habitat, recognition tips, audio controls, close button, and responsive desktop/mobile layout.
- Extended `AudioSystem` with current bird-call state management so closing or switching stops active audio and missing audio fails gracefully with an unavailable state.
- Added basic hall visual polish around the crane exhibit, including wetland floor accents, exhibit platform shapes, foreground plants, and light highlights.
- Updated TypeScript config and exports to support JSON-driven bird data.
- Verification reported by Developer: `npm run typecheck` passed; `npm run build-nolog` passed after installing missing local dependencies. `package-lock.json` was not retained as a changed file.
- Known limitations: real bird portrait/audio assets are not present yet, so runtime uses placeholder imagery and unavailable audio status; browser interaction testing has not yet been performed.

Tester reviewed the bird interaction milestone with status PASS WITH ISSUES.

- Tests performed: read `PLAN.md`, reviewed all Developer-touched files, ran `npm run typecheck` with PASS, ran `npm run build-nolog` with PASS, attempted `npm run dev-nolog -- --host 127.0.0.1` in sandbox and hit `listen EPERM`, then verified the dev server with approved escalation at `http://127.0.0.1:8080/`.
- Additional asset check: `/birds/red-crowned-crane/call.mp3` and `/birds/red-crowned-crane/portrait.png` currently return SPA fallback HTML rather than real media assets.
- Medium issue: missing audio is not detected before enabling the panel play button, so the UI initially shows playable audio even though the asset is absent.
- Medium issue: `NatureScene` registers `keydown-E` and `keydown-ESC` listeners without removing them on scene shutdown or destroy.
- Medium issue: pointer-clicking the bird opens the panel regardless of player distance, while keyboard interaction is correctly radius-gated.
- Low issue: `AudioSystem` clears the current `HTMLAudioElement` reference but does not explicitly detach media event handlers or abort pending loads.
- Low issue: `assetManifest` includes bird assets, but `Preloader` still does not consume the manifest; this remains partially deferred while placeholder rendering is used.
- No Critical or High severity issues were found. Another Developer iteration is required to fix the Medium issues before final acceptance.

Developer fixed the Tester-reported Medium issues.

- Updated `BirdInfoPanel` and `AudioSystem` so the panel probes bird audio availability before enabling playback; missing assets and Vite SPA HTML fallbacks are treated as unavailable, showing a disabled `暂无音频` state up front.
- Updated `NatureScene` to store keyboard handlers and unregister `keydown-E` / `keydown-ESC` on scene shutdown or destroy.
- Updated pointer interaction so clicking a bird opens the detail panel only when that bird is the nearest bird within interaction radius.
- Improved `AudioSystem.stopCurrentBirdCall()` cleanup by clearing media event handlers, removing the audio source, and aborting pending loads where possible.
- Verification reported by Developer: `npm run typecheck` passed; `npm run build-nolog` passed.
- Remaining known limitation: `assetManifest` is still not consumed by `Preloader`, intentionally deferred to avoid making missing real assets block the placeholder milestone.

Tester completed second-round verification with status PASS WITH ISSUES.

- Tests performed: reread `PLAN.md`, reviewed the second-round fix files, ran `npm run typecheck` with PASS, and ran `npm run build-nolog` with PASS.
- Verified fixed: missing audio now starts in a disabled unavailable flow after resource probing; `text/html` SPA fallback is rejected as non-audio; scene keyboard handlers are unregistered on shutdown/destroy; pointer interaction is distance-gated; current bird audio cleanup clears handlers and aborts pending loads where possible.
- No Critical, High, or Medium severity issues remain.
- Remaining Low issue: `assetManifest` is still not consumed by `Preloader`; this is deferred until real resource loading is introduced.
- Remaining Low issue: `BirdInfoPanel.destroy()` removes the DOM root but does not explicitly invalidate a pending audio probe token, so a late probe could update detached DOM references after scene shutdown.
- Remaining limitations: no real bird portrait/audio assets are present yet; browser screenshot/interaction automation was not performed; multi-bird edge cases remain future work.
- Final acceptance decision: current PLAN.md milestone is accepted for this development round because all required implementation, Developer work, Tester review, passing typecheck/build, and CHANGELOG records are complete, with no unresolved Critical or High issues.

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
