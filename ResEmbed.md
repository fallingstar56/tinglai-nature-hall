# Resource Embedding Guide

本文档说明 `tinglai-nature-hall` 中鸟类、场景、音频和 UI 资源的嵌入方式。目标是先保留清晰的占位资源结构，让后续开发者只需要填入美术资源和音频文件，不必重写鸟类交互逻辑。

## 1. Resource Strategy

本项目使用 Vite。放在 `public/` 目录下的文件会被原样复制到构建产物中，并可通过站点根路径访问。

当前实现状态：

1. 鸟类数据已经由 `src/data/birds.json` 驱动。
2. 详情面板已经会读取 `assets.portrait` 和 `assets.audio`。
3. 缺失 `portrait.png` 时会显示面板占位图，缺失或不可播放 `call.mp3` 时会禁用声音按钮。
4. 大厅内鸟类实体目前仍使用 `BirdNPC` 的程序化占位图形，`sprite.png` 和 `marker.png` 是后续替换真实美术时的资源约定。
5. `assetManifest` 和 `Preloader` 目前还没有实际加载这些资源；不要因为资源缺失阻止场景运行。

推荐规则：

| Resource Type | Put In | Runtime URL |
|---------------|--------|-------------|
| 鸟类 sprite | `public/birds/{birdId}/sprite.png` | `/birds/{birdId}/sprite.png` |
| 鸟类详情图 | `public/birds/{birdId}/portrait.png` | `/birds/{birdId}/portrait.png` |
| 鸟鸣音频 | `public/birds/{birdId}/call.mp3` | `/birds/{birdId}/call.mp3` |
| 鸟类热点图标 | `public/birds/{birdId}/marker.png` | `/birds/{birdId}/marker.png` |
| 大厅背景 | `public/maps/nature-hall.png` | `/maps/nature-hall.png` |
| 地图数据 | `public/maps/nature-hall.json` | `/maps/nature-hall.json` |
| tileset | `public/tilesets/nature-hall-interior.png` | `/tilesets/nature-hall-interior.png` |
| 环境音 | `public/audio/ambient/hall-loop.mp3` | `/audio/ambient/hall-loop.mp3` |
| UI 音效 | `public/audio/ui/confirm.mp3` | `/audio/ui/confirm.mp3` |
| 粒子贴图 | `public/effects/dust-mote.png` | `/effects/dust-mote.png` |

不要把大型运行时素材放进 `src/`。`src/` 更适合代码、类型和小型 JSON 数据。

## 2. Recommended Bird Folder Layout

每一种鸟类使用一个单独目录，目录名与鸟类 `id` 保持一致：

```text
public/
└─ birds/
   └─ red-crowned-crane/
      ├─ sprite.png
      ├─ portrait.png
      ├─ call.mp3
      └─ marker.png
```

文件职责：

| File | Required | Description |
|------|----------|-------------|
| `sprite.png` | Yes | 大厅内显示的鸟类小立绘，必须透明背景，风格应与 2D 大厅统一。 |
| `portrait.png` | Yes | 详情面板中的鸟类大图，优先使用清晰自然摄影或统一风格插画。 |
| `call.mp3` | No | 鸟鸣音频；没有音频时详情面板应禁用播放按钮。 |
| `marker.png` | No | 鸟类可交互提示或热点标记，必须透明背景；没有时用默认高光。 |

## 3. Asset Format Suggestions

当前代码和数据示例使用固定文件名。除非同步修改 `src/data/birds.json` 和相关加载逻辑，否则请按下表统一命名，不要混用 `.jpg`、`.webp` 或其他后缀。

| Asset | Required Filename | Format Rules | Visual Rules |
|-------|-------------------|--------------|--------------|
| Bird sprite | `sprite.png` | PNG，透明背景，建议 `128x128` 或 `192x192`，主体尽量居中，边缘留少量空白。 | 大厅场景用 2D 小立绘，不建议直接使用未处理的真实照片；推荐侧面或侧俯视角，所有鸟类保持统一线条、明暗和缩放尺度。 |
| Bird portrait | `portrait.png` | PNG，建议 `800x600`、`1200x900` 或同等 4:3 比例；如果原图是 JPG/WebP，请导出为 `portrait.png` 或同步改数据路径。 | 详情面板大图，优先选能看清识别特征的自然照片或统一插画；侧面或 3/4 角度通常比正面更适合，不要使用过暗、过糊、主体过小或背景过乱的图片。 |
| Bird call | `call.mp3` | MP3，鸟鸣短音频建议 `3-15s`，避免过长静音和明显噪声。 | 同一鸟类只放默认展示音频；多段声音应先扩展数据结构。 |
| Bird marker | `marker.png` | PNG，透明背景，小尺寸，例如 `32x32` 或 `64x64`。 | 可选热点图标；当前代码暂未读取该字段，接入前保持与 UI 风格一致。 |
| Map image | `nature-hall.png` | PNG，尺寸由地图实现决定，避免过大导致加载慢。 | 俯视 2D 大厅图，色彩、透视和阴影应与角色和鸟类 sprite 统一。 |
| Tileset | `nature-hall-interior.png` | PNG，网格尺寸需与地图数据一致。 | 地面、墙体、展台、植物等元素保持同一 2D 展陈风格。 |
| Particles | `dust-mote.png` | PNG，透明背景，小尺寸，例如 `16x16`、`32x32`。 | 粒子应低饱和、低对比，避免抢过鸟类和详情内容。 |

统一风格要求：

