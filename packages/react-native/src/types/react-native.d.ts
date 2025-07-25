// Type declarations for React Native modules
declare module 'react-native' {
  export interface ViewStyle {}
  export interface TextStyle {}
  export interface ImageStyle {}
  
  export interface ViewProps {
    style?: ViewStyle | ViewStyle[];
    children?: React.ReactNode;
    onPress?: () => void;
  }
  
  export interface TextProps {
    style?: TextStyle | TextStyle[];
    children?: React.ReactNode;
  }
  
  export interface TouchableOpacityProps extends ViewProps {
    onPress?: () => void;
    activeOpacity?: number;
  }
  
  export interface PanResponderGestureState {
    dx: number;
    dy: number;
    vx: number;
    vy: number;
  }
  
  export interface PanResponderInstance {
    panHandlers: any;
  }
  
  export const View: React.ComponentType<ViewProps>;
  export const Text: React.ComponentType<TextProps>;
  export const TouchableOpacity: React.ComponentType<TouchableOpacityProps>;
  export const StyleSheet: {
    create: <T>(styles: T) => T;
  };
  export const PanResponder: {
    create: (config: any) => PanResponderInstance;
  };
  export const Dimensions: {
    get: (dimension: 'window' | 'screen') => { width: number; height: number };
  };
  export const Alert: {
    alert: (title: string, message?: string, buttons?: any[]) => void;
  };
  export const PermissionsAndroid: {
    PERMISSIONS: {
      RECORD_AUDIO: string;
      CAMERA: string;
      ACCESS_FINE_LOCATION: string;
    };
    request: (permission: string) => Promise<string>;
    check: (permission: string) => Promise<boolean>;
    RESULTS: {
      GRANTED: string;
      DENIED: string;
      NEVER_ASK_AGAIN: string;
    };
  };
  export const Platform: {
    OS: 'ios' | 'android' | 'web';
    Version: string | number;
    select: <T>(specifics: { ios?: T; android?: T; default?: T }) => T;
  };
}

declare module '@react-native-voice/voice' {
  export interface VoiceOptions {
    onSpeechStart?: () => void;
    onSpeechRecognized?: () => void;
    onSpeechEnd?: () => void;
    onSpeechError?: (error: any) => void;
    onSpeechResults?: (results: { value: string[] }) => void;
    onSpeechPartialResults?: (results: { value: string[] }) => void;
  }
  
  export interface SpeechRecognizedEvent {
    isFinal?: boolean;
  }
  
  export interface SpeechResultsEvent {
    value: string[];
  }
  
  export interface SpeechErrorEvent {
    error: {
      code?: string;
      message?: string;
    };
  }
  
  export default class Voice {
    static start: (locale: string, options?: VoiceOptions) => Promise<void>;
    static stop: () => Promise<void>;
    static cancel: () => Promise<void>;
    static destroy: () => Promise<void>;
    static isAvailable: () => Promise<boolean>;
    static onSpeechStart: (handler: () => void) => void;
    static onSpeechRecognized: (handler: () => void) => void;
    static onSpeechEnd: (handler: () => void) => void;
    static onSpeechError: (handler: (error: any) => void) => void;
    static onSpeechResults: (handler: (results: { value: string[] }) => void) => void;
    static onSpeechPartialResults: (handler: (results: { value: string[] }) => void) => void;
    static removeAllListeners: () => void;
  }
}

declare module 'react-native-camera' {
  export interface CameraProps {
    style?: any;
    type?: string;
    flashMode?: string;
    onBarCodeRead?: (data: any) => void;
    onFocusChanged?: () => void;
    onZoomChanged?: () => void;
  }
  
  export const RNCamera: React.ComponentType<CameraProps> & {
    Constants: {
      Type: {
        back: string;
        front: string;
      };
      FlashMode: {
        on: string;
        off: string;
        auto: string;
      };
    };
  };
}

declare module 'react-native-gesture-handler' {
  export interface GestureHandlerRootViewProps {
    style?: any;
    children?: React.ReactNode;
  }
  
  export interface PanGestureHandlerProps {
    onGestureEvent?: (event: any) => void;
    onHandlerStateChange?: (event: any) => void;
    children?: React.ReactNode;
  }
  
  export const GestureHandlerRootView: React.ComponentType<GestureHandlerRootViewProps>;
  export const PanGestureHandler: React.ComponentType<PanGestureHandlerProps>;
  export const State: {
    BEGAN: number;
    ACTIVE: number;
    END: number;
    CANCELLED: number;
    FAILED: number;
  };
}

declare module 'react-native-sensors' {
  export interface SensorData {
    x: number;
    y: number;
    z: number;
    timestamp: number;
  }
  
  export const accelerometer: {
    subscribe: (callback: (data: SensorData) => void) => { unsubscribe: () => void };
  };
  
  export const gyroscope: {
    subscribe: (callback: (data: SensorData) => void) => { unsubscribe: () => void };
  };
  
  export const magnetometer: {
    subscribe: (callback: (data: SensorData) => void) => { unsubscribe: () => void };
  };
}

declare module '@react-native-async-storage/async-storage' {
  export default class AsyncStorage {
    static getItem: (key: string) => Promise<string | null>;
    static setItem: (key: string, value: string) => Promise<void>;
    static removeItem: (key: string) => Promise<void>;
    static clear: () => Promise<void>;
    static getAllKeys: () => Promise<string[]>;
    static multiGet: (keys: string[]) => Promise<[string, string | null][]>;
    static multiSet: (keyValuePairs: [string, string][]) => Promise<void>;
    static multiRemove: (keys: string[]) => Promise<void>;
  }
}

declare module '@react-native-community/geolocation' {
  export interface Position {
    coords: {
      latitude: number;
      longitude: number;
      altitude: number | null;
      accuracy: number;
      altitudeAccuracy: number | null;
      heading: number | null;
      speed: number | null;
    };
    timestamp: number;
  }
  
  export interface PositionError {
    code: number;
    message: string;
  }
  
  export interface GeolocationOptions {
    timeout?: number;
    maximumAge?: number;
    enableHighAccuracy?: boolean;
  }
  
  export default class Geolocation {
    static getCurrentPosition: (
      success: (position: Position) => void,
      error?: (error: PositionError) => void,
      options?: GeolocationOptions
    ) => void;
    static watchPosition: (
      success: (position: Position) => void,
      error?: (error: PositionError) => void,
      options?: GeolocationOptions
    ) => number;
    static clearWatch: (watchId: number) => void;
  }
}
