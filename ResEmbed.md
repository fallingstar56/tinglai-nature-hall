# Resource Embedding Guide

本文档说明 `tinglai-nature-hall` 中鸟类、场景、音频和 UI 资源的嵌入方式。目标是先保留清晰的占位资源结构，让后续开发者只需要填入美术资源和音频文件，不必重写鸟类交互逻辑。

## 1. Resource Strategy

本项目使用 Vite。放在 `public/` 目录下的文件会被原样复制到构建产物中，并可通过站点根路径访问。

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
| `sprite.png` | Yes | 大厅内显示的鸟类小图，建议透明背景。 |
| `portrait.png` | Yes | 详情面板中的鸟类大图。 |
| `call.mp3` | No | 鸟鸣音频；没有音频时详情面板应禁用播放按钮。 |
| `marker.png` | No | 鸟类可交互提示或热点标记；没有时用默认高光。 |

## 3. Asset Format Suggestions

| Asset | Suggested Format | Notes |
|-------|------------------|-------|
| Bird sprite | PNG / WebP | 透明背景，面向 2D 俯视或侧俯视，尺寸可先用 `128x128`。 |
| Bird portrait | JPG / PNG / WebP | 面板图，建议 `800x600` 或同等 4:3 比例。 |
| Audio | MP3 / OGG | 鸟鸣短音频建议 `3-15s`，环境音可更长并循环。 |
| Map image | PNG / WebP | 需要清晰边缘和稳定色彩，避免过大导致加载慢。 |
| Particles | PNG | 小尺寸透明贴图，例如 `16x16`、`32x32`。 |

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
        "audio": "/birds/red-crowned-crane/call.mp3",
        "marker": "/birds/red-crowned-crane/marker.png"
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
| `assets.marker` | 可选热点标记路径。 |

## 5. Phaser Loading Plan

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
| `sprite.png` | 使用 `AnimalNPC` 当前的椭圆/矩形占位图形或默认鸟类 silhouette。 |
| `portrait.png` | 面板显示默认自然背景图或纯色占位块。 |
| `call.mp3` | 播放按钮禁用，并显示“暂无声音”。 |
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

音频可由 Phaser `AudioSystem` 统一播放，也可以由 DOM `HTMLAudioElement` 播放。推荐优先使用 Phaser audio，便于和游戏生命周期统一管理。

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
