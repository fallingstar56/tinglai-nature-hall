// 资源清单配置文件，集中登记自然大厅后续地图、角色、音频、光影和粒子资源路径。
export const assetManifest = {
    maps: {
        hall: '/maps/nature-hall.json'
    },
    tilesets: {
        interior: '/tilesets/nature-hall-interior.png'
    },
    characters: {
        player: '/characters/player.png'
    },
    animals: {
        redPanda: '/animals/red-panda.png',
        crane: '/animals/crane.png'
    },
    audio: {
        ambientHall: '/audio/ambient/hall-loop.mp3',
        uiConfirm: '/audio/ui/confirm.mp3'
    },
    effects: {
        dustMote: '/effects/dust-mote.png',
        softLight: '/effects/soft-light.png'
    }
} as const;
