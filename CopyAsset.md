# Add A New Bird

本文档说明如何新增一只鸟类，并复用已经写好的鸟类交互逻辑。目标是后续开发者只需要复制资源目录、复制一段鸟类数据、调整坐标和文案，即可让新鸟类出现在自然大厅中。

## 1. Before You Start

假设默认鸟类交互已经完成：

| Existing Part | Purpose |
|---------------|---------|
| `BirdNPC` | 根据鸟类数据创建大厅中的鸟类实体。 |
| `InteractionSystem` | 检测玩家靠近、点击或按键打开面板。 |
| `BirdInfoPanel` | 展示鸟类详情、图片、简介和音频按钮。 |
| `AudioSystem` | 播放或停止鸟鸣。 |
| `src/data/birds.json` | 保存鸟类数据。 |
| `public/birds/{birdId}/` | 保存鸟类图片和音频资源。 |

如果这些模块尚未实现，先按 `PLAN.md` 完成第一只占位鸟类闭环。

当前实现说明：

1. 新鸟类会由 `src/data/birds.json` 自动生成 `BirdNPC`。
2. 详情面板会读取 `portrait` 和 `audio` 路径。
3. `sprite.png` 和 `marker.png` 目前是资源目录约定，`BirdNPC` 尚未使用真实 sprite/marker 渲染。
4. `Preloader` 目前没有消费 `assetManifest`，新增鸟类时不需要手动改预加载逻辑。

## 2. Naming Rule

每只鸟需要一个稳定的 `birdId`：

```text
lowercase-kebab-case
```

示例：

| Bird | birdId |
|------|--------|
| 丹顶鹤 | `red-crowned-crane` |
| 白鹭 | `egret` |
| 翠鸟 | `kingfisher` |
| 喜鹊 | `magpie` |

`birdId` 必须同时用于：

1. 数据中的 `id` 字段。
2. `public/birds/{birdId}/` 目录名。
3. Phaser 资源 key，例如 `bird:{birdId}:sprite`。

## 3. Copy Resource Folder

复制已完成鸟类的资源目录：

```text
public/birds/red-crowned-crane/
```

改名为新鸟类目录，例如：

```text
public/birds/kingfisher/
```

目录中放入：

```text
public/
└─ birds/
   └─ kingfisher/
      ├─ sprite.png
      ├─ portrait.png
      ├─ call.mp3
      └─ marker.png
```

必需资源：

| File | Required | Action |
|------|----------|--------|
| `sprite.png` | Yes | 替换为新鸟类大厅小图。 |
| `portrait.png` | Yes | 替换为新鸟类面板大图。 |
| `call.mp3` | No | 有真实鸟鸣就替换；没有则可先不放。 |
| `marker.png` | No | 有定制热点标记就替换；没有则使用默认高光。 |

## 4. Copy Bird Data

打开：

```text
src/data/birds.json
```

复制已经完成的鸟类配置，改成新鸟类。

示例：

```json
{
  "id": "kingfisher",
  "displayName": "翠鸟",
  "latinName": "Alcedo atthis",
  "summary": "常在溪流、湖泊和湿地边活动，以小鱼和水生昆虫为食。",
  "habitat": "溪流、湖泊、湿地边缘",
  "recognitionTips": [
    "体型小，喙长而直",
    "背部常见明亮蓝绿色",
    "常停在水边枝条上观察水面"
  ],
  "spawn": {
    "x": 760,
    "y": 460
  },
  "assets": {
    "sprite": "/birds/kingfisher/sprite.png",
    "portrait": "/birds/kingfisher/portrait.png",
    "audio": "/birds/kingfisher/call.mp3"
  }
}
```

注意：

| Field | Must Change |
|-------|-------------|
| `id` | 改成新鸟类 `birdId`。 |
| `displayName` | 改成中文展示名。 |
| `latinName` | 改成拉丁学名。 |
| `summary` | 改成新鸟类简介。 |
| `habitat` | 改成新鸟类栖息地。 |
| `recognitionTips` | 改成新鸟类识别特征。 |
| `spawn` | 改成新鸟类在大厅中的坐标。 |
| `assets` | 改成新鸟类资源目录路径。 |

## 5. Pick A Spawn Position

`spawn.x` 和 `spawn.y` 是大厅世界坐标，不是屏幕像素。

当前世界尺寸来自：

```text
src/game/config/gameConfig.ts
```

当前可行走范围来自：

```text
src/game/world/HallLayout.ts
```

建议：

