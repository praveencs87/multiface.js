import { useEffect, useRef, useState, useCallback } from 'react';
import { InputFusionManager } from '../InputFusionManager';
import {
  MultiModalInput,
  FusedInput,
  FusionConfig,
  FusionEventCallbacks,
  InputType
} from '../types';

export interface UseFusionOptions {
  config?: Partial<FusionConfig>;
  onFusedOutput?: (fusedInput: FusedInput) => void;
  onInputReceived?: (input: MultiModalInput) => void;
  onFusionDetected?: (inputs: MultiModalInput[]) => void;
}

export interface UseFusionReturn {
  processInput: (input: Omit<MultiModalInput, 'id' | 'timestamp'>) => void;
  fusionManager: InputFusionManager;
  activeInputs: MultiModalInput[];
  isProcessing: boolean;
  lastFusedOutput: FusedInput | null;
}

export const useFusion = (options: UseFusionOptions = {}): UseFusionReturn => {
  const [activeInputs, setActiveInputs] = useState<MultiModalInput[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastFusedOutput, setLastFusedOutput] = useState<FusedInput | null>(null);
  
  const fusionManagerRef = useRef<InputFusionManager | null>(null);

  // Initialize fusion manager
  useEffect(() => {
    const callbacks: FusionEventCallbacks = {
      onInputReceived: (input) => {
        setActiveInputs(prev => [...prev.slice(-4), input]); // Keep last 5 inputs
        setIsProcessing(true);
        options.onInputReceived?.(input);
      },
      onFusionDetected: (inputs) => {
        options.onFusionDetected?.(inputs);
      },
      onFusedOutput: (fusedInput) => {
        setLastFusedOutput(fusedInput);
        setIsProcessing(false);
        options.onFusedOutput?.(fusedInput);
      }
    };

    fusionManagerRef.current = new InputFusionManager(options.config, callbacks);

    return () => {
      fusionManagerRef.current?.reset();
    };
  }, []);

  const processInput = useCallback((input: Omit<MultiModalInput, 'id' | 'timestamp'>) => {
    fusionManagerRef.current?.processInput(input);
  }, []);

  return {
    processInput,
    fusionManager: fusionManagerRef.current!,
    activeInputs,
    isProcessing,
    lastFusedOutput
  };
};

// Specialized hooks for different input types
export const useVoiceFusion = (onFusedOutput: (fusedInput: FusedInput) => void) => {
  const { processInput, ...rest } = useFusion({ onFusedOutput });
  
  const processVoiceInput = useCallback((transcript: string, confidence?: number) => {
    processInput({
      type: 'voice',
      data: transcript,
      priority: 1,
      confidence
    });
  }, [processInput]);

  return { processVoiceInput, ...rest };
};

export const useGestureFusion = (onFusedOutput: (fusedInput: FusedInput) => void) => {
  const { processInput, ...rest } = useFusion({ onFusedOutput });
  
  const processGestureInput = useCallback((gesture: string, metadata?: any) => {
    processInput({
      type: 'gesture',
      data: gesture,
      priority: 3,
      metadata
    });
  }, [processInput]);

  return { processGestureInput, ...rest };
};

export const useTouchFusion = (onFusedOutput: (fusedInput: FusedInput) => void) => {
  const { processInput, ...rest } = useFusion({ onFusedOutput });
  
  const processTouchInput = useCallback((touchData: any, metadata?: any) => {
    processInput({
      type: 'touch',
      data: touchData,
      priority: 4,
      metadata
    });
  }, [processInput]);

  return { processTouchInput, ...rest };
};
