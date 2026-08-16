# Tinglai Nature Hall Development Plan

本文档规划 `tinglai-nature-hall` 的 2.5D 自然大厅开发流程。目标不是做真正 3D，也不是严格等距 Isometric，而是做类似《元气骑士》《星露谷》的“俯视 2D + Y 轴遮挡 + 分层场景 + 动态光影/粒子”的伪 3D 世界。

参考页面：自然大厅位于 `https://tinglai.dushiofcourses.cn/#/hall`。该页面属于“听籁 SoundVerse · 自然之声 AI 识别”站点的一部分，后续界面开发应以浏览器中打开的 `#/hall` 页面为主要视觉参考：延续自然声、沉浸式、安静展陈、信息层次清晰的方向，并在鸟类详情面板中强化“声音 + 图像 + 简洁科普”的体验。由于该站点是 SPA，文档规划只引用其公开路由和品牌定位，具体配色、组件间距、卡片层次和动效应以后续人工打开页面观察到的实际效果为准。

## 1. Overall Direction

自然大厅应优先成为一个可扩展的 2D 展陈空间：

| Goal | Description |
|------|-------------|
| 可游走 | 玩家可用方向键或 WASD 在大厅内移动。 |
| 有遮挡 | 玩家、鸟类、展陈物根据 Y 坐标自动排序，形成前后关系。 |
| 有分层 | 场景拆成 `ground`、`walls`、`entities`、`foreground`、`effects` 等层。 |
| 有氛围 | 通过环境光、局部光、尘埃/叶片粒子、背景音营造自然大厅感。 |
| 有交互 | 玩家靠近鸟类后出现提示，点击或按键打开鸟类详情面板。 |
| 易扩展 | 先实现一种鸟类的完整交互闭环，后续鸟类通过复制配置、素材和少量数据接入。 |

## 2. Visual And UX Style

推荐视觉方向：

| Area | Recommendation |
|------|----------------|
| 大厅地图 | 俯视 2D 房间，墙体、展台、植物、光斑、地面纹理都使用 2D 贴图。 |
| 深度感 | 靠 Y 轴排序、前景层遮挡、阴影椭圆、局部光源和角色脚底阴影制造伪 3D。 |
| 色彩 | 使用自然绿色、暖木色、柔和米白、低饱和深色作为主体，避免强烈游戏 UI 感。 |
| 面板 | 详情面板参考官网“自然大厅”的安静自然风格：半透明深色或浅色毛玻璃感、圆角小、层级清楚。 |
| 信息 | 面板首屏展示鸟名、图片、声音播放、简介；次级内容展示栖息地、识别特征、AI 识别提示。 |
| 动效 | 面板打开使用轻量淡入/上移，鸟类热点使用呼吸高光，环境粒子慢速漂浮。 |

## 3. Runtime Flow

当前基础链路已经存在：

```text
index.html
└─ src/main.ts
   └─ src/game/main.ts
      ├─ BootScene
      ├─ Preloader
      └─ NatureScene
```

目标运行流程：

```text
BootScene
└─ Preloader
   ├─ 读取 assetManifest
   ├─ 加载大厅背景、展台、鸟类、UI、音频、粒子贴图
   └─ 进入 NatureScene

NatureScene
├─ 创建地图层：ground / walls / foreground
├─ 创建效果层：lighting / particles
├─ 创建实体层：player / bird NPCs
├─ 启动系统：input / collision / depth / interaction / audio
└─ 根据玩家与鸟类距离显示提示，触发详情面板
```

## 4. Scene Layer Plan

建议保持并扩展现有分层：

| Layer | Depth | Content |
|-------|-------|---------|
| `ground` | `0` | 地面底图、地砖、水面、低矮纹理。 |
| `walls` | `100` | 墙面、固定展台、不可穿越障碍物底层。 |
| `entities` | `1000 + y` | 玩家、鸟类、可交互 NPC、可被 Y 轴排序的物件。 |
| `foreground` | `4000` | 顶部横梁、前景植物、门框等遮挡物。 |
| `effects` | `8000` | 光照叠层、尘埃、叶片、水汽、点击高光。 |
| `ui` | `10000` | HUD 交互提示和 Phaser 内 UI；复杂详情面板建议用 DOM overlay。 |

