// Audio utility functions for managing AI-generated audio

export interface AudioState {
    isPlaying: boolean;
    currentAudioId: string | null;
    isMuted: boolean;
    volume: number;
}

export class AudioManager {
    private audioRef: React.RefObject<HTMLAudioElement | null>;
    private audioState: AudioState;
    private onStateChange: (state: AudioState) => void;

    constructor(
        audioRef: React.RefObject<HTMLAudioElement | null>,
        onStateChange: (state: AudioState) => void
    ) {
        this.audioRef = audioRef;
        this.onStateChange = onStateChange;
        this.audioState = {
            isPlaying: false,
            currentAudioId: null,
            isMuted: false,
            volume: 0.7
        };
    }

    // Play audio by audio ID
    async playAudio(audioId: string): Promise<boolean> {
        try {
            if (!this.audioRef.current) {
                console.error("Audio ref not available");
                return false;
            }

            // Stop current audio if playing
            if (this.audioState.isPlaying) {
                this.pauseAudio();
            }

            console.log("Playing audio with ID:", audioId);

            // This should not be called directly - use playOpenAIAudio instead
            // which handles the actual AI-generated audio content
            console.error("AudioManager.playAudio should not be used with OpenAI audio IDs");
            return false;
        } catch (error) {
            console.error("Failed to play audio:", error);
            return false;
        }
    }

    // Pause current audio
    pauseAudio(): void {
        if (this.audioRef.current && this.audioState.isPlaying) {
            this.audioRef.current.pause();
            this.audioState.isPlaying = false;
            this.onStateChange({ ...this.audioState });
        }
    }

    // Toggle play/pause
    async togglePlayPause(audioId?: string): Promise<boolean> {
        if (this.audioState.isPlaying) {
            this.pauseAudio();
            return false;
        } else {
            if (audioId) {
                return await this.playAudio(audioId);
            } else if (this.audioState.currentAudioId) {
                return await this.playAudio(this.audioState.currentAudioId);
            }
            return false;
        }
    }

    // Toggle mute/unmute
    toggleMute(): void {
        if (!this.audioRef.current) return;

        this.audioState.isMuted = !this.audioState.isMuted;
        this.audioRef.current.volume = this.audioState.isMuted ? 0 : this.audioState.volume;
        this.onStateChange({ ...this.audioState });
    }

    // Set volume (0-1)
    setVolume(volume: number): void {
        if (!this.audioRef.current) return;

        this.audioState.volume = Math.max(0, Math.min(1, volume));
        if (!this.audioState.isMuted) {
            this.audioRef.current.volume = this.audioState.volume;
        }
        this.onStateChange({ ...this.audioState });
    }

    // Stop audio completely
    stopAudio(): void {
        if (this.audioRef.current) {
            this.audioRef.current.pause();
            this.audioRef.current.currentTime = 0;
        }
        this.audioState.isPlaying = false;
        this.audioState.currentAudioId = null;
        this.onStateChange({ ...this.audioState });
    }

    // Get current audio state
    getState(): AudioState {
        return { ...this.audioState };
    }

    // Check if specific audio is currently playing
    isAudioPlaying(audioId: string): boolean {
        return this.audioState.isPlaying && this.audioState.currentAudioId === audioId;
    }

    // Get audio URL from audio ID
    private getAudioUrl(audioId: string): string {
        // Use our API route to serve the audio content
        return `/api/audio/${audioId}`;
    }

    // Handle audio events
    onAudioPlay = (): void => {
        this.audioState.isPlaying = true;
        this.onStateChange({ ...this.audioState });
    }

    onAudioPause = (): void => {
        this.audioState.isPlaying = false;
        this.onStateChange({ ...this.audioState });
    }

    onAudioEnded = (): void => {
        this.audioState.isPlaying = false;
        this.audioState.currentAudioId = null;
        this.onStateChange({ ...this.audioState });
    }
}

// Hook for using AudioManager in React components
export const useAudioManager = (
    audioRef: React.RefObject<HTMLAudioElement | null>,
    onStateChange: (state: AudioState) => void
) => {
    return new AudioManager(audioRef, onStateChange);
};
