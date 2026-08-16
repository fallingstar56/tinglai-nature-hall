// 音频系统文件，封装自然大厅环境音、动物音效和 UI 音效的播放入口。
import { Scene } from 'phaser';
import type { BirdProfile } from '../types';

export type BirdAudioState = 'idle' | 'loading' | 'playing' | 'paused' | 'unavailable';

export class AudioSystem {
    private currentBirdAudio?: HTMLAudioElement;
    private currentBirdId?: string;
    private currentState: BirdAudioState = 'idle';
    private stateCallback?: (state: BirdAudioState) => void;
    private readonly audioAvailability = new Map<string, boolean>();

    public constructor(private readonly scene: Scene) {}

    public playAmbientLoop(key: string, volume = 0.35): void {
        if (!this.scene.cache.audio.exists(key) || this.scene.sound.get(key)) {
            return;
        }

        this.scene.sound.play(key, {
            loop: true,
            volume
        });
    }

    public stopAll(): void {
        this.stopCurrentBirdCall();
        this.scene.sound.stopAll();
    }

    public async toggleBirdCall(profile: BirdProfile, onStateChange?: (state: BirdAudioState) => void): Promise<BirdAudioState> {
        if (!await this.isBirdAudioAvailable(profile)) {
            this.stopCurrentBirdCall();
            this.stateCallback = onStateChange;
            this.setBirdAudioState('unavailable');
            return this.currentState;
        }

        if (this.currentBirdId === profile.id && this.currentBirdAudio) {
            this.stateCallback = onStateChange;

            if (this.currentBirdAudio.paused) {
                return this.playExistingBirdCall();
            }

            this.currentBirdAudio.pause();
            this.setBirdAudioState('paused');
            return this.currentState;
        }

        this.stopCurrentBirdCall();
        this.stateCallback = onStateChange;
        this.currentBirdId = profile.id;
        this.currentBirdAudio = new Audio(profile.assets.audio);
        this.currentBirdAudio.preload = 'auto';
        this.currentBirdAudio.onended = () => this.setBirdAudioState('idle');
        this.currentBirdAudio.onerror = () => {
            this.stopCurrentBirdCall(false, false);
            this.setBirdAudioState('unavailable');
        };
        this.setBirdAudioState('loading');

        return this.playExistingBirdCall();
    }

    public async isBirdAudioAvailable(profile: BirdProfile): Promise<boolean> {
        const audioUrl = profile.assets.audio;

        if (!audioUrl) {
            return false;
        }

        const cached = this.audioAvailability.get(audioUrl);
        if (cached !== undefined) {
            return cached;
        }

        const available = await this.probeAudioUrl(audioUrl);
        this.audioAvailability.set(audioUrl, available);

        return available;
    }

    public stopCurrentBirdCall(resetState = true, clearCallback = true): void {
        if (this.currentBirdAudio) {
            this.currentBirdAudio.pause();
            this.currentBirdAudio.currentTime = 0;
            this.currentBirdAudio.onended = null;
            this.currentBirdAudio.onerror = null;
            this.currentBirdAudio.removeAttribute('src');
            this.currentBirdAudio.load();
        }

        this.currentBirdAudio = undefined;
        this.currentBirdId = undefined;

        if (clearCallback) {
            this.stateCallback = undefined;
        }

        if (resetState) {
            this.setBirdAudioState('idle');
        }
    }

    private async playExistingBirdCall(): Promise<BirdAudioState> {
        if (!this.currentBirdAudio) {
            this.setBirdAudioState('unavailable');
            return this.currentState;
        }

        this.setBirdAudioState('loading');

        try {
            await this.currentBirdAudio.play();
            this.setBirdAudioState('playing');
        } catch {
            this.stopCurrentBirdCall(false, false);
            this.setBirdAudioState('unavailable');
        }

        return this.currentState;
    }

    private async probeAudioUrl(audioUrl: string): Promise<boolean> {
        const headResult = await this.fetchAudioProbe(audioUrl, { method: 'HEAD' });

        if (headResult !== undefined) {
            return headResult;
        }

        return await this.fetchAudioProbe(audioUrl, {
            method: 'GET',
            headers: {
                Range: 'bytes=0-0'
            }
        }) ?? false;
    }

    private async fetchAudioProbe(audioUrl: string, init: RequestInit): Promise<boolean | undefined> {
        try {
            const response = await fetch(audioUrl, {
                ...init,
                cache: 'no-store'
            });

            if (!response.ok) {
                return false;
            }

            const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';

            if (contentType.includes('text/html')) {
                return false;
            }

            if (contentType.startsWith('audio/')) {
                return true;
            }

            return contentType.includes('application/octet-stream') && this.hasPlayableAudioExtension(audioUrl);
        } catch {
            return undefined;
        }
    }

    private hasPlayableAudioExtension(audioUrl: string): boolean {
        return /\.(aac|flac|m4a|mp3|oga|ogg|wav|webm)(?:[?#].*)?$/i.test(audioUrl);
    }

    private setBirdAudioState(state: BirdAudioState): void {
        this.currentState = state;
        this.stateCallback?.(state);
    }
}
