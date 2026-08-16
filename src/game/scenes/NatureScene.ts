// 自然大厅主场景文件，组织俯视 2D 分层、Y 轴遮挡、实体和效果占位内容。
import { Scene } from 'phaser';
import { gameConfig } from '../config/gameConfig';
import { AnimalNPC } from '../entities/AnimalNPC';
import { Player } from '../entities/Player';
import { AudioSystem } from '../systems/AudioSystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { DepthSystem } from '../systems/DepthSystem';
import { InputSystem } from '../systems/InputSystem';
import { InteractionSystem } from '../systems/InteractionSystem';
import { LightingSystem } from '../systems/LightingSystem';
import { ParticleSystem } from '../systems/ParticleSystem';
import { HudOverlay } from '../../ui/HudOverlay';
import { createSceneLayers, type SceneLayerMap } from '../world/LayerRegistry';

export class NatureScene extends Scene {
    private readonly collisionSystem = new CollisionSystem();
    private readonly depthSystem = new DepthSystem();
    private readonly interactionSystem = new InteractionSystem();
    private audioSystem!: AudioSystem;
    private hud!: HudOverlay;
    private inputSystem!: InputSystem;
    private lightingSystem!: LightingSystem;
    private particleSystem!: ParticleSystem;
    private player!: Player;
    private animals: AnimalNPC[] = [];
    private layers!: SceneLayerMap;

    public constructor() {
        super('NatureScene');
    }

    public create(): void {
        this.cameras.main.setBounds(0, 0, gameConfig.world.width, gameConfig.world.height);

        this.layers = createSceneLayers(this);
        this.lightingSystem = new LightingSystem(this);
        this.particleSystem = new ParticleSystem(this);
        this.createHallPlaceholder();
        this.createLightAndParticleHooks();
        this.createEntities();

        this.inputSystem = new InputSystem(this);
        this.audioSystem = new AudioSystem(this);
        this.hud = new HudOverlay(this);

        this.audioSystem.stopAll();
        this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    }

    public update(_time: number, delta: number): void {
        this.inputSystem.updatePlayer(this.player, delta / 1000);
        this.clampPlayerToWorld();
        this.depthSystem.sortByY([this.player, ...this.animals]);
        this.updateInteractionHint();
    }

    private createHallPlaceholder(): void {
        const ground = this.add.graphics();
        ground.fillStyle(gameConfig.colors.floor, 1);
        ground.fillRect(0, 0, gameConfig.world.width, gameConfig.world.height);
        ground.fillStyle(gameConfig.colors.floorAccent, 0.28);
        ground.fillRect(120, 120, 1040, 620);

        const walls = this.add.graphics();
        walls.fillStyle(gameConfig.colors.wall, 1);
        walls.fillRect(96, 88, 1088, 42);
        walls.fillRect(96, 130, 42, 650);
        walls.fillRect(1142, 130, 42, 650);
        walls.fillRect(96, 740, 1088, 42);
        walls.fillStyle(0x6f7f70, 1);
        walls.fillRect(250, 250, 190, 74);
        walls.fillRect(820, 280, 210, 74);

        const foreground = this.add.graphics();
        foreground.fillStyle(gameConfig.colors.foreground, 0.9);
        foreground.fillRect(0, 790, gameConfig.world.width, 110);

        this.layers.ground.add(ground);
        this.layers.walls.add(walls);
        this.layers.foreground.add(foreground);
    }

    private createLightAndParticleHooks(): void {
        const lightOverlay = this.lightingSystem.createAmbientLightAnchors();
        const particleAnchor = this.particleSystem.createPlaceholderEmitterAnchor();
        this.layers.effects.add([lightOverlay, particleAnchor]);
    }

    private createEntities(): void {
        this.player = new Player(this, gameConfig.playerSpawn.x, gameConfig.playerSpawn.y);
        this.animals = gameConfig.animalSpawns.map((spawn) => new AnimalNPC(this, spawn));

        this.layers.entities.add([this.player, ...this.animals]);
        this.depthSystem.sortByY([this.player, ...this.animals]);
    }

    private clampPlayerToWorld(): void {
        const position = this.collisionSystem.clampToWalkableArea(this.player.x, this.player.y);
        this.player.setPosition(position.x, position.y);
    }

    private updateInteractionHint(): void {
        const nearestAnimal = this.interactionSystem.findNearestAnimal(this.player, this.animals);
        this.hud.setInteractionText(nearestAnimal ? `Near: ${nearestAnimal.displayName}` : '');
    }
}
