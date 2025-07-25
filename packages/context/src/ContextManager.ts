import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ContextState,
  ContextConfig,
  ContextCallbacks,
  ContextualData,
  UserProfile,
  ConversationMemory,
  ContextualIntent,
  ContextEvent
} from './types';

interface ContextStore extends ContextState {
  updateContext: (context: Partial<ContextualData>) => void;
  addConversationMemory: (memory: ConversationMemory) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  detectIntent: (input: string, context: ContextualData) => ContextualIntent;
  getRelevantMemories: (query: string, limit?: number) => ConversationMemory[];
  clearOldMemories: () => void;
}

export class ContextManager {
  private config: ContextConfig;
  private callbacks: ContextCallbacks;
  private store: any;
  private contextUpdateTimer: NodeJS.Timeout | null = null;
  private storageKey = '@multiface_context';

  constructor(config: ContextConfig, callbacks: ContextCallbacks = {}) {
    // Set default values and merge with user config
    const defaultConfig: ContextConfig = {
      enableLearning: true,
      maxConversationHistory: 100,
      contextUpdateInterval: 30000, // 30 seconds
      privacyMode: 'balanced',
      biometricAuth: false,
      locationTracking: true,
      conversationSummary: true
    };
    
    this.config = Object.assign({}, defaultConfig, config);

    this.callbacks = callbacks;
    this.initializeStore();
  }

  private initializeStore() {
    this.store = create<ContextStore>((set, get) => ({
      currentContext: this.getDefaultContext(),
      userProfile: this.getDefaultUserProfile(),
      conversationHistory: [],
      activeMemories: [],
      contextualIntents: [],
      isLearning: this.config.enableLearning,
      privacySettings: {
        storeConversations: this.config.privacyMode !== 'strict',
        shareBiometrics: this.config.biometricAuth,
        shareLocation: this.config.locationTracking,
        dataRetentionDays: this.config.privacyMode === 'strict' ? 7 : 
                          this.config.privacyMode === 'balanced' ? 30 : 90
      },

      updateContext: (contextUpdate: Partial<ContextualData>) => {
        set((state) => {
          const newContext = { ...state.currentContext, ...contextUpdate };
          this.callbacks.onContextUpdate?.(newContext);
          
          // Emit context update event
          this.emitEvent({
            type: 'context_update',
            data: newContext,
            timestamp: Date.now()
          });

          return { currentContext: newContext };
        });
      },

      addConversationMemory: (memory: ConversationMemory) => {
        set((state) => {
          const newHistory = [memory, ...state.conversationHistory]
            .slice(0, this.config.maxConversationHistory);
          
          // Update active memories (last 5 conversations)
          const activeMemories = newHistory.slice(0, 5);
          
          this.callbacks.onMemoryCreated?.(memory);
          
          // Emit memory created event
          this.emitEvent({
            type: 'memory_created',
            data: memory,
            timestamp: Date.now()
          });

          return {
            conversationHistory: newHistory,
            activeMemories
          };
        });
      },

      updateUserProfile: (profileUpdate: Partial<UserProfile>) => {
        set((state) => {
          const newProfile = { ...state.userProfile, ...profileUpdate };
          this.callbacks.onUserProfileUpdated?.(newProfile);
          
          // Emit profile update event
          this.emitEvent({
            type: 'profile_updated',
            data: newProfile,
            timestamp: Date.now()
          });

          return { userProfile: newProfile };
        });
      },

      detectIntent: (input: string, context: ContextualData): ContextualIntent => {
        const intent = this.analyzeIntent(input, context);
        
        set((state) => ({
          contextualIntents: [intent, ...state.contextualIntents.slice(0, 9)]
        }));

        this.callbacks.onIntentDetected?.(intent);
        
        // Emit intent detected event
        this.emitEvent({
          type: 'intent_detected',
          data: intent,
          timestamp: Date.now()
        });

        return intent;
      },

      getRelevantMemories: (query: string, limit: number = 5): ConversationMemory[] => {
        const state = get();
        return this.searchMemories(state.conversationHistory, query, limit);
      },

      clearOldMemories: () => {
        set((state) => {
          const cutoffDate = Date.now() - (state.privacySettings.dataRetentionDays * 24 * 60 * 60 * 1000);
          const filteredHistory = state.conversationHistory.filter(
            memory => memory.timestamp > cutoffDate
          );
          
          return {
            conversationHistory: filteredHistory,
            activeMemories: filteredHistory.slice(0, 5)
          };
        });
      }
    }));
  }

