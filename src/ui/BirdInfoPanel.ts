// 鸟类详情 DOM 面板，展示图像、文字和鸟鸣播放状态。
import { Scene } from 'phaser';
import { AudioSystem, type BirdAudioState } from '../game/systems/AudioSystem';
import type { BirdProfile } from '../game/types';

const panelStyleId = 'tinglai-bird-info-panel-style';

export class BirdInfoPanel {
    private readonly root: HTMLDivElement;
    private readonly card: HTMLDivElement;
    private currentProfile?: BirdProfile;
    private audioButton?: HTMLButtonElement;
    private audioStatus?: HTMLParagraphElement;
    private closeCallback?: () => void;
    private audioProbeToken = 0;

    public constructor(
        private readonly scene: Scene,
        private readonly audioSystem: AudioSystem
    ) {
        this.installStyles();

        this.root = document.createElement('div');
        this.root.className = 'bird-info-overlay';
        this.root.hidden = true;

        this.card = document.createElement('div');
        this.card.className = 'bird-info-card';
        this.card.setAttribute('role', 'dialog');
        this.card.setAttribute('aria-modal', 'true');
        this.root.append(this.card);

        const parent = this.scene.game.canvas.parentElement ?? document.body;
        parent.append(this.root);

        this.scene.events.once('shutdown', () => this.destroy());
        this.scene.events.once('destroy', () => this.destroy());
    }

    public show(profile: BirdProfile, onClose: () => void): void {
        if (this.currentProfile?.id !== profile.id) {
            this.audioSystem.stopCurrentBirdCall();
        }

        this.currentProfile = profile;
        this.closeCallback = onClose;
        this.card.replaceChildren();
        this.card.append(this.createCloseButton(), this.createPortrait(profile), this.createContent(profile));
        this.root.hidden = false;
    }

    public close(): void {
        if (this.root.hidden) {
            return;
        }

        this.audioSystem.stopCurrentBirdCall();
        this.root.hidden = true;
        this.currentProfile = undefined;
        this.audioButton = undefined;
        this.audioStatus = undefined;
        this.audioProbeToken += 1;
        this.closeCallback?.();
    }

    public isOpen(): boolean {
        return !this.root.hidden;
    }

    private createCloseButton(): HTMLButtonElement {
        const button = document.createElement('button');
        button.className = 'bird-info-close';
        button.type = 'button';
        button.setAttribute('aria-label', '关闭鸟类详情');
        button.textContent = '×';
        button.addEventListener('click', () => this.close());

        return button;
    }

    private createPortrait(profile: BirdProfile): HTMLDivElement {
        const frame = document.createElement('div');
        frame.className = 'bird-info-portrait-frame';

        const placeholder = document.createElement('div');
        placeholder.className = 'bird-info-portrait-placeholder';
        placeholder.textContent = profile.displayName;

        if (!profile.assets.portrait) {
            frame.append(placeholder);
            return frame;
        }

        const image = document.createElement('img');
        image.className = 'bird-info-portrait';
        image.src = profile.assets.portrait;
        image.alt = `${profile.displayName} 展示图`;
        image.addEventListener('error', () => {
            image.remove();
            if (!frame.contains(placeholder)) {
                frame.append(placeholder);
            }
        });

        frame.append(image, placeholder);
        return frame;
    }

    private createContent(profile: BirdProfile): HTMLDivElement {
        const content = document.createElement('div');
        content.className = 'bird-info-content';

        const title = document.createElement('h2');
        title.textContent = profile.displayName;

        const latinName = document.createElement('p');
        latinName.className = 'bird-info-latin';
        latinName.textContent = profile.latinName;

        const summary = document.createElement('p');
        summary.className = 'bird-info-summary';
        summary.textContent = profile.summary;

        const habitat = document.createElement('p');
        habitat.className = 'bird-info-habitat';
        habitat.textContent = `栖息地：${profile.habitat}`;

        const tipsTitle = document.createElement('h3');
        tipsTitle.textContent = '识别特征';

        const tips = document.createElement('ul');
        tips.className = 'bird-info-tips';
        for (const tip of profile.recognitionTips) {
            const item = document.createElement('li');
            item.textContent = tip;
            tips.append(item);
        }

        const audioControls = this.createAudioControls(profile);
        content.append(title, latinName, summary, habitat, tipsTitle, tips, audioControls);

        return content;
    }

    private createAudioControls(profile: BirdProfile): HTMLDivElement {
        const controls = document.createElement('div');
        controls.className = 'bird-info-audio';

        this.audioButton = document.createElement('button');
        this.audioButton.type = 'button';
        this.audioButton.textContent = profile.assets.audio ? '检测音频' : '暂无音频';
        this.audioButton.disabled = true;
        this.audioButton.addEventListener('click', () => void this.toggleAudio(profile));

        this.audioStatus = document.createElement('p');
        this.audioStatus.textContent = profile.assets.audio ? '声音状态：检测中' : '声音状态：暂不可播放';

        controls.append(this.audioButton, this.audioStatus);
        void this.refreshAudioAvailability(profile);
        return controls;
    }

    private async refreshAudioAvailability(profile: BirdProfile): Promise<void> {
        const token = this.audioProbeToken + 1;
        this.audioProbeToken = token;

        if (!profile.assets.audio) {
            this.applyAudioState('unavailable');
            return;
        }

        const isAvailable = await this.audioSystem.isBirdAudioAvailable(profile);

        if (this.audioProbeToken !== token || this.currentProfile?.id !== profile.id || this.root.hidden) {
            return;
        }

        this.applyAudioState(isAvailable ? 'idle' : 'unavailable');
    }