1. 大厅内可移动/可交互对象优先使用 2D 小立绘或经过统一处理的透明 PNG，不直接放矩形照片。
2. 同一批鸟类 sprite 的视角、光源方向、描边强度、主体大小和脚底位置要一致，否则 Y 轴遮挡会显得不稳定。
3. `sprite.png` 负责场景识别，画面要简洁；`portrait.png` 负责科普展示，画面要清晰、信息量更高。
4. 文件名大小写必须完全一致，推荐全部小写。Windows 下大小写不敏感，但部署到 Linux 环境后大小写错误会导致资源缺失。
5. 单个图片文件应尽量控制体积；如果压缩后仍较大，优先优化图片尺寸，不要改变文件名后缀来绕过路径约定。

## 4. Data Reference

鸟类数据建议集中放在：

```text
src/data/birds.json
```

示例：

```json
{
  "birds": [
    {
      "id": "red-crowned-crane",
      "displayName": "丹顶鹤",
      "latinName": "Grus japonensis",
      "summary": "湿地旗舰鸟类，常见于芦苇沼泽、浅水湿地与迁徙停歇地。",
      "habitat": "湿地、沼泽、浅水湖泊",
      "recognitionTips": [
        "头顶有红色裸露皮肤",
        "体羽以白色为主，颈部和飞羽呈黑色",
        "鸣声清亮，常成对鸣叫"
      ],
      "spawn": {
        "x": 690,
        "y": 500
      },
      "assets": {
        "sprite": "/birds/red-crowned-crane/sprite.png",
        "portrait": "/birds/red-crowned-crane/portrait.png",
        "audio": "/birds/red-crowned-crane/call.mp3"
      }
    }
  ]
}
```

数据字段约定：

| Field | Description |
|-------|-------------|
| `id` | 鸟类唯一 ID，也作为资源目录名。 |
| `displayName` | 面板和交互提示中显示的中文名。 |
| `latinName` | 拉丁学名。 |
| `summary` | 面板中的简短说明。 |
| `habitat` | 栖息地说明。 |
| `recognitionTips` | 识别特征列表。 |
| `spawn.x` / `spawn.y` | 鸟类在大厅世界坐标中的出生点。 |
| `assets.sprite` | 大厅实体贴图路径。 |
| `assets.portrait` | 详情面板图片路径。 |
| `assets.audio` | 鸟鸣音频路径。 |

注意：`assets.marker` 暂时不是 `BirdProfile` 的正式字段。如果后续要接入热点贴图，请先扩展 `src/game/types/Bird.ts`，再修改 `BirdNPC` 的渲染逻辑。

## 5. Phaser Loading Plan

当前 `Preloader` 尚未消费 `assetManifest`，以下是接入真实 Phaser 贴图时的后续实现计划，不是新增鸟类时必须手动完成的步骤。

在 `Preloader` 中加载资源：

```ts
this.load.image('bird:red-crowned-crane:sprite', '/birds/red-crowned-crane/sprite.png');
this.load.image('bird:red-crowned-crane:portrait', '/birds/red-crowned-crane/portrait.png');
this.load.audio('bird:red-crowned-crane:call', '/birds/red-crowned-crane/call.mp3');
```

推荐 key 命名：

| Asset | Key Pattern |
|-------|-------------|
| sprite | `bird:{birdId}:sprite` |
| portrait | `bird:{birdId}:portrait` |
| audio | `bird:{birdId}:call` |
| marker | `bird:{birdId}:marker` |

如果面板用 DOM `<img>` 展示 `portrait`，则不一定需要把 portrait 交给 Phaser 预加载；但为了统一加载状态，可以仍然在 `Preloader` 中注册。

## 6. Missing Asset Fallback

为了支持“先写逻辑，后填资源”，必须有缺省策略：

| Missing | Fallback |
|---------|----------|
| `sprite.png` | 继续使用 `BirdNPC` 的程序化丹顶鹤/默认鸟类占位图形。 |
| `portrait.png` | 面板显示默认自然背景图或纯色占位块。 |
| `call.mp3` | 播放按钮禁用，并显示“暂无音频”。 |
| `marker.png` | 使用 Phaser Graphics 画一个呼吸光圈。 |

不要因为某个鸟类资源缺失阻止整个大厅加载。

## 7. CSS And DOM Panel Assets

如果鸟类面板使用 DOM overlay，推荐在代码中创建：

```text
src/ui/BirdInfoPanel.ts
```

面板图片直接使用数据里的 URL：

```ts
imageElement.src = bird.assets.portrait;
```

音频由 `AudioSystem` 管理。当前实现会用 `HTMLAudioElement` 播放鸟鸣，并在播放前探测 URL：如果路径返回的是 Vite SPA fallback 的 `text/html`，会被判定为缺失音频。

## 8. Deployment Notes

部署到 Vercel 或 Netlify 时：

1. 构建命令使用 `npm run build`。
2. 输出目录为 `dist`。
3. `public/` 下的资源会进入构建产物。
4. 资源路径使用根路径，例如 `/birds/red-crowned-crane/sprite.png`。
5. 不要在资源路径中写本地绝对路径，例如 `D:\...`。

## 9. Asset Checklist

新增或替换资源后检查：

1. 文件是否位于 `public/` 下。
2. 数据中的 URL 是否以 `/` 开头。
3. `birdId`、目录名、资源路径是否一致。
4. 图片大小是否合理，透明 PNG 是否保留透明通道。
5. 音频文件能否被浏览器播放。
6. `npm run build-nolog` 后 `dist/` 中是否存在对应资源。
7. 打开鸟类详情面板时，缺失图片是否显示占位，缺失音频是否显示禁用状态。
8. 如果新增了 sprite/marker 的真实渲染逻辑，确认 `BirdNPC` 和 `Preloader` 已同步更新。
