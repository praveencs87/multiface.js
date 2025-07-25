import { FusionRule, MultiModalInput, FusedInput } from '../types';

/**
 * Creates default fusion rules for common multi-modal interactions
 */
export const createDefaultFusionRules = (): FusionRule[] => [
  // Voice + Touch fusion rule
  {
    id: 'voice_touch_fusion',
    inputTypes: ['voice', 'touch'],
    timeWindow: 2000,
    priority: 1,
    conflictResolution: 'merge',
    processor: (inputs: MultiModalInput[]): FusedInput => {
      const voiceInput = inputs.find(i => i.type === 'voice');
      const touchInput = inputs.find(i => i.type === 'touch');
      
      return {
        id: `voice_touch_${Date.now()}`,
        originalInputs: inputs,
        fusedData: {
          type: 'voice_touch_command',
          voice: voiceInput?.data,
          touch: touchInput?.data,
          command: `${voiceInput?.data} ${touchInput?.data}`,
          confidence: Math.min(voiceInput?.confidence || 1, touchInput?.confidence || 1)
        },
        confidence: (voiceInput?.confidence || 1) * 0.7 + (touchInput?.confidence || 1) * 0.3,
        timestamp: Date.now(),
        metadata: {
          fusionType: 'voice_touch',
          primaryInput: 'voice'
        }
      };
    }
  },

  // Gesture + Voice fusion rule
  {
    id: 'gesture_voice_fusion',
    inputTypes: ['gesture', 'voice'],
    timeWindow: 1500,
    priority: 2,
    conflictResolution: 'merge',
    processor: (inputs: MultiModalInput[]): FusedInput => {
      const gestureInput = inputs.find(i => i.type === 'gesture');
      const voiceInput = inputs.find(i => i.type === 'voice');
      
      return {
        id: `gesture_voice_${Date.now()}`,
        originalInputs: inputs,
        fusedData: {
          type: 'gesture_voice_command',
          gesture: gestureInput?.data,
          voice: voiceInput?.data,
          command: `${gestureInput?.data} ${voiceInput?.data}`,
          enhancedCommand: enhanceGestureVoiceCommand(gestureInput?.data, voiceInput?.data)
        },
        confidence: Math.max(gestureInput?.confidence || 0.8, voiceInput?.confidence || 1),
        timestamp: Date.now(),
        metadata: {
          fusionType: 'gesture_voice',
          primaryInput: 'voice'
        }
      };
    }
  },

  // Camera + Voice fusion rule
  {
    id: 'camera_voice_fusion',
    inputTypes: ['camera', 'voice'],
    timeWindow: 3000,
    priority: 1,
    conflictResolution: 'merge',
    processor: (inputs: MultiModalInput[]): FusedInput => {
      const cameraInput = inputs.find(i => i.type === 'camera');
      const voiceInput = inputs.find(i => i.type === 'voice');
      
      return {
        id: `camera_voice_${Date.now()}`,
        originalInputs: inputs,
        fusedData: {
          type: 'visual_voice_command',
          image: cameraInput?.data,
          voice: voiceInput?.data,
          command: voiceInput?.data,
          context: 'visual_analysis',
          analysisPrompt: `Analyze this image and ${voiceInput?.data}`
        },
        confidence: (cameraInput?.confidence || 0.9) * 0.4 + (voiceInput?.confidence || 1) * 0.6,
        timestamp: Date.now(),
        metadata: {
          fusionType: 'camera_voice',
          primaryInput: 'voice',
          hasVisualContext: true
        }
      };
    }
  },

  // Text + Voice fusion rule (for refinement)
  {
    id: 'text_voice_fusion',
    inputTypes: ['text', 'voice'],
    timeWindow: 2500,
    priority: 3,
    conflictResolution: 'merge',
    processor: (inputs: MultiModalInput[]): FusedInput => {
      const textInput = inputs.find(i => i.type === 'text');
      const voiceInput = inputs.find(i => i.type === 'voice');
      
      // Determine which is primary based on timestamp and content length
      const isPrimaryVoice = (voiceInput?.data?.length || 0) > (textInput?.data?.length || 0);
      
      return {
        id: `text_voice_${Date.now()}`,
        originalInputs: inputs,
        fusedData: {
          type: 'text_voice_refinement',
          text: textInput?.data,
          voice: voiceInput?.data,
          command: isPrimaryVoice ? 
            `${voiceInput?.data} (refined: ${textInput?.data})` : 
            `${textInput?.data} (clarified: ${voiceInput?.data})`,
          primaryInput: isPrimaryVoice ? 'voice' : 'text'
        },
        confidence: Math.max(textInput?.confidence || 1, voiceInput?.confidence || 1),
        timestamp: Date.now(),
        metadata: {
          fusionType: 'text_voice',
          primaryInput: isPrimaryVoice ? 'voice' : 'text',
          isRefinement: true
        }
      };
    }
  },

  // Multi-touch + Voice fusion rule
  {
    id: 'multi_touch_voice_fusion',
    inputTypes: ['touch', 'voice'],
    timeWindow: 1800,
    priority: 2,
    conflictResolution: 'merge',
    processor: (inputs: MultiModalInput[]): FusedInput => {
      const touchInputs = inputs.filter(i => i.type === 'touch');
      const voiceInput = inputs.find(i => i.type === 'voice');
      
      return {
        id: `multi_touch_voice_${Date.now()}`,
        originalInputs: inputs,
        fusedData: {
          type: 'multi_touch_voice_command',
          touches: touchInputs.map(t => t.data),
          voice: voiceInput?.data,
          command: `${voiceInput?.data} with ${touchInputs.length} touch points`,
          touchCount: touchInputs.length
        },
        confidence: (voiceInput?.confidence || 1) * 0.8,
        timestamp: Date.now(),
        metadata: {
          fusionType: 'multi_touch_voice',
          touchCount: touchInputs.length,
          primaryInput: 'voice'
        }
      };
    }
  },

  // Sensor + Voice fusion rule (for context-aware commands)
  {
    id: 'sensor_voice_fusion',
    inputTypes: ['sensor', 'voice'],
    timeWindow: 2000,
    priority: 4,
    conflictResolution: 'merge',
    processor: (inputs: MultiModalInput[]): FusedInput => {
      const sensorInput = inputs.find(i => i.type === 'sensor');
      const voiceInput = inputs.find(i => i.type === 'voice');
      
      return {
        id: `sensor_voice_${Date.now()}`,
        originalInputs: inputs,
        fusedData: {
          type: 'context_aware_voice_command',
          voice: voiceInput?.data,
          sensorData: sensorInput?.data,
          command: voiceInput?.data,
          context: sensorInput?.data,
          enhancedCommand: enhanceSensorVoiceCommand(voiceInput?.data, sensorInput?.data)
        },
        confidence: (voiceInput?.confidence || 1) * 0.9,
        timestamp: Date.now(),
        metadata: {
          fusionType: 'sensor_voice',
          primaryInput: 'voice',
          hasContextualData: true
        }
      };
    }
  }
];

