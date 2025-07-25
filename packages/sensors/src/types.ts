export interface AccelerometerData {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

export interface GyroscopeData {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

export interface MagnetometerData {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  timestamp: number;
}

export interface MotionData {
  isWalking: boolean;
  isRunning: boolean;
  isStationary: boolean;
  isShaking: boolean;
  intensity: number;
  confidence: number;
  timestamp: number;
}

export interface OrientationData {
  pitch: number;
  roll: number;
  yaw: number;
  timestamp: number;
}

export interface SensorEvent {
  type: 'accelerometer' | 'gyroscope' | 'magnetometer' | 'location' | 'motion' | 'orientation' | 'shake';
  data: AccelerometerData | GyroscopeData | MagnetometerData | LocationData | MotionData | OrientationData;
  confidence: number;
  metadata?: Record<string, any>;
}

export interface SensorConfig {
  accelerometer?: {
    enabled: boolean;
    updateInterval: number;
    threshold?: number;
  };
  gyroscope?: {
    enabled: boolean;
    updateInterval: number;
    threshold?: number;
  };
  magnetometer?: {
    enabled: boolean;
    updateInterval: number;
  };
  location?: {
    enabled: boolean;
    updateInterval: number;
    accuracy: 'high' | 'medium' | 'low';
    distanceFilter?: number;
  };
  motion?: {
    enabled: boolean;
    shakeThreshold: number;
    walkingThreshold: number;
    runningThreshold: number;
    stationaryTimeout: number;
  };
}

export interface SensorCallbacks {
  onSensorData?: (event: SensorEvent) => void;
  onMotionDetected?: (motion: MotionData) => void;
  onShakeDetected?: (intensity: number) => void;
  onLocationChanged?: (location: LocationData) => void;
  onOrientationChanged?: (orientation: OrientationData) => void;
  onError?: (error: Error, sensorType: string) => void;
}

export interface SensorPermissions {
  location: boolean;
  motion: boolean;
  camera: boolean;
}

export type SensorType = 'accelerometer' | 'gyroscope' | 'magnetometer' | 'location' | 'motion' | 'orientation';

export interface SensorState {
  isActive: boolean;
  permissions: SensorPermissions;
  availableSensors: SensorType[];
  currentData: {
    accelerometer?: AccelerometerData;
    gyroscope?: GyroscopeData;
    magnetometer?: MagnetometerData;
    location?: LocationData;
    motion?: MotionData;
    orientation?: OrientationData;
  };
}
