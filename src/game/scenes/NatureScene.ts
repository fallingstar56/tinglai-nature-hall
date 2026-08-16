// 自然大厅主场景文件，组织俯视 2D 分层、Y 轴遮挡、实体和效果占位内容。
import { Scene } from 'phaser';
import birdData from '../../data/birds.json';
import { gameConfig } from '../config/gameConfig';
import { BirdNPC } from '../entities/BirdNPC';
import { Player } from '../entities/Player';
import { AudioSystem } from '../systems/AudioSystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { DepthSystem } from '../systems/DepthSystem';
import { InputSystem } from '../systems/InputSystem';
import { InteractionSystem } from '../systems/InteractionSystem';
import { LightingSystem } from '../systems/LightingSystem';
import { ParticleSystem } from '../systems/ParticleSystem';
import type { BirdProfile } from '../types';
import { BirdInfoPanel } from '../../ui/BirdInfoPanel';
import { HudOverlay } from '../../ui/HudOverlay';
import { createSceneLayers, type SceneLayerMap } from '../world/LayerRegistry';

const birdProfiles = birdData.birds as BirdProfile[];

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
    private birds: BirdNPC[] = [];
    private birdInfoPanel!: BirdInfoPanel;
    private layers!: SceneLayerMap;
    private inputHandlersRegistered = false;

    private readonly handleInteractKey = (): void => {
        if (this.birdInfoPanel.isOpen()) {
            return;
        }

        const nearestBird = this.getNearestBird();
        if (nearestBird) {
            this.openBirdPanel(nearestBird.profile);
        }
    };

    private readonly handleEscapeKey = (): void => {
        this.birdInfoPanel.close();
    };

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
        this.birdInfoPanel = new BirdInfoPanel(this, this.audioSystem);
        this.hud = new HudOverlay(this);
        this.registerInteractionInput();
        this.events.once('shutdown', () => this.unregisterInteractionInput());
        this.events.once('destroy', () => this.unregisterInteractionInput());

        this.audioSystem.stopAll();
        this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    }

    public update(_time: number, delta: number): void {
        this.inputSystem.updatePlayer(this.player, delta / 1000);
        this.clampPlayerToWorld();
        this.depthSystem.sortByY([this.player, ...this.birds]);
        this.updateInteractionHint();
    }

    private createHallPlaceholder(): void {
        const ground = this.add.graphics();
        ground.fillStyle(gameConfig.colors.floor, 1);
        ground.fillRect(0, 0, gameConfig.world.width, gameConfig.world.height);
        ground.fillStyle(gameConfig.colors.floorAccent, 0.28);
        ground.fillRect(120, 120, 1040, 620);
        ground.fillStyle(0x355947, 0.28);
        ground.fillEllipse(720, 510, 250, 120);
        ground.fillStyle(0xd7c889, 0.18);
        ground.fillCircle(705, 500, 54);

        const walls = this.add.graphics();
        walls.fillStyle(gameConfig.colors.wall, 1);
        walls.fillRect(96, 88, 1088, 42);
        walls.fillRect(96, 130, 42, 650);
        walls.fillRect(1142, 130, 42, 650);
        walls.fillRect(96, 740, 1088, 42);
        walls.fillStyle(0x6f7f70, 1);
        walls.fillRect(250, 250, 190, 74);
        walls.fillRect(820, 280, 210, 74);
        walls.fillStyle(0x9a8d64, 0.9);
        walls.fillRoundedRect(600, 455, 190, 58, 10);
        walls.fillStyle(0x2f4a3f, 0.95);
        walls.fillRoundedRect(616, 434, 158, 28, 8);

        const foreground = this.add.graphics();
        foreground.fillStyle(gameConfig.colors.foreground, 0.9);
        foreground.fillRect(0, 790, gameConfig.world.width, 110);
        foreground.fillStyle(0x435f4e, 0.85);
        foreground.fillEllipse(170, 775, 110, 82);
        foreground.fillEllipse(1085, 762, 140, 96);

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
        this.birds = birdProfiles.map((profile) => {
            const bird = new BirdNPC(this, profile);
            bird.on('pointerdown', () => this.openBirdPanelIfNearby(bird));

            return bird;
        });

        this.layers.entities.add([this.player, ...this.birds]);
        this.depthSystem.sortByY([this.player, ...this.birds]);
    }

    private clampPlayerToWorld(): void {
        const position = this.collisionSystem.clampToWalkableArea(this.player.x, this.player.y);
        this.player.setPosition(position.x, position.y);
    }

    private updateInteractionHint(): void {
        if (this.birdInfoPanel.isOpen()) {
            this.hud.setInteractionText('');
            return;
        }

        const nearestBird = this.getNearestBird();
        this.hud.setInteractionText(nearestBird ? `按 E 查看 ${nearestBird.displayName}` : '');
    }

    private registerInteractionInput(): void {
        if (!this.input.keyboard || this.inputHandlersRegistered) {
            return;
        }

        this.input.keyboard.on('keydown-E', this.handleInteractKey);
        this.input.keyboard.on('keydown-ESC', this.handleEscapeKey);
        this.inputHandlersRegistered = true;
    }

    private unregisterInteractionInput(): void {
        if (!this.input.keyboard || !this.inputHandlersRegistered) {
            return;
        }

        this.input.keyboard.off('keydown-E', this.handleInteractKey);
        this.input.keyboard.off('keydown-ESC', this.handleEscapeKey);
        this.inputHandlersRegistered = false;
    }

    private getNearestBird(): BirdNPC | undefined {
        return this.interactionSystem.findNearest(this.player, this.birds);
    }

    private openBirdPanelIfNearby(bird: BirdNPC): void {
        if (this.birdInfoPanel.isOpen()) {
            return;
        }

        const nearestBird = this.getNearestBird();
        if (nearestBird?.id === bird.id) {
            this.openBirdPanel(bird.profile);
        }
    }

    private openBirdPanel(profile: BirdProfile): void {
        this.inputSystem.setEnabled(false);
        this.hud.setInteractionText('');
        this.birdInfoPanel.show(profile, () => this.inputSystem.setEnabled(true));
    }
}