/**
 * Enhance gesture + voice commands with contextual understanding
 */
function enhanceGestureVoiceCommand(gesture: string, voice: string): string {
  const gestureEnhancements: Record<string, string> = {
    'swipe_up': 'activate',
    'swipe_down': 'deactivate',
    'swipe_left': 'previous',
    'swipe_right': 'next',
    'pinch': 'zoom out',
    'spread': 'zoom in',
    'shake': 'emergency',
    'long_press': 'hold and'
  };

  const enhancement = gestureEnhancements[gesture];
  return enhancement ? `${enhancement} ${voice}` : `${gesture} ${voice}`;
}

/**
 * Enhance sensor + voice commands with environmental context
 */
function enhanceSensorVoiceCommand(voice: string, sensorData: any): string {
  if (!sensorData) return voice;

  let contextualEnhancement = '';

  // Location context
  if (sensorData.location) {
    contextualEnhancement += ` (at current location)`;
  }

  // Motion context
  if (sensorData.motion) {
    if (sensorData.motion.isWalking) {
      contextualEnhancement += ` (while walking)`;
    } else if (sensorData.motion.isRunning) {
      contextualEnhancement += ` (while running)`;
    } else if (sensorData.motion.isStationary) {
      contextualEnhancement += ` (while stationary)`;
    }
  }

  // Time context
  if (sensorData.time) {
    const hour = new Date(sensorData.time).getHours();
    if (hour < 6) {
      contextualEnhancement += ` (early morning)`;
    } else if (hour < 12) {
      contextualEnhancement += ` (morning)`;
    } else if (hour < 18) {
      contextualEnhancement += ` (afternoon)`;
    } else {
      contextualEnhancement += ` (evening)`;
    }
  }

  return `${voice}${contextualEnhancement}`;
}