## 5. First Milestone: One Placeholder Bird

先完成一种占位鸟类，例如：

```text
id: red-crowned-crane
displayName: 丹顶鹤
species: Grus japonensis
```

这个鸟类要完成完整闭环：

1. 在大厅中显示一个可被 Y 轴排序的鸟类 NPC。
2. 玩家靠近鸟类时显示提示，例如 `查看 丹顶鹤`。
3. 点击鸟类或按 `E` 打开鸟类详情面板。
4. 面板展示鸟类图片、中文名、拉丁名、简介、栖息地、声音播放按钮。
5. 点击播放按钮播放鸟鸣或占位音频。
6. 面板关闭后回到大厅，玩家可继续移动。

实现这一只鸟之后，新增其他鸟类只应需要：

1. 放入图片和音频素材。
2. 在鸟类数据文件中复制一条配置。
3. 如有必要复制一份特殊交互脚本；默认鸟类复用同一个交互逻辑。

## 6. Bird Interaction Data Model

建议新增或扩展 `src/data/birds.json`，让鸟类内容数据驱动：

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

类型建议放在 `src/game/types/Bird.ts`：

```ts
export interface BirdProfile {
    id: string;
    displayName: string;
    latinName: string;
    summary: string;
    habitat: string;
    recognitionTips: string[];
    spawn: {
        x: number;
        y: number;
    };
    assets: {
        sprite: string;
        portrait: string;
        audio: string;
    };
}
```

## 7. Bird Interaction Logic

建议将鸟类交互拆成以下模块：

| Module | Suggested Path | Responsibility |
|--------|----------------|----------------|
| 鸟类实体 | `src/game/entities/BirdNPC.ts` | 显示鸟类 sprite，占位时用简单图形；保存鸟类 profile。 |
| 鸟类数据 | `src/data/birds.json` | 保存所有鸟类展示数据和素材路径。 |
| 鸟类加载 | `src/game/config/assetManifest.ts` 或数据加载器 | 统一登记和加载鸟类图片、音频。 |
| 交互系统 | `src/game/systems/InteractionSystem.ts` | 计算最近鸟类、处理点击/按键触发。 |
| 详情面板 | `src/ui/BirdInfoPanel.ts` | 展示鸟类详情，控制播放、暂停、关闭。 |
| 音频系统 | `src/game/systems/AudioSystem.ts` | 播放当前鸟类音频，切换鸟类时停止旧音频。 |

推荐交互状态：

```text
idle
└─ player enters bird radius
   └─ nearby
      ├─ press E / click bird -> panelOpen
      └─ player leaves radius -> idle

panelOpen
├─ play audio
├─ pause audio
├─ close panel -> nearby 或 idle
└─ switch bird -> update panel content and audio
```

关键规则：

| Rule | Reason |
|------|--------|
| 只有最近的鸟类显示交互提示 | 避免多个热点同时抢 UI。 |
| 打开面板时可以暂停玩家移动 | 防止用户查看内容时角色漂移。 |
| 音频播放前检查资源是否加载 | 避免缺资源时报错。 |
| 切换或关闭面板时停止当前鸟鸣 | 防止多个鸟鸣叠加。 |
| 鸟类实体和详情内容都读取同一份 `BirdProfile` | 避免显示名、音频、图片在多个地方重复维护。 |

## 8. Bird Detail Panel Plan

面板建议使用 DOM overlay，而不是 Phaser Text 全部手写。原因是详情面板包含图片、段落、按钮和可能的滚动内容，DOM 更适合排版和响应式。

建议结构：

```text
BirdInfoPanel
├─ portrait image
├─ displayName
├─ latinName
├─ summary
├─ habitat
├─ recognitionTips
├─ audio play / pause button
└─ close button
```

视觉建议：

