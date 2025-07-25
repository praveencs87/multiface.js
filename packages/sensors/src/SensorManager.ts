import { 
  accelerometer, 
  gyroscope, 
  magnetometer,
  SensorTypes,
  setUpdateIntervalForType 
} from 'react-native-sensors';
import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid, Platform } from 'react-native';
import { 
  SensorConfig, 
  SensorCallbacks, 
  SensorEvent, 
  SensorState,
  AccelerometerData,
  GyroscopeData,
  MagnetometerData,
  LocationData,
  MotionData,
  OrientationData,
  SensorPermissions
} from './types';

export class SensorManager {
  private config: SensorConfig;
  private callbacks: SensorCallbacks;
  private state: SensorState;
  private subscriptions: Map<string, any> = new Map();
  private motionBuffer: AccelerometerData[] = [];
  private shakeDetectionTimer: NodeJS.Timeout | null = null;
  private locationWatchId: number | null = null;

  constructor(config: SensorConfig, callbacks: SensorCallbacks = {}) {
    this.config = {
      accelerometer: { enabled: true, updateInterval: 100, threshold: 0.1, ...config.accelerometer },
      gyroscope: { enabled: true, updateInterval: 100, threshold: 0.1, ...config.gyroscope },
      magnetometer: { enabled: false, updateInterval: 100, ...config.magnetometer },
      location: { enabled: true, updateInterval: 10000, accuracy: 'medium', distanceFilter: 10, ...config.location },
      motion: { 
        enabled: true, 
        shakeThreshold: 15, 
        walkingThreshold: 2, 
        runningThreshold: 8, 
        stationaryTimeout: 5000,
        ...config.motion 
      }
    };

    this.callbacks = callbacks;
    this.state = {
      isActive: false,
      permissions: { location: false, motion: false, camera: false },
      availableSensors: [],
      currentData: {}
    };
  }

  async initialize(): Promise<void> {
    try {
      await this.requestPermissions();
      await this.detectAvailableSensors();
      this.setupSensorIntervals();
    } catch (error) {
      this.callbacks.onError?.(error as Error, 'initialization');
    }
  }

  async start(): Promise<void> {
    if (this.state.isActive) return;

    try {
      await this.startAccelerometer();
      await this.startGyroscope();
      await this.startMagnetometer();
      await this.startLocationTracking();
      
      this.state.isActive = true;
      this.startMotionAnalysis();
    } catch (error) {
      this.callbacks.onError?.(error as Error, 'start');
    }
  }

