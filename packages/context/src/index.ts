// Core context manager
export { ContextManager } from './ContextManager';

// Types
export type {
  UserProfile,
  ContextualData,
  ConversationMemory,
  ContextualIntent,
  ContextState,
  ContextConfig,
  ContextCallbacks,
  ContextEventType,
  ContextEvent
} from './types';

// React hooks
export {
  useContext,
  useConversationMemory,
  useIntentDetection,
  usePersonalization
} from './hooks/useContext';