  async initialize(): Promise<void> {
    try {
      await this.loadPersistedData();
      this.startContextUpdates();
    } catch (error) {
      console.error('Failed to initialize context manager:', error);
    }
  }

  private async loadPersistedData(): Promise<void> {
    try {
      const storedData = await AsyncStorage.getItem(this.storageKey);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        
        // Update store with persisted data
        this.store.getState().updateUserProfile(parsedData.userProfile || {});
        
        if (parsedData.conversationHistory && this.store.getState().privacySettings.storeConversations) {
          parsedData.conversationHistory.forEach((memory: ConversationMemory) => {
            this.store.getState().addConversationMemory(memory);
          });
        }
      }
    } catch (error) {
      console.error('Failed to load persisted context data:', error);
    }
  }

  private async persistData(): Promise<void> {
    try {
      const state = this.store.getState();
      const dataToStore = {
        userProfile: state.userProfile,
        conversationHistory: state.privacySettings.storeConversations ? 
          state.conversationHistory : [],
        timestamp: Date.now()
      };
      
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(dataToStore));
    } catch (error) {
      console.error('Failed to persist context data:', error);
    }
  }

  private startContextUpdates(): void {
    if (this.contextUpdateTimer) {
      clearInterval(this.contextUpdateTimer);
    }

    this.contextUpdateTimer = setInterval(() => {
      this.updateTemporalContext();
      this.persistData();
    }, this.config.contextUpdateInterval);
  }

  private updateTemporalContext(): void {
    const now = new Date();
    const hour = now.getHours();
    
    let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    if (hour < 6) timeOfDay = 'night';
    else if (hour < 12) timeOfDay = 'morning';
    else if (hour < 18) timeOfDay = 'afternoon';
    else timeOfDay = 'evening';

    const temporalUpdate = {
      temporal: {
        timestamp: Date.now(),
        timeOfDay,
        dayOfWeek: now.toLocaleDateString('en-US', { weekday: 'long' }),
        isWeekend: now.getDay() === 0 || now.getDay() === 6,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };

    this.store.getState().updateContext(temporalUpdate);
  }

  private analyzeIntent(input: string, context: ContextualData): ContextualIntent {
    const lowerInput = input.toLowerCase();
    
    // Simple intent detection (in a real implementation, this would use NLP/ML)
    const intentPatterns = {
      'get_weather': ['weather', 'temperature', 'rain', 'sunny', 'cloudy'],
      'set_reminder': ['remind', 'reminder', 'schedule', 'appointment'],
      'play_music': ['play', 'music', 'song', 'artist', 'album'],
      'navigation': ['navigate', 'directions', 'route', 'go to', 'find'],
      'call_contact': ['call', 'phone', 'dial', 'contact'],
      'send_message': ['message', 'text', 'send', 'sms'],
      'search': ['search', 'find', 'look up', 'google'],
      'control_device': ['turn on', 'turn off', 'dim', 'brighten', 'volume']
    };

    let detectedIntent = 'unknown';
    let confidence = 0.3;

    for (const [intent, patterns] of Object.entries(intentPatterns)) {
      const matches = patterns.filter(pattern => lowerInput.includes(pattern));
      if (matches.length > 0) {
        detectedIntent = intent;
        confidence = Math.min(0.9, 0.5 + (matches.length * 0.2));
        break;
      }
    }

    // Extract entities (simplified)
    const entities = this.extractEntities(input);

    // Generate contextual suggestions
    const suggestions = this.generateSuggestions(detectedIntent, context);

    return {
      intent: detectedIntent,
      confidence,
      entities,
      context: {
        temporal: context.temporal.timeOfDay !== undefined,
        spatial: context.spatial.location !== undefined,
        personal: true,
        conversational: this.store.getState().activeMemories.length > 0
      },
      suggestions
    };
  }

  private extractEntities(input: string): Array<{ type: string; value: string; confidence: number }> {
    const entities: Array<{ type: string; value: string; confidence: number }> = [];
    
    // Time entities
    const timePatterns = [
      { pattern: /(\d{1,2}:\d{2})/g, type: 'time' },
      { pattern: /(tomorrow|today|yesterday)/gi, type: 'date' },
      { pattern: /(morning|afternoon|evening|night)/gi, type: 'time_period' }
    ];

    // Location entities
    const locationPatterns = [
      { pattern: /(home|work|office|school)/gi, type: 'location' },
      { pattern: /(\d+\s+\w+\s+(street|road|avenue|blvd))/gi, type: 'address' }
    ];

    // Contact entities
    const contactPattern = /(?:call|text|message)\s+(\w+)/gi;
    
    [...timePatterns, ...locationPatterns].forEach(({ pattern, type }) => {
      const matches = input.match(pattern);
      if (matches) {
        matches.forEach(match => {
          entities.push({
            type,
            value: match.trim(),
            confidence: 0.8
          });
        });
      }
    });

    return entities;
  }

  private generateSuggestions(intent: string, context: ContextualData): string[] {
    const suggestions: string[] = [];
    
    switch (intent) {
      case 'get_weather':
        suggestions.push('What\'s the weather like today?');
        if (context.spatial.location) {
          suggestions.push('Weather forecast for this week');
        }
        break;
      
      case 'set_reminder':
        suggestions.push('Set reminder for tomorrow');
        if (context.temporal.timeOfDay === 'evening') {
          suggestions.push('Remind me tomorrow morning');
        }
        break;
      
      case 'play_music':
        suggestions.push('Play my favorite playlist');
        if (context.user.activityLevel === 'running') {
          suggestions.push('Play workout music');
        }
        break;
      
      case 'navigation':
        suggestions.push('Navigate to home');
        suggestions.push('Find nearby restaurants');
        break;
      
      default:
        suggestions.push('What can I help you with?');
        suggestions.push('Try asking about weather, music, or reminders');
    }

    return suggestions.slice(0, 3);
  }

  private searchMemories(memories: ConversationMemory[], query: string, limit: number): ConversationMemory[] {
    const lowerQuery = query.toLowerCase();
    
    return memories
      .filter(memory => 
        memory.summary?.toLowerCase().includes(lowerQuery) ||
        memory.topics.some(topic => topic.toLowerCase().includes(lowerQuery)) ||
        memory.messages.some(msg => msg.content.toLowerCase().includes(lowerQuery))
      )
      .sort((a, b) => b.importance - a.importance)
      .slice(0, limit);
  }

  private getDefaultContext(): ContextualData {
    const now = new Date();
    const hour = now.getHours();
    
    let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    if (hour < 6) timeOfDay = 'night';
    else if (hour < 12) timeOfDay = 'morning';
    else if (hour < 18) timeOfDay = 'afternoon';
    else timeOfDay = 'evening';

    return {
      temporal: {
        timestamp: Date.now(),
        timeOfDay,
        dayOfWeek: now.toLocaleDateString('en-US', { weekday: 'long' }),
        isWeekend: now.getDay() === 0 || now.getDay() === 6,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      spatial: {
        environment: 'unknown',
        ambientLight: 'unknown',
        noiseLevel: 'unknown'
      },
      device: {
        networkType: 'wifi',
        orientation: 'portrait'
      },
      app: {
        currentScreen: 'main',
        sessionDuration: 0
      },
      user: {
        activityLevel: 'stationary',
        attentionLevel: 'focused'
      }
    };
  }

  private getDefaultUserProfile(): UserProfile {
    return {
      id: `user_${Date.now()}`,
      preferences: {
        language: 'en-US',
        voiceSettings: {
          speechRate: 1.0,
          volume: 0.8
        },
        interactionModes: ['voice', 'text', 'gesture'],
        personalizations: {}
      },
      usage: {
        totalInteractions: 0,
        preferredInputTypes: {},
        commonCommands: [],
        lastActiveTime: Date.now()
      }
    };
  }

  private emitEvent(event: ContextEvent): void {
    // In a real implementation, this could emit to an event bus
    console.log('Context Event:', event);
  }

  // Public API methods
  getContext(): ContextualData {
    return this.store.getState().currentContext;
  }

  getUserProfile(): UserProfile {
    return this.store.getState().userProfile;
  }

  addMessage(content: string, type: 'text' | 'voice' | 'gesture' | 'image' = 'text'): void {
    const conversationId = `conv_${Date.now()}`;
    const message = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      content,
      type,
      timestamp: Date.now()
    };

    const memory: ConversationMemory = {
      id: conversationId,
      timestamp: Date.now(),
      participants: ['user', 'assistant'],
      messages: [message],
      context: this.getContext(),
      topics: this.extractTopics(content),
      sentiment: this.analyzeSentiment(content),
      importance: this.calculateImportance(content, this.getContext())
    };

    this.store.getState().addConversationMemory(memory);
  }

  private extractTopics(content: string): string[] {
    // Simple topic extraction (in production, use NLP)
    const words = content.toLowerCase().split(/\s+/);
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    return words.filter(word => word.length > 3 && !stopWords.includes(word)).slice(0, 5);
  }

  private analyzeSentiment(content: string): 'positive' | 'neutral' | 'negative' {
    // Simple sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'happy', 'love', 'like', 'amazing'];
    const negativeWords = ['bad', 'terrible', 'hate', 'dislike', 'awful', 'horrible', 'sad'];
    
    const lowerContent = content.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerContent.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerContent.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private calculateImportance(content: string, context: ContextualData): number {
    let importance = 5; // Base importance
    
    // Increase importance for certain keywords
    const importantKeywords = ['urgent', 'important', 'emergency', 'reminder', 'appointment'];
    const hasImportantKeywords = importantKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );
    
    if (hasImportantKeywords) importance += 3;
    
    // Increase importance during work hours
    if (context.temporal.timeOfDay === 'morning' || context.temporal.timeOfDay === 'afternoon') {
      importance += 1;
    }
    
    return Math.min(10, importance);
  }

  updateSpatialContext(location?: { latitude: number; longitude: number }, environment?: string): void {
    const spatialUpdate = {
      spatial: {
        ...this.getContext().spatial,
        ...(location && { location }),
        ...(environment && { environment: environment as any })
      }
    };
    
    this.store.getState().updateContext(spatialUpdate);
  }

  updateDeviceContext(deviceInfo: Partial<ContextualData['device']>): void {
    const deviceUpdate = {
      device: {
        ...this.getContext().device,
        ...deviceInfo
      }
    };
    
    this.store.getState().updateContext(deviceUpdate);
  }

  updateUserActivity(activityLevel: 'stationary' | 'walking' | 'running' | 'driving'): void {
    const userUpdate = {
      user: {
        ...this.getContext().user,
        activityLevel
      }
    };
    
    this.store.getState().updateContext(userUpdate);
  }

  stop(): void {
    if (this.contextUpdateTimer) {
      clearInterval(this.contextUpdateTimer);
      this.contextUpdateTimer = null;
    }
    
    this.persistData();
  }
}
