import { create } from 'zustand';
import {
  InputType,
  MultiModalInput,
  InputState,
  FusionRule,
  FusedInput,
  FusionConfig,
  FusionEventCallbacks,
  ConflictResolutionStrategy
} from './types';

interface FusionStore {
  inputs: Map<InputType, InputState>;
  activeInputs: MultiModalInput[];
  fusionBuffer: MultiModalInput[];
  config: FusionConfig;
  callbacks: FusionEventCallbacks;
}

const defaultConfig: FusionConfig = {
  simultaneousInputWindow: 2000, // 2 seconds
  maxInputBuffer: 10,
  enableConflictResolution: true,
  defaultPriority: {
    voice: 1,
    text: 2,
    gesture: 3,
    touch: 4,
    camera: 2,
    sensor: 5
  },
  rules: []
};

export class InputFusionManager {
  private store: any;
  private fusionTimer: NodeJS.Timeout | null = null;
  private inputCounter = 0;

  constructor(config?: Partial<FusionConfig>, callbacks?: FusionEventCallbacks) {
    this.store = create<FusionStore>(() => ({
      inputs: new Map(),
      activeInputs: [],
      fusionBuffer: [],
      config: { ...defaultConfig, ...config },
      callbacks: callbacks || {}
    }));

    this.initializeInputStates();
  }

  private initializeInputStates() {
    const inputTypes: InputType[] = ['voice', 'text', 'gesture', 'touch', 'camera', 'sensor'];
    const { inputs } = this.store.getState();
    
    inputTypes.forEach(type => {
      inputs.set(type, {
        isActive: false,
        buffer: []
      });
    });
  }

  /**
   * Process a new input and determine if fusion is needed
   */
  processInput(input: Omit<MultiModalInput, 'id' | 'timestamp'>): void {
    const enhancedInput: MultiModalInput = {
      ...input,
      id: `input_${++this.inputCounter}_${Date.now()}`,
      timestamp: Date.now()
    };

    const state = this.store.getState();
    const { callbacks, config } = state;

    // Trigger input received callback
    callbacks.onInputReceived?.(enhancedInput);

    // Add to fusion buffer
    this.addToFusionBuffer(enhancedInput);

    // Update input state
    this.updateInputState(enhancedInput);

    // Check for fusion opportunities
    this.checkForFusion();
  }

  private addToFusionBuffer(input: MultiModalInput): void {
    this.store.setState((state: FusionStore) => {
      const newBuffer = [...state.fusionBuffer, input];
      
      // Keep buffer within limits
      if (newBuffer.length > state.config.maxInputBuffer) {
        newBuffer.shift();
      }

      return { fusionBuffer: newBuffer };
    });
  }

  private updateInputState(input: MultiModalInput): void {
    const { inputs } = this.store.getState();
    const inputState = inputs.get(input.type);
    
    if (inputState) {
      inputState.isActive = true;
      inputState.lastInput = input;
      inputState.buffer.push(input);
      
      // Keep buffer manageable
      if (inputState.buffer.length > 5) {
        inputState.buffer.shift();
      }
    }
  }

  private checkForFusion(): void {
    // Clear existing timer
    if (this.fusionTimer) {
      clearTimeout(this.fusionTimer);
    }

    // Set new timer for fusion window
    this.fusionTimer = setTimeout(() => {
      this.processFusionWindow();
    }, 500); // Small delay to collect simultaneous inputs
  }

  private processFusionWindow(): void {
    const { fusionBuffer, config, callbacks } = this.store.getState();
    const now = Date.now();
    
    // Get inputs within the fusion window
    const recentInputs = fusionBuffer.filter(
      (input: any) => now - input.timestamp <= config.simultaneousInputWindow
    );

    if (recentInputs.length > 1) {
      // Multiple inputs detected - attempt fusion
      callbacks.onFusionDetected?.(recentInputs);
      
      const fusedInput = this.fuseInputs(recentInputs);
      if (fusedInput) {
        callbacks.onFusedOutput?.(fusedInput);
      }
    } else if (recentInputs.length === 1) {
      // Single input - process normally
      const singleInput = recentInputs[0];
      const fusedInput: FusedInput = {
        id: `fused_${singleInput.id}`,
        originalInputs: [singleInput],
        fusedData: singleInput.data,
        confidence: singleInput.confidence || 1.0,
        timestamp: singleInput.timestamp
      };
      
      callbacks.onFusedOutput?.(fusedInput);
    }

    // Clean up old inputs from buffer
    this.cleanupBuffer();
  }

  private fuseInputs(inputs: MultiModalInput[]): FusedInput | null {
    const { config } = this.store.getState();
    
    // Find applicable fusion rule
    const inputTypes = inputs.map(i => i.type);
    const applicableRule = config.rules.find((rule: any) => 
      rule.inputTypes.every((type: string) => inputTypes.includes(type as any))
    );

    if (applicableRule) {
      // Use custom fusion rule
      return applicableRule.processor(inputs);
    }

    // Default fusion logic
    return this.defaultFusion(inputs);
  }

