'use strict';

class AdaptiveModeManager {
    constructor(options = {}) {
        this.mode = options.initialMode || 'chat';
        this.onModeChange = options.onModeChange;
    }
    getMode() {
        return this.mode;
    }
    setMode(mode) {
        var _a;
        if (this.mode !== mode) {
            this.mode = mode;
            (_a = this.onModeChange) === null || _a === void 0 ? void 0 : _a.call(this, mode);
        }
    }
    // Example: context-based switching (stub)
    detectModeFromContext(context) {
        // Add rule-based or ML-driven logic here
        // For now, just a stub
        return this.mode;
    }
}

exports.AdaptiveModeManager = AdaptiveModeManager;
//# sourceMappingURL=index.js.map
