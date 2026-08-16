// 鸟类详情 DOM 面板，展示图像、文字和鸟鸣播放状态。
import { Scene } from 'phaser';
import { AudioSystem, type BirdAudioState } from '../game/systems/AudioSystem';
import type { BirdProfile } from '../game/types';

const panelStyleId = 'tinglai-bird-info-panel-style';
type BirdInfoSection = {
    icon: string;
    title: string;
    body: string | string[];
};

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
        this.card.append(this.createHeader(profile), this.createContent(profile));

        const attribution = this.createAttribution(profile);
        if (attribution) {
            this.card.append(attribution);
        }

        this.card.append(this.createActions(profile));
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

    private createHeader(profile: BirdProfile): HTMLElement {
        const header = document.createElement('header');
        header.className = 'bird-info-header';

        const titleBlock = document.createElement('div');
        titleBlock.className = 'bird-info-title-block';

        const nameRow = document.createElement('div');
        nameRow.className = 'bird-info-name-row';

        const title = document.createElement('h2');
        title.textContent = profile.displayName;
        nameRow.append(title);

        if (profile.category) {
            const category = document.createElement('span');
            category.className = 'bird-info-tag';
            category.textContent = profile.category;
            nameRow.append(category);
        }

        if (profile.pronunciation) {
            const pronunciation = document.createElement('p');
            pronunciation.className = 'bird-info-pronunciation';
            pronunciation.textContent = profile.pronunciation;
            titleBlock.append(nameRow, pronunciation);
        } else {
            titleBlock.append(nameRow);
        }

        const latinName = document.createElement('p');
        latinName.className = 'bird-info-latin';
        latinName.textContent = profile.latinName;
        titleBlock.append(latinName);

        header.append(this.createPortrait(profile), titleBlock, this.createCloseButton());
        return header;
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

        const sections = this.getInfoSections(profile);
        for (const section of sections) {
            content.append(this.createInfoSection(section));
        }

        return content;
    }

    private getInfoSections(profile: BirdProfile): BirdInfoSection[] {
        const sections: BirdInfoSection[] = [
            {
                icon: '概',
                title: '概览',
                body: profile.summary
            },
            {
                icon: '栖',
                title: '栖息地',
                body: profile.habitat
            },
            {
                icon: '辨',
                title: '识别特征',
                body: profile.recognitionTips
            }
        ];

        if (profile.callFeatures) {
            sections.push({
                icon: '声',
                title: '鸣声特征',
                body: profile.callFeatures
            });
        }

        if (profile.behavior) {
            sections.push({
                icon: '习',
                title: '习性',
                body: profile.behavior
            });
        }

        if (profile.distribution) {
            sections.push({
                icon: '布',
                title: '分布',
                body: profile.distribution
            });
        }

        if (profile.conservationStatus) {
            sections.push({
                icon: '护',
                title: '保护级别',
                body: profile.conservationStatus
            });
        }

        if (profile.funFact) {
            sections.push({
                icon: '知',
                title: '趣味知识',
                body: profile.funFact
            });
        }

        return sections.filter((section) => Array.isArray(section.body) ? section.body.length > 0 : section.body.trim().length > 0);
    }

    private createInfoSection(section: BirdInfoSection): HTMLElement {
        const row = document.createElement('section');
        row.className = 'bird-info-section';

        const icon = document.createElement('div');
        icon.className = 'bird-info-section-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = section.icon;

        const copy = document.createElement('div');
        copy.className = 'bird-info-section-copy';

        const title = document.createElement('h3');
        title.textContent = section.title;
        copy.append(title);

        if (Array.isArray(section.body)) {
            const list = document.createElement('ul');
            for (const bodyItem of section.body) {
                if (!bodyItem.trim()) {
                    continue;
                }

                const item = document.createElement('li');
                item.textContent = bodyItem;
                list.append(item);
            }
            copy.append(list);
        } else {
            const body = document.createElement('p');
            body.textContent = section.body;
            copy.append(body);
        }

        row.append(icon, copy);
        return row;
    }

    private createAttribution(profile: BirdProfile): HTMLDivElement | undefined {
        if (!profile.audioCredit) {
            return undefined;
        }

        const creditRows: Array<[string, string | undefined]> = [
            ['来源', profile.audioCredit.source],
            ['录制者', profile.audioCredit.anonymous ? '匿名或待补充' : profile.audioCredit.recorder],
            ['时间', profile.audioCredit.recordedAt],
            ['地点', profile.audioCredit.location],
            ['授权', profile.audioCredit.license]
        ];
        const visibleRows = creditRows.filter(([, value]) => Boolean(value));

        if (visibleRows.length === 0) {
            return undefined;
        }

        const attribution = document.createElement('div');
        attribution.className = 'bird-info-attribution';

        const title = document.createElement('h3');
        title.textContent = '音频来源与授权';
        attribution.append(title);

        const details = document.createElement('div');
        details.className = 'bird-info-credit-lines';

        for (const [label, value] of visibleRows) {
            const row = document.createElement('p');
            const key = document.createElement('span');
            key.textContent = `${label}：`;
            row.append(key, document.createTextNode(value ?? ''));
            details.append(row);
        }

        attribution.append(details);
        return attribution;
    }

    private createActions(profile: BirdProfile): HTMLDivElement {
        const controls = document.createElement('div');
        controls.className = 'bird-info-actions';

        this.audioButton = document.createElement('button');
        this.audioButton.type = 'button';
        this.audioButton.className = 'bird-info-audio-button';
        this.audioButton.textContent = profile.assets.audio ? '检测音频' : '暂无音频';
        this.audioButton.disabled = true;
        this.audioButton.addEventListener('click', () => void this.toggleAudio(profile));

        this.audioStatus = document.createElement('p');
        this.audioStatus.className = 'bird-info-audio-status';
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
                place-items: center;
                padding: 60px;
                box-sizing: border-box;
                overflow: hidden;
                pointer-events: auto;
                background: rgba(28, 34, 29, 0.22);
                backdrop-filter: blur(7px) saturate(0.82) brightness(0.88);
                -webkit-backdrop-filter: blur(7px) saturate(0.82) brightness(0.88);
            }

            .bird-info-overlay[hidden] {
                display: none;
            }

            .bird-info-card {
                position: relative;
                width: min(560px, calc(100vw - 120px));
                max-height: calc(100vh - 120px);
                overflow: auto;
                box-sizing: border-box;
                padding: 24px;
                border: 1px solid rgba(76, 99, 82, 0.2);
                border-radius: 14px;
                background:
                    linear-gradient(180deg, rgba(251, 248, 239, 0.96), rgba(238, 244, 230, 0.94)),
                    rgba(246, 244, 235, 0.94);
                color: #203229;
                font-family: Arial, "Microsoft YaHei", sans-serif;
                box-shadow: 0 24px 58px rgba(22, 37, 29, 0.28);
                backdrop-filter: blur(12px);
                animation: birdPanelIn 160ms ease-out;
            }

            .bird-info-header {
                position: relative;
                display: grid;
                grid-template-columns: 104px minmax(0, 1fr) 36px;
                align-items: center;
                gap: 18px;
                padding-bottom: 18px;
                border-bottom: 1px solid rgba(48, 70, 55, 0.14);
            }

            .bird-info-close {
                width: 36px;
                height: 36px;
                border: 1px solid rgba(45, 68, 53, 0.18);
                border-radius: 10px;
                background: rgba(255, 255, 255, 0.58);
                color: #2d4435;
                font-size: 24px;
                line-height: 1;
                cursor: pointer;
            }

            .bird-info-close:hover {
                background: rgba(230, 235, 219, 0.82);
            }

            .bird-info-portrait-frame {
                position: relative;
                display: grid;
                place-items: center;
                width: 104px;
                height: 104px;
                overflow: hidden;
                border: 1px solid rgba(54, 78, 61, 0.16);
                border-radius: 50%;
                background:
                    radial-gradient(circle at 30% 25%, rgba(231, 206, 132, 0.35), transparent 34%),
                    linear-gradient(145deg, #dfe8cf, #789278);
                box-shadow: inset 0 0 0 6px rgba(255, 255, 255, 0.36);
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
                max-width: 76px;
                color: rgba(37, 55, 44, 0.72);
                font-size: 18px;
                font-weight: 700;
                line-height: 1.28;
                text-align: center;
            }

            .bird-info-title-block {
                min-width: 0;
            }

            .bird-info-name-row {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                gap: 10px;
                min-width: 0;
            }

            .bird-info-name-row h2 {
                margin: 0;
                color: #1d3026;
                font-size: 30px;
                line-height: 1.18;
                overflow-wrap: anywhere;
            }

            .bird-info-tag {
                display: inline-flex;
                align-items: center;
                min-height: 26px;
                padding: 0 10px;
                border: 1px solid rgba(82, 111, 70, 0.2);
                border-radius: 999px;
                background: rgba(116, 145, 91, 0.13);
                color: #41603e;
                font-size: 13px;
                font-weight: 700;
                max-width: 100%;
                overflow-wrap: anywhere;
            }

            .bird-info-pronunciation {
                margin: 7px 0 0;
                color: #6e7d63;
                font-size: 14px;
                line-height: 1.4;
                overflow-wrap: anywhere;
            }

            .bird-info-latin {
                margin: 4px 0 0;
                color: #72806a;
                font-style: italic;
                font-size: 14px;
                line-height: 1.45;
                overflow-wrap: anywhere;
            }

            .bird-info-content {
                display: grid;
                gap: 0;
            }

            .bird-info-section {
                display: grid;
                grid-template-columns: 36px minmax(0, 1fr);
                gap: 14px;
                padding: 16px 0;
                border-bottom: 1px solid rgba(48, 70, 55, 0.12);
            }

            .bird-info-section-icon {
                display: grid;
                place-items: center;
                width: 36px;
                height: 36px;
                border-radius: 10px;
                background: rgba(96, 125, 85, 0.13);
                color: #446142;
                font-size: 13px;
                font-weight: 700;
            }

            .bird-info-section-copy {
                min-width: 0;
                overflow-wrap: anywhere;
            }

            .bird-info-section-copy h3,
            .bird-info-attribution h3 {
                margin: 0 0 6px;
                color: #24372d;
                font-size: 15px;
                font-weight: 700;
                line-height: 1.4;
            }

            .bird-info-section-copy p,
            .bird-info-section-copy li,
            .bird-info-attribution p,
            .bird-info-audio-status {
                color: #536356;
                font-size: 14px;
                line-height: 1.75;
                overflow-wrap: anywhere;
            }

            .bird-info-section-copy p,
            .bird-info-attribution p,
            .bird-info-audio-status {
                margin: 0;
            }

            .bird-info-section-copy ul {
                margin: 0;
                padding-left: 18px;
            }

            .bird-info-attribution {
                padding: 15px 0;
                border-bottom: 1px solid rgba(48, 70, 55, 0.12);
            }

            .bird-info-credit-lines {
                display: grid;
                gap: 2px;
                min-width: 0;
            }

            .bird-info-credit-lines span {
                color: #2e4536;
                font-weight: 700;
            }

            .bird-info-actions {
                display: flex;
                align-items: center;
                gap: 12px;
                padding-top: 16px;
            }

            .bird-info-audio-button {
                min-width: 128px;
                min-height: 42px;
                border: 0;
                border-radius: 9px;
                background: #5d744d;
                color: #fbf8ef;
                font-weight: 700;
                cursor: pointer;
            }

            .bird-info-audio-button:hover:not(:disabled) {
                background: #4d643f;
            }

            .bird-info-audio-button:disabled {
                background: rgba(53, 71, 57, 0.16);
                color: rgba(37, 55, 44, 0.52);
                cursor: default;
            }

            .bird-info-audio-status {
                flex: 1;
                min-width: 0;
                overflow-wrap: anywhere;
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
                    place-items: center;
                    padding: 24px 16px;
                }

                .bird-info-card {
                    width: calc(100vw - 32px);
                    max-height: calc(100vh - 48px);
                    padding: 16px;
                }

                .bird-info-header {
                    grid-template-columns: 72px minmax(0, 1fr) 34px;
                    gap: 12px;
                }

                .bird-info-portrait-frame {
                    width: 72px;
                    height: 72px;
                }

                .bird-info-portrait-placeholder {
                    max-width: 54px;
                    font-size: 14px;
                }

                .bird-info-name-row h2 {
                    font-size: 23px;
                }

                .bird-info-close {
                    width: 34px;
                    height: 34px;
                }

                .bird-info-section {
                    grid-template-columns: 32px minmax(0, 1fr);
                    gap: 12px;
                    padding: 14px 0;
                }

                .bird-info-section-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 9px;
                }

                .bird-info-actions {
                    align-items: stretch;
                    flex-direction: column;
                }

                .bird-info-audio-button {
                    width: 100%;
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
