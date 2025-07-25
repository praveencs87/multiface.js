// Core fusion manager
export { InputFusionManager } from './InputFusionManager';

// Types
export type {
  InputType,
  MultiModalInput,
  InputState,
  FusionRule,
  FusedInput,
  FusionConfig,
  FusionEventCallbacks,
  ConflictResolutionStrategy
} from './types';

// React hooks
export {
  useFusion,
  useVoiceFusion,
  useGestureFusion,
  useTouchFusion
} from './hooks/useFusion';

// Utilities
export { createDefaultFusionRules } from './utils/defaultRules';
export { FusionLogger } from './utils/logger';
