// Core sensor manager
export { SensorManager } from './SensorManager';

// Types
export type {
  AccelerometerData,
  GyroscopeData,
  MagnetometerData,
  LocationData,
  MotionData,
  OrientationData,
  SensorEvent,
  SensorConfig,
  SensorCallbacks,
  SensorPermissions,
  SensorState,
  SensorType
} from './types';

// React hooks
export {
  useSensors,
  useShakeDetection,
  useMotionDetection,
  useLocationTracking
} from './hooks/useSensors';