  private defaultFusion(inputs: MultiModalInput[]): FusedInput {
    const { config } = this.store.getState();
    
    // Sort by priority
    const sortedInputs = inputs.sort((a, b) => {
      const aPriority = a.priority || config.defaultPriority[a.type] || 10;
      const bPriority = b.priority || config.defaultPriority[b.type] || 10;
      return aPriority - bPriority;
    });

    // Create fused data based on input types
    const fusedData = this.createFusedData(sortedInputs);
    
    // Calculate confidence (average of all inputs)
    const avgConfidence = inputs.reduce((sum, input) => 
      sum + (input.confidence || 1.0), 0) / inputs.length;

    return {
      id: `fused_${Date.now()}`,
      originalInputs: inputs,
      fusedData,
      confidence: avgConfidence,
      timestamp: Date.now(),
      metadata: {
        fusionType: 'default',
        inputTypes: inputs.map(i => i.type)
      }
    };
  }

  private createFusedData(inputs: MultiModalInput[]): any {
    const primaryInput = inputs[0]; // Highest priority
    const secondaryInputs = inputs.slice(1);

    // Different fusion strategies based on input combinations
    const inputTypes = inputs.map(i => i.type).sort().join('+');

    switch (inputTypes) {
      case 'text+voice':
        return {
          type: 'voice_text_fusion',
          primary: primaryInput.data,
          secondary: secondaryInputs[0]?.data,
          command: `${primaryInput.data} ${secondaryInputs[0]?.data}`.trim()
        };

      case 'gesture+voice':
        return {
          type: 'gesture_voice_fusion',
          gesture: inputs.find(i => i.type === 'gesture')?.data,
          voice: inputs.find(i => i.type === 'voice')?.data,
          command: `${inputs.find(i => i.type === 'gesture')?.data} ${inputs.find(i => i.type === 'voice')?.data}`
        };

      case 'touch+voice':
        return {
          type: 'touch_voice_fusion',
          touch: inputs.find(i => i.type === 'touch')?.data,
          voice: inputs.find(i => i.type === 'voice')?.data,
          command: `${inputs.find(i => i.type === 'voice')?.data} with ${inputs.find(i => i.type === 'touch')?.data}`
        };

      case 'camera+voice':
        return {
          type: 'camera_voice_fusion',
          image: inputs.find(i => i.type === 'camera')?.data,
          voice: inputs.find(i => i.type === 'voice')?.data,
          command: `${inputs.find(i => i.type === 'voice')?.data}`,
          context: 'visual'
        };

      default:
        return {
          type: 'multi_input_fusion',
          inputs: inputs.map(i => ({ type: i.type, data: i.data })),
          primary: primaryInput.data
        };
    }
  }

  private cleanupBuffer(): void {
    const { config } = this.store.getState();
    const now = Date.now();
    
    this.store.setState((state: FusionStore) => ({
      fusionBuffer: state.fusionBuffer.filter(
        input => now - input.timestamp <= config.simultaneousInputWindow * 2
      )
    }));
  }

  /**
   * Add a custom fusion rule
   */
  addFusionRule(rule: FusionRule): void {
    this.store.setState((state: FusionStore) => ({
      config: {
        ...state.config,
        rules: [...state.config.rules, rule]
      }
    }));
  }

  /**
   * Remove a fusion rule
   */
  removeFusionRule(ruleId: string): void {
    this.store.setState((state: FusionStore) => ({
      config: {
        ...state.config,
        rules: state.config.rules.filter(rule => rule.id !== ruleId)
      }
    }));
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<FusionConfig>): void {
    this.store.setState((state: FusionStore) => ({
      config: { ...state.config, ...newConfig }
    }));
  }

  /**
   * Get current state
   */
  getState(): FusionStore {
    return this.store.getState();
  }

  /**
   * Reset the fusion manager
   */
  reset(): void {
    if (this.fusionTimer) {
      clearTimeout(this.fusionTimer);
    }
    
    this.store.setState((state: FusionStore) => ({
      inputs: new Map(),
      activeInputs: [],
      fusionBuffer: [],
      config: state.config,
      callbacks: state.callbacks
    }));
    
    this.initializeInputStates();
  }

  /**
   * Resolve conflicts between inputs
   */
  resolveConflict(
    conflictingInputs: MultiModalInput[], 
    strategy: ConflictResolutionStrategy = 'priority'
  ): MultiModalInput {
    const { callbacks, config } = this.store.getState();
    
    let resolvedInput: MultiModalInput;
    
    switch (strategy) {
      case 'priority':
        resolvedInput = conflictingInputs.reduce((highest, current) => {
          const currentPriority = current.priority || config.defaultPriority[current.type] || 10;
          const highestPriority = highest.priority || config.defaultPriority[highest.type] || 10;
          return currentPriority < highestPriority ? current : highest;
        });
        break;
        
      case 'latest':
        resolvedInput = conflictingInputs.reduce((latest, current) => 
          current.timestamp > latest.timestamp ? current : latest
        );
        break;
        
      case 'merge':
        // Create a merged input
        resolvedInput = {
          id: `merged_${Date.now()}`,
          type: conflictingInputs[0].type,
          data: conflictingInputs.map(i => i.data).join(' '),
          timestamp: Date.now(),
          priority: Math.min(...conflictingInputs.map(i => i.priority || 10)),
          confidence: conflictingInputs.reduce((sum, i) => sum + (i.confidence || 1), 0) / conflictingInputs.length
        };
        break;
        
      default:
        resolvedInput = conflictingInputs[0];
    }
    
    callbacks.onConflictResolved?.(conflictingInputs, resolvedInput);
    return resolvedInput;
  }
}
