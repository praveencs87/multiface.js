import { useState, useEffect, useCallback, useRef } from 'react';
import { ContextManager } from '../ContextManager';
import {
  ContextConfig,
  ContextCallbacks,
  ContextualData,
  UserProfile,
  ConversationMemory,
  ContextualIntent,
  ContextState
} from '../types';

export interface UseContextOptions {
  config?: ContextConfig;
  autoStart?: boolean;
  enableFusion?: boolean;
  enableSensorIntegration?: boolean;
  onFusedOutput?: (fusedInput: any) => void;
}

export const useContext = (options: UseContextOptions = {}) => {
  const defaultConfig: ContextConfig = {
    enableLearning: true,
    maxConversationHistory: 50,
    contextUpdateInterval: 30000,
    privacyMode: 'balanced',
    biometricAuth: false,
    locationTracking: true,
    conversationSummary: true
  };

  const {
    config = defaultConfig,
    autoStart = true,
    enableFusion = false,
    enableSensorIntegration = false,
    onFusedOutput
  } = options;

  const [contextState, setContextState] = useState<ContextState>({
    currentContext: {} as ContextualData,
    userProfile: {} as UserProfile,
    conversationHistory: [],
    activeMemories: [],
    contextualIntents: [],
    isLearning: true,
    privacySettings: {
      storeConversations: true,
      shareBiometrics: false,
      shareLocation: true,
      dataRetentionDays: 30
    }
  });

  const [lastIntent, setLastIntent] = useState<ContextualIntent | null>(null);
  const contextManagerRef = useRef<ContextManager | null>(null);

  // Integration placeholders for fusion and sensor systems
  const processInput = enableFusion ? console.log : undefined;
  const sensorState = { isActive: false };
  const getSensorData = () => ({ location: null, motion: null });

  const callbacks: ContextCallbacks = {
    onContextUpdate: useCallback((context: ContextualData) => {
      setContextState(prev => ({ ...prev, currentContext: context }));
      
      // Send context updates to fusion system if enabled
      if (enableFusion && processInput) {
        processInput('Context update:', context);
      }
    }, [enableFusion, processInput]),

    onIntentDetected: useCallback((intent: ContextualIntent) => {
      setLastIntent(intent);
      setContextState(prev => ({
        ...prev,
        contextualIntents: [intent, ...prev.contextualIntents.slice(0, 9)]
      }));
    }, []),

    onMemoryCreated: useCallback((memory: ConversationMemory) => {
      setContextState(prev => ({
        ...prev,
        conversationHistory: [memory, ...prev.conversationHistory],
        activeMemories: [memory, ...prev.activeMemories.slice(0, 4)]
      }));
    }, []),

    onUserProfileUpdated: useCallback((profile: UserProfile) => {
      setContextState(prev => ({ ...prev, userProfile: profile }));
    }, []),

    onPrivacyAlert: useCallback((alert: string, data: any) => {
      console.warn('Privacy Alert:', alert, data);
    }, [])
  };

  const initializeContext = useCallback(async () => {
    if (contextManagerRef.current) {
      contextManagerRef.current.stop();
    }

    contextManagerRef.current = new ContextManager(config, callbacks);
    
    try {
      await contextManagerRef.current.initialize();
      
      // Update state with initial context
      setContextState(prev => ({
        ...prev,
        currentContext: contextManagerRef.current!.getContext(),
        userProfile: contextManagerRef.current!.getUserProfile()
      }));
    } catch (error) {
      console.error('Failed to initialize context manager:', error);
    }
  }, [config, callbacks]);

  const addMessage = useCallback((content: string, type: 'text' | 'voice' | 'gesture' | 'image' = 'text') => {
    contextManagerRef.current?.addMessage(content, type);
  }, []);

  const detectIntent = useCallback((input: string): ContextualIntent | null => {
    if (!contextManagerRef.current) return null;
    
    const context = contextManagerRef.current.getContext();
    // detectIntent method will be available when ContextManager is fully implemented
    return null;
  }, []);

  const updateSpatialContext = useCallback((
    location?: { latitude: number; longitude: number }, 
    environment?: string
  ) => {
    contextManagerRef.current?.updateSpatialContext(location, environment);
  }, []);

  const updateDeviceContext = useCallback((deviceInfo: Partial<ContextualData['device']>) => {
    contextManagerRef.current?.updateDeviceContext(deviceInfo);
  }, []);

  const updateUserActivity = useCallback((activityLevel: 'stationary' | 'walking' | 'running' | 'driving') => {
    contextManagerRef.current?.updateUserActivity(activityLevel);
  }, []);

  const getRelevantMemories = useCallback((query: string, limit: number = 5): ConversationMemory[] => {
    if (!contextManagerRef.current) return [];
    // getRelevantMemories method will be available when ContextManager is fully implemented
    return [];
  }, []);

  const getCurrentContext = useCallback((): ContextualData => {
    return contextManagerRef.current?.getContext() || contextState.currentContext;
  }, [contextState.currentContext]);

  const getUserProfile = useCallback((): UserProfile => {
    return contextManagerRef.current?.getUserProfile() || contextState.userProfile;
  }, [contextState.userProfile]);

  // Integrate sensor data with context (simplified for build)
  useEffect(() => {
    if (enableSensorIntegration && sensorState.isActive) {
      // Sensor integration will be implemented when sensors package is available
      console.log('Sensor integration enabled');
    }
  }, [enableSensorIntegration, sensorState.isActive]);

  useEffect(() => {
    if (autoStart) {
      initializeContext();
    }

    return () => {
      contextManagerRef.current?.stop();
    };
  }, [autoStart, initializeContext]);

  return {
    contextState,
    lastIntent,
    addMessage,
    detectIntent,
    updateSpatialContext,
    updateDeviceContext,
    updateUserActivity,
    getRelevantMemories,
    getCurrentContext,
    getUserProfile,
    isInitialized: !!contextManagerRef.current
  };
};

