import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  PanResponder,
} from 'react-native';
import { ChatInput, VoiceInput } from '@multiface.js/inputs';
import { AdaptiveModeManager } from '@multiface.js/core';
import { AdaptiveRenderer } from '@multiface.js/outputs';
import { OpenAIHandler } from '@multiface.js/ai';

// Enhanced types for multi-modal interaction
interface MultiModalInput {
  type: 'voice' | 'text' | 'gesture' | 'touch' | 'camera';
  data: any;
  timestamp: number;
  priority: number;
}

interface AssistantContext {
  location?: { lat: number; lng: number };
  time: Date;
  recentActions: string[];
  userPreferences: Record<string, any>;
}

export const PersonalAssistant: React.FC = () => {
  // Core state management
  const [mode, setMode] = useState<'chat' | 'voice' | 'gui'>('chat');
  const [messages, setMessages] = useState<Array<{text: string, sender: 'user' | 'assistant', timestamp: Date}>>([]);
  const [isListening, setIsListening] = useState(false);
  const [context, setContext] = useState<AssistantContext>({
    time: new Date(),
    recentActions: [],
    userPreferences: {}
  });

  // Multi-modal input queue
  const [inputQueue, setInputQueue] = useState<MultiModalInput[]>([]);
  const [simultaneousInputs, setSimultaneousInputs] = useState<MultiModalInput[]>([]);

  // Managers and handlers
  const modeManager = useRef(new AdaptiveModeManager({ initialMode: 'chat' }));
  const aiHandler = useRef(new OpenAIHandler({ apiKey: 'your-openai-key' }));

  // Gesture handling
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > 20 || Math.abs(gestureState.dy) > 20;
    },
    onPanResponderMove: (evt, gestureState) => {
      handleGesture(gestureState);
    },
  });

  // Quick action buttons configuration
  const quickActions = [
    { id: 'call', label: '📞 Call', action: () => handleQuickAction('call') },
    { id: 'calendar', label: '📅 Calendar', action: () => handleQuickAction('calendar') },
    { id: 'weather', label: '🌤️ Weather', action: () => handleQuickAction('weather') },
    { id: 'reminder', label: '⏰ Reminder', action: () => handleQuickAction('reminder') },
    { id: 'navigation', label: '🗺️ Navigate', action: () => handleQuickAction('navigation') },
    { id: 'camera', label: '📷 Scan', action: () => handleQuickAction('camera') },
  ];

  // Handle simultaneous multi-modal inputs
  const handleMultiModalInput = (input: MultiModalInput) => {
    const now = Date.now();
    
    // Check if there are recent inputs (within 2 seconds) for fusion
    const recentInputs = simultaneousInputs.filter(i => now - i.timestamp < 2000);
    
    if (recentInputs.length > 0) {
      // Simultaneous input detected - fuse them
      const fusedInputs = [...recentInputs, input];
      processFusedInput(fusedInputs);
      setSimultaneousInputs([]);
    } else {
      // Single input or start of potential simultaneous input
      setSimultaneousInputs([input]);
      
      // Process single input after delay to check for simultaneous inputs
      setTimeout(() => {
        const currentInputs = simultaneousInputs.filter(i => i.timestamp === input.timestamp);
        if (currentInputs.length === 1) {
          processSingleInput(input);
        }
      }, 500);
    }
  };

  // Process fused multi-modal inputs
  const processFusedInput = async (inputs: MultiModalInput[]) => {
    console.log('Processing fused inputs:', inputs.map(i => i.type));
    
    // Example: Voice + Touch fusion
    const voiceInput = inputs.find(i => i.type === 'voice');
    const touchInput = inputs.find(i => i.type === 'touch');
    
    if (voiceInput && touchInput) {
      const fusedCommand = `${voiceInput.data} with ${touchInput.data}`;
      await processAICommand(fusedCommand, 'Multi-modal: Voice + Touch');
    }
    
    // Example: Gesture + Voice fusion
    const gestureInput = inputs.find(i => i.type === 'gesture');
    if (voiceInput && gestureInput) {
      const fusedCommand = `${gestureInput.data} ${voiceInput.data}`;
      await processAICommand(fusedCommand, 'Multi-modal: Gesture + Voice');
    }
  };

  // Process single input
  const processSingleInput = async (input: MultiModalInput) => {
    switch (input.type) {
      case 'voice':
        await processAICommand(input.data, 'Voice');
        break;
      case 'text':
        await processAICommand(input.data, 'Text');
        break;
      case 'gesture':
        handleGestureCommand(input.data);
        break;
      case 'touch':
        handleTouchCommand(input.data);
        break;
    }
  };

  // Handle voice input
  const handleVoiceInput = (transcript: string) => {
    handleMultiModalInput({
      type: 'voice',
      data: transcript,
      timestamp: Date.now(),
      priority: 1
    });
  };

  // Handle text input
  const handleTextInput = (text: string) => {
    handleMultiModalInput({
      type: 'text',
      data: text,
      timestamp: Date.now(),
      priority: 1
    });
  };

  // Handle gesture input
  const handleGesture = (gestureState: any) => {
    let gestureType = '';
    
    if (Math.abs(gestureState.dy) > 50 && gestureState.dy < 0) {
      gestureType = 'swipe_up';
    } else if (Math.abs(gestureState.dy) > 50 && gestureState.dy > 0) {
      gestureType = 'swipe_down';
    } else if (Math.abs(gestureState.dx) > 50 && gestureState.dx > 0) {
      gestureType = 'swipe_right';
    } else if (Math.abs(gestureState.dx) > 50 && gestureState.dx < 0) {
      gestureType = 'swipe_left';
    }

    if (gestureType) {
      handleMultiModalInput({
        type: 'gesture',
        data: gestureType,
        timestamp: Date.now(),
        priority: 2
      });
    }
  };

  // Handle gesture commands
  const handleGestureCommand = (gesture: string) => {
    switch (gesture) {
      case 'swipe_up':
        setMode('voice');
        setIsListening(true);
        addMessage('Switched to voice mode', 'assistant');
        break;
      case 'swipe_down':
        setMode('chat');
        addMessage('Switched to chat mode', 'assistant');
        break;
      case 'swipe_right':
        setMode('gui');
        addMessage('Switched to GUI mode', 'assistant');
        break;
      case 'swipe_left':
        // Go back or previous action
        addMessage('Going back...', 'assistant');
        break;
    }
  };

  // Handle touch commands
  const handleTouchCommand = (touchData: string) => {
    addMessage(`Touch action: ${touchData}`, 'assistant');
  };

  // Handle quick actions
  const handleQuickAction = (action: string) => {
    handleMultiModalInput({
      type: 'touch',
      data: `quick_action_${action}`,
      timestamp: Date.now(),
      priority: 3
    });
  };

  // Process AI commands with context
  const processAICommand = async (command: string, inputMethod: string) => {
    addMessage(command, 'user');
    
    try {
      // Add context to the command
      const contextualCommand = `
        User said: "${command}"
        Input method: ${inputMethod}
        Current time: ${context.time.toLocaleString()}
        Recent actions: ${context.recentActions.join(', ')}
        
        Please respond as a helpful personal assistant.
      `;

      const response = await aiHandler.current.complete(contextualCommand);
      addMessage(response, 'assistant');
      
      // Update context
      setContext(prev => ({
        ...prev,
        recentActions: [...prev.recentActions.slice(-4), command]
      }));
      
    } catch (error) {
      addMessage('Sorry, I encountered an error processing your request.', 'assistant');
    }
  };

  // Add message to conversation
  const addMessage = (text: string, sender: 'user' | 'assistant') => {
    setMessages(prev => [...prev, {
      text,
      sender,
      timestamp: new Date()
    }]);
  };

  // Shake detection (simplified)
  useEffect(() => {
    // In a real app, you'd use react-native-shake or accelerometer
    // This is a placeholder for shake detection
    const handleShake = () => {
      Alert.alert(
        'Emergency Mode',
        'Shake detected! What would you like to do?',
        [
          { text: 'Call Emergency', onPress: () => handleQuickAction('emergency_call') },
          { text: 'Send Location', onPress: () => handleQuickAction('send_location') },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    };
  }, []);

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Personal Assistant</Text>
        <View style={styles.modeIndicator}>
          <Text style={styles.modeText}>Mode: {mode.toUpperCase()}</Text>
          {isListening && <Text style={styles.listeningText}>🎤 Listening...</Text>}
        </View>
      </View>

      {/* Mode Selection */}
      <View style={styles.modeSelector}>
        {['chat', 'voice', 'gui'].map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.modeButton, mode === m && styles.activeModeButton]}
            onPress={() => {
              setMode(m as any);
              modeManager.current.setMode(m as any);
            }}
          >
            <Text style={[styles.modeButtonText, mode === m && styles.activeModeButtonText]}>
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Messages */}
      <ScrollView style={styles.messagesContainer}>
        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.messageContainer,
              message.sender === 'user' ? styles.userMessage : styles.assistantMessage
            ]}
          >
            <Text style={styles.messageText}>{message.text}</Text>
            <Text style={styles.messageTime}>
              {message.timestamp.toLocaleTimeString()}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Quick Actions */}
      {mode === 'gui' && (
        <View style={styles.quickActionsContainer}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionButton}
                onPress={action.action}
              >
                <Text style={styles.quickActionText}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Input Area */}
      <View style={styles.inputContainer}>
        {mode === 'chat' && (
          <ChatInput
            onSend={handleTextInput}
            placeholder="Type your message or swipe up for voice..."
          />
        )}
        
        {mode === 'voice' && (
          <VoiceInput
            onTranscript={handleVoiceInput}
            isListening={isListening}
            onListeningChange={setIsListening}
          />
        )}
        
        {mode === 'gui' && (
          <View style={styles.guiControls}>
            <Text style={styles.guiHint}>
              Use quick actions above or gestures:
              {'\n'}↑ Voice mode  ↓ Chat mode  ← Back  → GUI mode
              {'\n'}Shake for emergency actions
            </Text>
          </View>
        )}
      </View>

      {/* Simultaneous Input Indicator */}
      {simultaneousInputs.length > 0 && (
        <View style={styles.simultaneousIndicator}>
          <Text style={styles.simultaneousText}>
            Multi-modal input detected: {simultaneousInputs.map(i => i.type).join(' + ')}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  modeIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modeText: {
    color: 'white',
    fontSize: 14,
  },
  listeningText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 25,
    padding: 5,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeModeButton: {
    backgroundColor: '#007AFF',
  },
  modeButtonText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  activeModeButtonText: {
    color: 'white',
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  messageContainer: {
    marginVertical: 5,
    padding: 12,
    borderRadius: 15,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
  },
  assistantMessage: {
    backgroundColor: 'white',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    color: 'white',
  },
  messageTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 5,
  },
  quickActionsContainer: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 10,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: '48%',
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    backgroundColor: 'white',
    padding: 15,
  },
  guiControls: {
    alignItems: 'center',
  },
  guiHint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  simultaneousIndicator: {
    position: 'absolute',
    top: 100,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 193, 7, 0.9)',
    padding: 10,
    borderRadius: 5,
  },
  simultaneousText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
