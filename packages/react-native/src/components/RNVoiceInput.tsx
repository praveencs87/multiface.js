import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import Voice, {
  SpeechRecognizedEvent,
  SpeechResultsEvent,
  SpeechErrorEvent,
} from '@react-native-voice/voice';

export interface RNVoiceInputProps {
  onTranscript: (transcript: string, confidence?: number) => void;
  onListeningChange?: (isListening: boolean) => void;
  language?: string;
  continuous?: boolean;
  wakeWord?: string;
  style?: any;
  buttonStyle?: any;
  textStyle?: any;
}

export const RNVoiceInput: React.FC<RNVoiceInputProps> = ({
  onTranscript,
  onListeningChange,
  language = 'en-US',
  continuous = false,
  wakeWord,
  style,
  buttonStyle,
  textStyle,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  
  const wakeWordDetected = useRef(false);

  useEffect(() => {
    Voice.onSpeechStart = onSpeechStart as any;
    Voice.onSpeechRecognized = onSpeechRecognized as any;
    Voice.onSpeechEnd = onSpeechEnd as any;
    Voice.onSpeechError = onSpeechError as any;
    Voice.onSpeechResults = onSpeechResults as any;
    Voice.onSpeechPartialResults = onSpeechPartialResults as any;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  useEffect(() => {
    checkPermissions();
  }, []);

  useEffect(() => {
    onListeningChange?.(isListening);
  }, [isListening, onListeningChange]);

  const checkPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
        setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } catch (err) {
        console.warn('Permission error:', err);
        setHasPermission(false);
      }
    } else {
      setHasPermission(true); // iOS handles permissions automatically
    }
  };

  const onSpeechStart = (e: any) => {
    setIsListening(true);
    setError(null);
  };

  const onSpeechRecognized = (e: SpeechRecognizedEvent) => {
    // Speech recognized but not yet processed
  };

  const onSpeechEnd = (e: any) => {
    setIsListening(false);
    
    if (continuous && hasPermission) {
      // Restart listening for continuous mode
      setTimeout(() => {
        startListening();
      }, 1000);
    }
  };

  const onSpeechError = (e: SpeechErrorEvent) => {
    setError(e.error?.message || 'Speech recognition error');
    setIsListening(false);
    
    if (continuous && hasPermission && e.error?.code !== 'permissions') {
      // Restart on error for continuous mode (except permission errors)
      setTimeout(() => {
        startListening();
      }, 2000);
    }
  };

  const onSpeechResults = (e: SpeechResultsEvent) => {
    if (e.value && e.value.length > 0) {
      const recognizedText = e.value[0];
      setTranscript(recognizedText);
      
      // Check for wake word if specified
      if (wakeWord) {
        if (recognizedText.toLowerCase().includes(wakeWord.toLowerCase())) {
          wakeWordDetected.current = true;
          const commandText = recognizedText
            .toLowerCase()
            .replace(wakeWord.toLowerCase(), '')
            .trim();
          
          if (commandText) {
            onTranscript(commandText, 0.9);
          }
        } else if (wakeWordDetected.current) {
          // Process command after wake word was detected
          onTranscript(recognizedText, 0.95);
          wakeWordDetected.current = false;
        }
      } else {
        // No wake word - process all speech
        onTranscript(recognizedText, 0.9);
      }
    }
  };

  const onSpeechPartialResults = (e: SpeechResultsEvent) => {
    if (e.value && e.value.length > 0) {
      setTranscript(e.value[0]);
    }
  };

  const startListening = async () => {
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Microphone permission is required for voice input.',
        [{ text: 'OK', onPress: checkPermissions }]
      );
      return;
    }

    try {
      await Voice.start(language);
      setError(null);
    } catch (e) {
      setError('Failed to start voice recognition');
      console.error('Voice start error:', e);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
    } catch (e) {
      console.error('Voice stop error:', e);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!hasPermission) {
    return (
      <View style={[styles.container, style]}>
        <Text style={[styles.errorText, textStyle]}>
          Microphone permission required
        </Text>
        <TouchableOpacity
          style={[styles.permissionButton, buttonStyle]}
          onPress={checkPermissions}
        >
          <Text style={[styles.buttonText, textStyle]}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.voiceButton,
          isListening && styles.listeningButton,
          buttonStyle,
        ]}
        onPress={toggleListening}
      >
        <Text style={[styles.buttonText, textStyle]}>
          {isListening ? '🎤 Listening...' : '🎤 Tap to Speak'}
        </Text>
      </TouchableOpacity>

      {transcript && (
        <View style={styles.transcriptContainer}>
          <Text style={[styles.transcriptText, textStyle]}>
            {wakeWord && !wakeWordDetected.current 
              ? `Say "${wakeWord}" to activate` 
              : transcript
            }
          </Text>
        </View>
      )}

      {error && (
        <Text style={[styles.errorText, textStyle]}>{error}</Text>
      )}

      {continuous && (
        <Text style={[styles.continuousText, textStyle]}>
          Continuous listening {wakeWord ? `(Wake word: "${wakeWord}")` : 'enabled'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  voiceButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 150,
    alignItems: 'center',
  },
  listeningButton: {
    backgroundColor: '#FF3B30',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  permissionButton: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  transcriptContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    minHeight: 40,
    justifyContent: 'center',
  },
  transcriptText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  continuousText: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