| Element | Style |
|---------|-------|
| Panel | 宽度约 `360px - 440px`，移动端占屏幕宽度 `calc(100vw - 32px)`。 |
| Background | 半透明深墨绿或柔和浅色，叠加轻微 backdrop blur。 |
| Image | 固定比例 `4 / 3`，使用 `object-fit: cover`。 |
| Title | 中文名为主标题，拉丁名用小号斜体。 |
| Buttons | 使用清晰图标或短文字：播放、暂停、关闭。 |
| Audio state | 播放中显示进度或简单状态，不强制做复杂波形。 |

## 9. Bird Detail Card Layout Revision Plan

后续鸟类详情面板应升级为更工整的“信息卡片”排版。`CARD.png` 可作为卡片层级和排版密度参考，`CARD2.png` 可作为居中弹层、背景模糊和卡片留白的参考，但不要求完全复刻；最终风格仍应服务自然大厅的安静展陈体验。

### 9.1 Layout Goals

| Goal | Description |
|------|-------------|
| 信息层级清楚 | 用户第一眼看到鸟名、学名、图片和分类/标签，再阅读声音、习性、分布等信息。 |
| 排版整齐 | 卡片内边距、分隔线、图标列、正文列、按钮高度和圆角保持统一。 |
| 内容可扩展 | 后续新增保护级别、趣味知识、音频来源、授权信息时不需要重写布局。 |
| 移动端可读 | 小屏幕下卡片不能溢出，正文换行自然，按钮可纵向排列。 |
| 视觉克制 | 使用柔和自然色、浅色纸感或半透明底色，避免强游戏 UI 或过重装饰。 |
| 背景可见 | 打开卡片后大厅背景应被模糊和轻微压暗，但仍能辨认场景，不应被纯色遮罩完全盖住。 |

### 9.2 Recommended Card Structure

建议 `BirdInfoPanel` 采用以下信息结构：

```text
Bird detail card
├─ Header
│  ├─ circular portrait / fallback image
│  ├─ displayName
│  ├─ pinyin or pronunciation text, optional
│  ├─ latinName
│  ├─ category / bird tag, optional
│  └─ close button
├─ Info sections
│  ├─ callFeatures / 鸣声特征
│  ├─ behavior / 习性
│  ├─ distribution / 分布
│  ├─ conservationStatus / 保护级别
│  └─ funFact / 趣味知识
├─ Audio attribution
│  ├─ source name
│  ├─ recorder / date / location, optional
│  └─ license badge, optional
└─ Actions
   ├─ play / pause audio button
   └─ view full encyclopedia button, optional
```

当前 `BirdProfile` 中已有的 `summary`、`habitat`、`recognitionTips` 可以先映射到这些区块；如果需要更精确地展示 `鸣声特征`、`习性`、`分布`、`保护级别`、`趣味知识` 和 `音频来源与授权`，应扩展 `BirdProfile` 数据结构，而不是把长文案硬编码在组件里。

### 9.3 Visual Rules

| Element | Requirement |
|---------|-------------|
| Overlay | 使用全屏 DOM overlay 承载卡片，居中对齐；背景应使用 `backdrop-filter: blur(...)` 或等效方案，并叠加低透明度暗色/暖灰遮罩，让大厅画面可见但退到次级层。 |
| Overlay spacing | 桌面端卡片距离视口上下左右都应保留明显空间，例如 overlay padding 可从 `48px - 80px` 起步；不要让卡片贴边或覆盖整屏。 |
| Card | 桌面端采用横向较短、纵向较长的小卡片形态，建议宽度约 `520px - 620px`，最大宽度不超过 `min(620px, calc(100vw - 96px))`；圆角不超过 `20px`。 |
| Card height | 卡片高度由内容决定，但最大高度应小于视口高度，例如 `max-height: calc(100vh - 120px)`，内容过多时卡片内部滚动，卡片本身仍保持居中和四周留白。 |
| Mobile card | 移动端仍保持居中或靠近视觉中心，不贴满屏；宽度可为 `calc(100vw - 32px)`，高度上限为 `calc(100vh - 48px)`，必要时内部滚动。 |
| Header | 头像在左、标题信息在右；标题、拼音/读音、拉丁名应基线清楚，避免拥挤。 |
| Portrait | 圆形或小比例封面均可；必须有稳定尺寸，图片缺失时显示同尺寸 fallback。 |
| Close button | 放在右上角，使用稳定的圆形或小方形点击区域，不挤压标题。 |
| Section rows | 每个信息区块采用“图标列 + 文本列”或“标题 + 正文”结构；同级标题字号、字重和颜色一致。 |
| Dividers | 信息区块之间使用低对比分隔线，左右边界对齐，不要出现忽长忽短的随意分割。 |
| Icons | 图标用于帮助扫描，不承担正文信息；所有图标大小和背景圆片尺寸统一。 |
| Body text | 中文正文行高约 `1.6 - 1.8`，段落宽度适中，长文本自然换行。 |
| Attribution | 音频来源、录制者、日期、地点、授权信息放在操作按钮上方，字号低于正文但保持可读。 |
| Actions | 主按钮用于播放/暂停，次按钮用于完整科普或外链入口；按钮高度、圆角、间距统一。 |

