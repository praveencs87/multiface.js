// Type declarations for React Native sensor dependencies
// These are stub declarations to enable building without actual dependencies

declare module 'react-native-sensors' {
  export interface SensorData {
    x: number;
    y: number;
    z: number;
    timestamp: number;
  }

  export interface Subscription {
    unsubscribe(): void;
  }

  export interface SensorObservable {
    subscribe(callback: (data: SensorData) => void): Subscription;
    pipe(): SensorObservable;
  }

  export const accelerometer: SensorObservable;
  export const gyroscope: SensorObservable;
  export const magnetometer: SensorObservable;

  export const SensorTypes: {
    accelerometer: string;
    gyroscope: string;
    magnetometer: string;
  };

  export const setUpdateIntervalForType: (sensorType: string, updateInterval: number) => void;
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

  export interface WatchOptions {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
    distanceFilter?: number;
    useSignificantChanges?: boolean;
  }

  const Geolocation: {
    getCurrentPosition(
      success: (position: Position) => void,
      error?: (error: PositionError) => void,
      options?: WatchOptions
    ): void;
    
    watchPosition(
      success: (position: Position) => void,
      error?: (error: PositionError) => void,
      options?: WatchOptions
    ): number;
    
    clearWatch(watchID: number): void;
    
    stopObserving(): void;
  };

  export default Geolocation;
}

declare module 'react-native' {
  export const PermissionsAndroid: {
    PERMISSIONS: {
      ACCESS_FINE_LOCATION: string;
      ACCESS_COARSE_LOCATION: string;
    };
    RESULTS: {
      GRANTED: string;
      DENIED: string;
      NEVER_ASK_AGAIN: string;
    };
    request(permission: string, rationale?: any): Promise<string>;
  };

  export const Platform: {
    OS: 'ios' | 'android' | 'web' | 'windows' | 'macos';
  };
}