    private async toggleAudio(profile: BirdProfile): Promise<void> {
        if (!this.audioButton || !this.audioStatus) {
            return;
        }

        this.audioButton.disabled = true;
        this.audioStatus.textContent = '声音状态：加载中';
        const state = await this.audioSystem.toggleBirdCall(profile, (nextState) => this.applyAudioState(nextState));
        this.applyAudioState(state);
    }

    private applyAudioState(state: BirdAudioState): void {
        if (!this.audioButton || !this.audioStatus) {
            return;
        }

        const labelByState: Record<BirdAudioState, string> = {
            idle: '播放鸟鸣',
            loading: '加载中',
            playing: '暂停鸟鸣',
            paused: '继续播放',
            unavailable: '暂无音频'
        };
        const statusByState: Record<BirdAudioState, string> = {
            idle: '声音状态：待播放',
            loading: '声音状态：加载中',
            playing: '声音状态：播放中',
            paused: '声音状态：已暂停',
            unavailable: '声音状态：暂不可播放'
        };

        this.audioButton.textContent = labelByState[state];
        this.audioButton.disabled = state === 'loading' || state === 'unavailable';
        this.audioStatus.textContent = statusByState[state];
    }

    private installStyles(): void {
        if (document.getElementById(panelStyleId)) {
            return;
        }

        const style = document.createElement('style');
        style.id = panelStyleId;
        style.textContent = `
            .bird-info-overlay {
                position: fixed;
                inset: 0;
                z-index: 20;
                display: grid;
                place-items: center end;
                padding: 24px;
                box-sizing: border-box;
                pointer-events: auto;
            }

            .bird-info-overlay[hidden] {
                display: none;
            }

            .bird-info-card {
                position: relative;
                width: min(420px, calc(100vw - 32px));
                max-height: min(680px, calc(100vh - 32px));
                overflow: auto;
                box-sizing: border-box;
                padding: 18px;
                border: 1px solid rgba(223, 236, 206, 0.22);
                border-radius: 8px;
                background: rgba(24, 38, 32, 0.88);
                color: #edf4df;
                font-family: Arial, "Microsoft YaHei", sans-serif;
                box-shadow: 0 20px 48px rgba(0, 0, 0, 0.34);
                backdrop-filter: blur(12px);
                animation: birdPanelIn 160ms ease-out;
            }

            .bird-info-close {
                position: absolute;
                top: 10px;
                right: 10px;
                width: 32px;
                height: 32px;
                border: 1px solid rgba(237, 244, 223, 0.28);
                border-radius: 6px;
                background: rgba(237, 244, 223, 0.08);
                color: #edf4df;
                font-size: 22px;
                line-height: 1;
                cursor: pointer;
            }

            .bird-info-portrait-frame {
                position: relative;
                display: grid;
                place-items: center;
                aspect-ratio: 4 / 3;
                overflow: hidden;
                margin-bottom: 16px;
                border-radius: 7px;
                background:
                    radial-gradient(circle at 30% 25%, rgba(244, 227, 178, 0.2), transparent 34%),
                    linear-gradient(145deg, #435a4e, #1d2f29);
            }

            .bird-info-portrait {
                position: absolute;
                inset: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                z-index: 1;
            }

            .bird-info-portrait-placeholder {
                color: rgba(237, 244, 223, 0.72);
                font-size: 20px;
                font-weight: 700;
            }

            .bird-info-content h2 {
                margin: 0;
                font-size: 28px;
                line-height: 1.18;
            }

            .bird-info-latin {
                margin: 4px 0 14px;
                color: rgba(237, 244, 223, 0.72);
                font-style: italic;
                font-size: 14px;
            }

            .bird-info-summary,
            .bird-info-habitat,
            .bird-info-tips,
            .bird-info-audio p {
                color: rgba(237, 244, 223, 0.86);
                font-size: 14px;
                line-height: 1.7;
            }

            .bird-info-habitat {
                padding: 10px 12px;
                border-radius: 7px;
                background: rgba(237, 244, 223, 0.08);
            }

            .bird-info-content h3 {
                margin: 16px 0 8px;
                font-size: 15px;
            }

            .bird-info-tips {
                padding-left: 20px;
                margin: 0;
            }

            .bird-info-audio {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-top: 18px;
                padding-top: 14px;
                border-top: 1px solid rgba(237, 244, 223, 0.16);
            }

            .bird-info-audio button {
                min-width: 96px;
                min-height: 36px;
                border: 0;
                border-radius: 6px;
                background: #d9c37c;
                color: #17201c;
                font-weight: 700;
                cursor: pointer;
            }

            .bird-info-audio button:disabled {
                background: rgba(237, 244, 223, 0.18);
                color: rgba(237, 244, 223, 0.58);
                cursor: default;
            }

            .bird-info-audio p {
                margin: 0;
            }

            @keyframes birdPanelIn {
                from {
                    opacity: 0;
                    transform: translateY(8px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @media (max-width: 640px) {
                .bird-info-overlay {
                    place-items: end center;
                    padding: 16px;
                }

                .bird-info-card {
                    padding: 16px;
                }

                .bird-info-audio {
                    align-items: stretch;
                    flex-direction: column;
                }
            }
        `;
        document.head.append(style);
    }

    private destroy(): void {
        this.audioSystem.stopCurrentBirdCall();
        this.root.remove();
    }
}