卡片定位规则：

1. 默认打开时卡片应在视口水平和垂直方向居中，而不是贴右侧、贴底部或占满页面。
2. 卡片周围必须保留可感知的背景区域，用户能看出自己仍处在自然大厅中。
3. 背景处理应优先使用模糊、轻微暗化和低饱和处理，不使用完全不透明遮罩。
4. 卡片内容较长时只允许卡片内部滚动；overlay 不应让页面或 Phaser canvas 发生布局跳动。
5. 关闭按钮始终位于卡片右上角，并且在卡片内部，不悬浮到卡片外导致移动端误触。

### 9.4 Data Model Expansion Direction

如果需要支撑更完整的卡片内容，建议后续将 `BirdProfile` 扩展为：

```ts
export interface BirdProfile {
    id: string;
    displayName: string;
    latinName: string;
    pronunciation?: string;
    category?: string;
    summary: string;
    callFeatures?: string;
    behavior?: string;
    distribution?: string;
    conservationStatus?: string;
    funFact?: string;
    habitat: string;
    recognitionTips: string[];
    audioCredit?: {
        source: string;
        recorder?: string;
        recordedAt?: string;
        location?: string;
        license?: string;
        anonymous?: boolean;
    };
    spawn: {
        x: number;
        y: number;
    };
    assets: {
        sprite: string;
        portrait: string;
        audio: string;
    };
}
```

扩展规则：

1. 新字段应保持可选，避免旧鸟类数据失效。
2. 面板应对缺失字段自动隐藏对应区块，而不是显示空标题。
3. 音频来源和授权信息应来自数据，不应写死在 UI 组件中。
4. 如果未来接入外部百科链接，应新增明确字段，例如 `encyclopediaUrl`，并在按钮上显示外链状态。

### 9.5 Acceptance Criteria

| Check | Expected |
|-------|----------|
| Header | 鸟名、拼音/读音、拉丁名、头像和关闭按钮对齐清楚，互不遮挡。 |
| Sections | 鸣声、习性、分布、保护级别、趣味知识等区块间距一致，分隔线对齐。 |
| Fallback | 缺失头像、音频、授权字段或可选区块时，卡片仍保持完整排版。 |
| Audio | 播放按钮、播放状态、音频来源与授权信息位置明确。 |
| Responsiveness | 桌面和移动端正文不溢出，按钮不会挤压或重叠。 |
| Centering | 桌面端和移动端打开后卡片居中显示，四周留有明显背景空间，不贴边、不铺满。 |
| Background blur | 卡片背后的大厅画面仍可见，并被模糊/轻微压暗；不得使用完全不透明遮罩把背景全部盖住。 |
| Style | 整体观感工整、美观、自然，不要求与 `CARD.png` 完全一样。 |

## 10. Development Phases

### Phase 1: Data And Asset Contract

1. 新增 `src/data/birds.json`。
2. 新增 `src/game/types/Bird.ts`。
3. 明确 `public/birds/{birdId}/` 的资源目录约定。
4. 准备一只占位鸟类的数据和占位资源路径。

验收标准：

| Check | Expected |
|-------|----------|
| Typecheck | 鸟类数据类型能被 TypeScript 使用。 |
| Missing assets | 缺少真实素材时仍能显示占位图形。 |
| Path convention | 后续开发者知道图片和音频放在哪里。 |