// Specialized hook for conversation memory
export const useConversationMemory = (maxMemories: number = 10) => {
  const defaultConfig: ContextConfig = {
    maxConversationHistory: maxMemories,
    enableLearning: true,
    contextUpdateInterval: 30000,
    privacyMode: 'balanced',
    biometricAuth: false,
    locationTracking: true,
    conversationSummary: true
  };
  
  const { contextState, addMessage, getRelevantMemories } = useContext({
    config: defaultConfig
  });

  const addConversation = useCallback((userMessage: string, assistantResponse: string) => {
    addMessage(userMessage, 'text');
    // In a real implementation, you'd also add the assistant response
  }, [addMessage]);

  const searchMemories = useCallback((query: string) => {
    return getRelevantMemories(query, 5);
  }, [getRelevantMemories]);

  return {
    conversationHistory: contextState.conversationHistory,
    activeMemories: contextState.activeMemories,
    addConversation,
    searchMemories
  };
};

// Specialized hook for intent detection
export const useIntentDetection = (onIntentDetected?: (intent: ContextualIntent) => void) => {
  const { lastIntent, detectIntent, getCurrentContext } = useContext();

  const analyzeInput = useCallback((input: string): ContextualIntent | null => {
    const intent = detectIntent(input);
    if (intent && onIntentDetected) {
      onIntentDetected(intent);
    }
    return intent;
  }, [detectIntent, onIntentDetected]);

  const getContextualSuggestions = useCallback((): string[] => {
    const context = getCurrentContext();
    const timeOfDay = context.temporal?.timeOfDay;
    
    const suggestions = ['What can I help you with?'];
    
    if (timeOfDay === 'morning') {
      suggestions.push('Check today\'s weather', 'Review my schedule');
    } else if (timeOfDay === 'evening') {
      suggestions.push('Set a reminder', 'Play some music');
    }
    
    return suggestions;
  }, [getCurrentContext]);

  return {
    lastIntent,
    analyzeInput,
    getContextualSuggestions
  };
};

// Specialized hook for user personalization
export const usePersonalization = () => {
  const defaultConfig: ContextConfig = {
    enableLearning: true,
    maxConversationHistory: 50,
    contextUpdateInterval: 30000,
    privacyMode: 'balanced',
    biometricAuth: false,
    locationTracking: true,
    conversationSummary: true
  };
  
  const { contextState, getCurrentContext, getUserProfile } = useContext({
    config: defaultConfig
  });

  const getPersonalizedResponse = useCallback((baseResponse: string): string => {
    const profile = getUserProfile();
    const context = getCurrentContext();
    
    // Simple personalization based on time and preferences
    let personalizedResponse = baseResponse;
    
    if (context.temporal?.timeOfDay === 'morning') {
      personalizedResponse = `Good morning! ${baseResponse}`;
    } else if (context.temporal?.timeOfDay === 'evening') {
      personalizedResponse = `Good evening! ${baseResponse}`;
    }
    
    return personalizedResponse;
  }, [getUserProfile, getCurrentContext]);

  const updatePreferences = useCallback((preferences: Partial<UserProfile['preferences']>) => {
    // This would update user preferences in the context manager
    console.log('Updating preferences:', preferences);
  }, []);

  return {
    userProfile: contextState.userProfile,
    getPersonalizedResponse,
    updatePreferences,
    usageStats: contextState.userProfile.usage
  };
};