1. 鸟类坐标放在可行走区域内。
2. 不要和玩家出生点完全重叠。
3. 多只鸟之间至少间隔 `120px`，避免交互半径重叠过多。
4. 鸟类越靠下，渲染深度越高，会遮住 Y 坐标更小的对象。

## 6. Loading New Assets

当前项目新增 `birds.json` 后无需手动改 `Preloader`。鸟类实体先用程序化占位图形，详情图片由 DOM `<img>` 按 URL 懒加载，音频由 `AudioSystem` 在用户打开面板后探测和播放。

如果后续接入真实 Phaser sprite 或统一 loading 状态，再在 `Preloader` 或 `assetManifest` 中增加：

```ts
this.load.image('bird:kingfisher:sprite', '/birds/kingfisher/sprite.png');
this.load.image('bird:kingfisher:portrait', '/birds/kingfisher/portrait.png');
this.load.audio('bird:kingfisher:call', '/birds/kingfisher/call.mp3');
```

资源 key 要和 `birdId` 保持一致。

## 7. Reusing The Same Interaction Logic

默认情况下，新鸟类不需要新增 TypeScript 文件。

只要满足以下条件，已有逻辑就应自动生效：

| Requirement | Expected Result |
|-------------|-----------------|
| `birds.json` 有新鸟类数据 | `NatureScene` 创建新 `BirdNPC`。 |
| `spawn` 坐标有效 | 鸟类出现在大厅指定位置。 |
| `sprite` 路径已填写 | 当前仍显示程序化占位图形；后续接入真实 sprite 后会使用该路径。 |
| 玩家靠近 | HUD 显示 `按 E 查看 {displayName}`。 |
| 点击或按 `E` | 打开同一个 `BirdInfoPanel`，但内容替换为该鸟类。 |
| `audio` 存在且返回可播放音频类型 | 播放按钮可播放该鸟鸣。 |

## 8. When To Copy Logic

大多数鸟类都不应该复制交互逻辑，只复制数据和资源。

只有以下情况才考虑新增专属逻辑：

| Case | Possible Extension |
|------|--------------------|
| 鸟类有特殊动画 | 在数据中加 `animationKey`，或继承 `BirdNPC`。 |
| 鸟类有小游戏 | 新增 `BirdMiniGamePanel`，从详情面板入口打开。 |
| 鸟类有多段声音 | 将 `assets.audio` 改为 `audioClips` 数组。 |
| 鸟类有识别问答 | 在 `BirdProfile` 中新增 `quiz` 字段。 |

推荐优先扩展数据结构，而不是复制整套逻辑。这样后续维护成本更低。

## 9. Validation Checklist

新增鸟类后检查：

1. `public/birds/{birdId}/` 目录存在。
2. `sprite.png` 和 `portrait.png` 路径正确。
3. `birds.json` 中 `id`、路径和目录名一致。
4. `spawn` 坐标在大厅可见区域内。
5. `npm run typecheck` 通过。
6. `npm run build-nolog` 通过。
7. 本地进入大厅能看到新鸟类。
8. 玩家靠近新鸟类能看到提示。
9. 点击或按 `E` 能打开详情面板。
10. 面板内容显示新鸟类信息。
11. 有音频时可播放；没有音频时按钮状态合理。
12. 关闭面板后声音停止，玩家可继续移动。

## 10. Common Problems

| Problem | Likely Cause | Fix |
|---------|--------------|-----|
| 鸟类不显示 | `birds.json` 未被加载，或 `spawn` 坐标在视野外。 | 检查数据读取和坐标。 |
| 图片 404 | 资源路径和目录名不一致。 | 确保 URL 为 `/birds/{birdId}/portrait.png`，后续接入 sprite 后也检查 `/birds/{birdId}/sprite.png`。 |
| 有音频路径但按钮禁用 | 文件不存在，或 Vite fallback 返回了 `text/html`。 | 确认 `public/birds/{birdId}/call.mp3` 存在，并且浏览器直接访问该 URL 返回音频。 |
| 面板仍显示旧鸟 | 面板没有在打开时刷新当前 `BirdProfile`。 | 确认 `NatureScene` 调用 `BirdInfoPanel.show(bird.profile, onClose)`。 |
| 音频不播放 | 浏览器限制自动播放，或文件路径错误。 | 必须由用户点击触发播放，并检查 URL。 |
| 多个鸟同时触发 | 交互系统没有筛选最近鸟类。 | 只允许最近且在半径内的鸟成为 active target。 |
| 遮挡不对 | 新鸟没有参与 `DepthSystem.sortByY`。 | 把所有 `BirdNPC` 加入深度排序列表。 |
