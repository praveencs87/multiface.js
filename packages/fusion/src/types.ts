export type InputType = 'voice' | 'text' | 'gesture' | 'touch' | 'camera' | 'sensor';

export interface MultiModalInput {
  id: string;
  type: InputType;
  data: any;
  timestamp: number;
  priority: number;
  confidence?: number;
  metadata?: Record<string, any>;
}

export interface InputState {
  isActive: boolean;
  lastInput?: MultiModalInput;
  buffer: MultiModalInput[];
}

export interface FusionRule {
  id: string;
  inputTypes: InputType[];
  timeWindow: number; // milliseconds
  priority: number;
  conflictResolution: 'merge' | 'priority' | 'latest' | 'custom';
  processor: (inputs: MultiModalInput[]) => FusedInput;
}

export interface FusedInput {
  id: string;
  originalInputs: MultiModalInput[];
  fusedData: any;
  confidence: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface FusionConfig {
  simultaneousInputWindow: number; // milliseconds
  maxInputBuffer: number;
  enableConflictResolution: boolean;
  defaultPriority: Record<InputType, number>;
  rules: FusionRule[];
}

export interface FusionEventCallbacks {
  onInputReceived?: (input: MultiModalInput) => void;
  onFusionDetected?: (inputs: MultiModalInput[]) => void;
  onFusedOutput?: (fusedInput: FusedInput) => void;
  onConflictResolved?: (conflictingInputs: MultiModalInput[], resolved: MultiModalInput) => void;
}

export type ConflictResolutionStrategy = 'priority' | 'latest' | 'merge' | 'user_choice';
