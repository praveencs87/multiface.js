export type InputMode = 'chat' | 'voice' | 'gui';

export interface AdaptiveModeManagerOptions {
  initialMode?: InputMode;
  onModeChange?: (mode: InputMode) => void;
}

export class AdaptiveModeManager {
  private mode: InputMode;
  private onModeChange?: (mode: InputMode) => void;

  constructor(options: AdaptiveModeManagerOptions = {}) {
    this.mode = options.initialMode || 'chat';
    this.onModeChange = options.onModeChange;
  }

  getMode(): InputMode {
    return this.mode;
  }

  setMode(mode: InputMode) {
    if (this.mode !== mode) {
      this.mode = mode;
      this.onModeChange?.(mode);
    }
  }

  // Example: context-based switching (stub)
  detectModeFromContext(context: any) {
    // Add rule-based or ML-driven logic here
    // For now, just a stub
    return this.mode;
  }
} 