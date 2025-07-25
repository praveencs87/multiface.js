export interface UserProfile {
  id: string;
  name?: string;
  preferences: {
    language: string;
    voiceSettings: {
      preferredVoice?: string;
      speechRate: number;
      volume: number;
    };
    interactionModes: string[];
    personalizations: Record<string, any>;
  };
  usage: {
    totalInteractions: number;
    preferredInputTypes: Record<string, number>;
    commonCommands: string[];
    lastActiveTime: number;
  };
  biometrics?: {
    voiceprint?: string;
    faceId?: string;
    fingerprint?: string;
  };
}

export interface ContextualData {
  temporal: {
    timestamp: number;
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    dayOfWeek: string;
    isWeekend: boolean;
    timezone: string;
  };
  spatial: {
    location?: {
      latitude: number;
      longitude: number;
      address?: string;
      placeName?: string;
    };
    environment: 'indoor' | 'outdoor' | 'vehicle' | 'unknown';
    ambientLight: 'bright' | 'dim' | 'dark' | 'unknown';
    noiseLevel: 'quiet' | 'moderate' | 'loud' | 'unknown';
  };
  device: {
    batteryLevel?: number;
    isCharging?: boolean;
    networkType: 'wifi' | 'cellular' | 'offline';
    orientation: 'portrait' | 'landscape';
    isHeadphonesConnected?: boolean;
  };
  app: {
    currentScreen: string;
    previousScreen?: string;
    sessionDuration: number;
    backgroundApps?: string[];
  };
  user: {
    activityLevel: 'stationary' | 'walking' | 'running' | 'driving';
    mood?: 'happy' | 'neutral' | 'frustrated' | 'excited';
    attentionLevel: 'focused' | 'distracted' | 'multitasking';
  };
}

export interface ConversationMemory {
  id: string;
  timestamp: number;
  participants: string[];
  messages: {
    id: string;
    sender: string;
    content: string;
    type: 'text' | 'voice' | 'gesture' | 'image';
    timestamp: number;
    metadata?: Record<string, any>;
  }[];
  context: ContextualData;
  summary?: string;
  topics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  importance: number; // 1-10 scale
}

export interface ContextualIntent {
  intent: string;
  confidence: number;
  entities: Array<{
    type: string;
    value: string;
    confidence: number;
  }>;
  context: {
    temporal: boolean;
    spatial: boolean;
    personal: boolean;
    conversational: boolean;
  };
  suggestions: string[];
}

export interface ContextState {
  currentContext: ContextualData;
  userProfile: UserProfile;
  conversationHistory: ConversationMemory[];
  activeMemories: ConversationMemory[];
  contextualIntents: ContextualIntent[];
  isLearning: boolean;
  privacySettings: {
    storeConversations: boolean;
    shareBiometrics: boolean;
    shareLocation: boolean;
    dataRetentionDays: number;
  };
}

export interface ContextConfig {
  enableLearning: boolean;
  maxConversationHistory: number;
  contextUpdateInterval: number;
  privacyMode: 'strict' | 'balanced' | 'permissive';
  biometricAuth: boolean;
  locationTracking: boolean;
  conversationSummary: boolean;
}

export interface ContextCallbacks {
  onContextUpdate?: (context: ContextualData) => void;
  onIntentDetected?: (intent: ContextualIntent) => void;
  onMemoryCreated?: (memory: ConversationMemory) => void;
  onUserProfileUpdated?: (profile: UserProfile) => void;
  onPrivacyAlert?: (alert: string, data: any) => void;
}

export type ContextEventType = 
  | 'context_update'
  | 'intent_detected' 
  | 'memory_created'
  | 'profile_updated'
  | 'privacy_alert'
  | 'learning_update';

export interface ContextEvent {
  type: ContextEventType;
  data: any;
  timestamp: number;
  metadata?: Record<string, any>;
}