  stop(): void {
    this.subscriptions.forEach((subscription, key) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();

    if (this.locationWatchId !== null) {
      Geolocation.clearWatch(this.locationWatchId);
      this.locationWatchId = null;
    }

    if (this.shakeDetectionTimer) {
      clearInterval(this.shakeDetectionTimer);
      this.shakeDetectionTimer = null;
    }

    this.state.isActive = false;
  }

  private async requestPermissions(): Promise<void> {
    if (Platform.OS === 'android') {
      try {
        const locationPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to location for context-aware features.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        this.state.permissions.location = locationPermission === PermissionsAndroid.RESULTS.GRANTED;
        this.state.permissions.motion = true; // Motion sensors don't require explicit permission on Android
      } catch (error) {
        console.warn('Permission request error:', error);
      }
    } else {
      // iOS permissions are handled automatically by the system
      this.state.permissions.location = true;
      this.state.permissions.motion = true;
    }
  }

  private async detectAvailableSensors(): Promise<void> {
    const availableSensors: string[] = [];

    try {
      // Test accelerometer availability
      const accelTest = accelerometer.pipe().subscribe(() => {});
      availableSensors.push('accelerometer');
      accelTest.unsubscribe();
    } catch (e) {
      console.warn('Accelerometer not available');
    }

    try {
      // Test gyroscope availability
      const gyroTest = gyroscope.pipe().subscribe(() => {});
      availableSensors.push('gyroscope');
      gyroTest.unsubscribe();
    } catch (e) {
      console.warn('Gyroscope not available');
    }

    try {
      // Test magnetometer availability
      const magTest = magnetometer.pipe().subscribe(() => {});
      availableSensors.push('magnetometer');
      magTest.unsubscribe();
    } catch (e) {
      console.warn('Magnetometer not available');
    }

    if (this.state.permissions.location) {
      availableSensors.push('location');
    }

    this.state.availableSensors = availableSensors as any;
  }

  private setupSensorIntervals(): void {
    if (this.config.accelerometer?.enabled) {
      setUpdateIntervalForType(SensorTypes.accelerometer, this.config.accelerometer.updateInterval);
    }
    if (this.config.gyroscope?.enabled) {
      setUpdateIntervalForType(SensorTypes.gyroscope, this.config.gyroscope.updateInterval);
    }
    if (this.config.magnetometer?.enabled) {
      setUpdateIntervalForType(SensorTypes.magnetometer, this.config.magnetometer.updateInterval);
    }
  }

  private async startAccelerometer(): Promise<void> {
    if (!this.config.accelerometer?.enabled || !this.state.availableSensors.includes('accelerometer')) {
      return;
    }

    const subscription = accelerometer.subscribe(({ x, y, z, timestamp }: any) => {
      const data: AccelerometerData = { x, y, z, timestamp };
      this.state.currentData.accelerometer = data;

      // Add to motion buffer for analysis
      this.motionBuffer.push(data);
      if (this.motionBuffer.length > 50) {
        this.motionBuffer.shift();
      }

      const event: SensorEvent = {
        type: 'accelerometer',
        data,
        confidence: 0.95,
        metadata: { source: 'device_accelerometer' }
      };

      this.callbacks.onSensorData?.(event);
    });

    this.subscriptions.set('accelerometer', subscription);
  }

  private async startGyroscope(): Promise<void> {
    if (!this.config.gyroscope?.enabled || !this.state.availableSensors.includes('gyroscope')) {
      return;
    }

    const subscription = gyroscope.subscribe(({ x, y, z, timestamp }: any) => {
      const data: GyroscopeData = { x, y, z, timestamp };
      this.state.currentData.gyroscope = data;

      // Calculate orientation from gyroscope data
      const orientation: OrientationData = {
        pitch: x,
        roll: y,
        yaw: z,
        timestamp
      };

      this.state.currentData.orientation = orientation;

      const event: SensorEvent = {
        type: 'gyroscope',
        data,
        confidence: 0.9,
        metadata: { source: 'device_gyroscope' }
      };

      this.callbacks.onSensorData?.(event);
      this.callbacks.onOrientationChanged?.(orientation);
    });

    this.subscriptions.set('gyroscope', subscription);
  }

  private async startMagnetometer(): Promise<void> {
    if (!this.config.magnetometer?.enabled || !this.state.availableSensors.includes('magnetometer')) {
      return;
    }

    const subscription = magnetometer.subscribe(({ x, y, z, timestamp }: any) => {
      const data: MagnetometerData = { x, y, z, timestamp };
      this.state.currentData.magnetometer = data;

      const event: SensorEvent = {
        type: 'magnetometer',
        data,
        confidence: 0.85,
        metadata: { source: 'device_magnetometer' }
      };

      this.callbacks.onSensorData?.(event);
    });

    this.subscriptions.set('magnetometer', subscription);
  }

  private async startLocationTracking(): Promise<void> {
    if (!this.config.location?.enabled || !this.state.permissions.location) {
      return;
    }

    const options = {
      enableHighAccuracy: this.config.location.accuracy === 'high',
      timeout: 15000,
      maximumAge: 10000,
      distanceFilter: this.config.location.distanceFilter || 10,
    };

    this.locationWatchId = Geolocation.watchPosition(
      (position: any) => {
        const data: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude || undefined,
          accuracy: position.coords.accuracy || undefined,
          speed: position.coords.speed || undefined,
          heading: position.coords.heading || undefined,
          timestamp: position.timestamp,
        };

        this.state.currentData.location = data;

        const event: SensorEvent = {
          type: 'location',
          data,
          confidence: 0.8,
          metadata: { source: 'device_gps' }
        };

        this.callbacks.onSensorData?.(event);
        this.callbacks.onLocationChanged?.(data);
      },
      (error: any) => {
        this.callbacks.onError?.(new Error(error.message), 'location');
      },
      options
    );
  }

  private startMotionAnalysis(): void {
    if (!this.config.motion?.enabled) return;

    this.shakeDetectionTimer = setInterval(() => {
      this.analyzeMotion();
    }, 500);
  }

  private analyzeMotion(): void {
    if (this.motionBuffer.length < 10) return;

    const recentData = this.motionBuffer.slice(-20);
    const totalAcceleration = recentData.map(data => 
      Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z)
    );

    const avgAcceleration = totalAcceleration.reduce((a, b) => a + b, 0) / totalAcceleration.length;
    const maxAcceleration = Math.max(...totalAcceleration);
    const variance = totalAcceleration.reduce((acc, val) => acc + Math.pow(val - avgAcceleration, 2), 0) / totalAcceleration.length;

    // Detect shake
    const isShaking = maxAcceleration > (this.config.motion?.shakeThreshold || 15);
    
    // Detect motion patterns
    const isWalking = avgAcceleration > (this.config.motion?.walkingThreshold || 2) && 
                     avgAcceleration < (this.config.motion?.runningThreshold || 8) && 
                     variance > 1;
    
    const isRunning = avgAcceleration > (this.config.motion?.runningThreshold || 8) && variance > 4;
    
    const isStationary = avgAcceleration < 1.5 && variance < 0.5;

    const motionData: MotionData = {
      isWalking,
      isRunning,
      isStationary,
      isShaking,
      intensity: avgAcceleration,
      confidence: 0.8,
      timestamp: Date.now()
    };

    this.state.currentData.motion = motionData;

    const event: SensorEvent = {
      type: 'motion',
      data: motionData,
      confidence: 0.8,
      metadata: { 
        avgAcceleration, 
        maxAcceleration, 
        variance,
        bufferSize: recentData.length
      }
    };

    this.callbacks.onSensorData?.(event);
    this.callbacks.onMotionDetected?.(motionData);

    if (isShaking) {
      this.callbacks.onShakeDetected?.(avgAcceleration);
      
      const shakeEvent: SensorEvent = {
        type: 'shake',
        data: motionData,
        confidence: 0.9,
        metadata: { intensity: avgAcceleration }
      };
      
      this.callbacks.onSensorData?.(shakeEvent);
    }
  }

  getState(): SensorState {
    return { ...this.state };
  }

  getCurrentData() {
    return { ...this.state.currentData };
  }

  updateConfig(newConfig: Partial<SensorConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.state.isActive) {
      this.stop();
      this.start();
    }
  }
}