### Phase 2: Placeholder Bird Entity

1. 新增 `BirdNPC` 或改造现有 `AnimalNPC` 为鸟类 profile 驱动。
2. 在 `NatureScene` 中根据数据生成鸟类实体。
3. 保持 Y 轴深度排序。
4. 给鸟类实体增加 hover/click hit area。

验收标准：

| Check | Expected |
|-------|----------|
| Movement | 玩家可移动并被限制在可行走区域。 |
| Depth | 玩家从鸟前/鸟后经过时遮挡关系正确。 |
| Interaction hint | 靠近鸟类出现唯一提示。 |

### Phase 3: Interaction Panel

1. 新增 `BirdInfoPanel`。
2. 玩家按 `E` 或点击鸟类打开面板。
3. 面板显示鸟类信息和占位图片。
4. 关闭面板后恢复大厅交互。

验收标准：

| Check | Expected |
|-------|----------|
| Keyboard | 靠近鸟后按 `E` 能打开详情。 |
| Mouse | 点击鸟类能打开详情。 |
| Close | 点击关闭或按 `Esc` 能关闭详情。 |
| Layout | 桌面和移动端文本不溢出。 |

### Phase 4: Audio And Ambience

1. 使用 `AudioSystem` 播放鸟类音频。
2. 面板播放按钮绑定当前鸟类音频。
3. 添加大厅环境音入口。
4. 切换鸟类或关闭面板时停止当前鸟鸣。

验收标准：

| Check | Expected |
|-------|----------|
| Play | 点击播放按钮能播放鸟鸣。 |
| Stop | 关闭面板或播放另一只鸟时旧音频停止。 |
| Missing audio | 无音频时按钮禁用或显示不可播放状态。 |

### Phase 5: Visual Polish

1. 用真实或占位资源替换图形矩形。
2. 添加鸟类热点呼吸光、局部光斑、尘埃粒子。
3. 增加展区背景图、墙体遮挡和前景植物。
4. 面板样式对齐官网的自然、克制、内容优先风格。

验收标准：

| Check | Expected |
|-------|----------|
| Scene | 大厅不是空白几何图，而有明确自然展陈氛围。 |
| Panel | 信息清晰，图片和音频入口突出但不喧宾夺主。 |
| Performance | 多个鸟类和粒子存在时仍保持流畅。 |

## 11. Recommended Acceptance Test List

每次实现鸟类交互后至少检查：

1. `npm run typecheck`
2. `npm run build-nolog`
3. 本地 `npm run dev-nolog` 打开页面。
4. 玩家移动、碰撞边界、Y 轴遮挡正常。
5. 靠近鸟类出现提示，离开后提示消失。
6. 点击鸟类和按 `E` 都能打开面板。
7. 面板图片、文本、音频按钮状态正确。
8. 关闭面板后声音停止，玩家控制恢复。
9. 桌面和移动端布局无文字重叠。
10. 鸟类详情卡片的标题区、信息区块、音频来源和按钮排版整齐，移动端不溢出。
11. 鸟类详情卡片居中显示，呈横向较短、纵向较长的小卡片形态，四周留有明显空间。
12. 打开卡片时背景大厅仍可辨认，并呈现模糊/轻微暗化效果，而不是被不透明背景完全遮挡。

## 12. Future Expansion

后续可在不重写主逻辑的前提下继续扩展：

| Feature | Direction |
|---------|-----------|
| 多鸟类 | 新增 `BirdProfile` 数据和素材目录即可接入默认交互。 |
| 特殊鸟类交互 | 为少数鸟类增加自定义 panel section 或小游戏，不影响默认逻辑。 |
| AI 识别联动 | 面板中加入“听音识别”入口，与官网现有自然之声 AI 识别定位关联。 |
| 收藏/图鉴 | 将已查看鸟类写入本地状态，形成图鉴解锁。 |
| 场景地图 | 用 Tiled 或自定义 JSON 替换占位图形大厅。 |
| 空间音频 | 根据玩家与鸟类距离调整音量和声像，增强沉浸感。 |
