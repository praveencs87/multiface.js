import { useState, useEffect, useCallback, useRef } from 'react';
import { SensorManager } from '../SensorManager';
import { SensorConfig, SensorCallbacks, SensorEvent, SensorState, MotionData, LocationData } from '../types';
// import { useFusion } from '@multiface.js/fusion'; // Temporarily disabled for build compatibility

export interface UseSensorsOptions {
  config?: SensorConfig;
  autoStart?: boolean;
  enableFusion?: boolean;
  onFusedOutput?: (fusedInput: any) => void;
}

export const useSensors = (options: UseSensorsOptions = {}) => {
  const {
    config = {},
    autoStart = false,
    enableFusion = false,
    onFusedOutput
  } = options;

  const [sensorState, setSensorState] = useState<SensorState>({
    isActive: false,
    permissions: { location: false, motion: false, camera: false },
    availableSensors: [],
    currentData: {}
  });

  const [lastSensorEvent, setLastSensorEvent] = useState<SensorEvent | null>(null);
  const sensorManagerRef = useRef<SensorManager | null>(null);
  
  // const { processInput } = useFusion({ 
  //   onFusedOutput: enableFusion ? onFusedOutput : undefined 
  // }); // Temporarily disabled for build compatibility
  const processInput = null;

  const callbacks: SensorCallbacks = {
    onSensorData: useCallback((event: SensorEvent) => {
      setLastSensorEvent(event);
      
      if (enableFusion && processInput) {
        // Convert sensor data to fusion input
        let inputData: string;
        let confidence = event.confidence;

        switch (event.type) {
          case 'shake':
            inputData = 'shake_detected';
            confidence = 0.95;
            break;
          case 'motion':
            const motionData = event.data as MotionData;
            if (motionData.isWalking) inputData = 'walking';
            else if (motionData.isRunning) inputData = 'running';
            else if (motionData.isStationary) inputData = 'stationary';
            else inputData = 'motion_detected';
            break;
          case 'location':
            const locationData = event.data as LocationData;
            inputData = `location_${locationData.latitude}_${locationData.longitude}`;
            break;
          default:
            inputData = `${event.type}_data`;
        }

        // processInput({
        //   type: 'sensor',
        //   data: inputData,
        //   priority: 4,
        //   confidence,
        //   metadata: {
        //     sensorType: event.type,
        //     rawData: event.data,
        //     timestamp: Date.now(),
        //   },
        // });
      }
    }, [enableFusion, processInput]),

    onMotionDetected: useCallback((motion: MotionData) => {
      setSensorState(prev => ({
        ...prev,
        currentData: { ...prev.currentData, motion }
      }));
    }, []),

    onLocationChanged: useCallback((location: LocationData) => {
      setSensorState(prev => ({
        ...prev,
        currentData: { ...prev.currentData, location }
      }));
    }, []),

    onError: useCallback((error: Error, sensorType: string) => {
      console.error(`Sensor error (${sensorType}):`, error);
    }, [])
  };

  const initializeSensors = useCallback(async () => {
    if (sensorManagerRef.current) {
      sensorManagerRef.current.stop();
    }

    sensorManagerRef.current = new SensorManager(config, callbacks);
    
    try {
      await sensorManagerRef.current.initialize();
      setSensorState(sensorManagerRef.current.getState());
    } catch (error) {
      console.error('Failed to initialize sensors:', error);
    }
  }, [config, callbacks]);

  const startSensors = useCallback(async () => {
    if (!sensorManagerRef.current) {
      await initializeSensors();
    }

    try {
      await sensorManagerRef.current?.start();
      setSensorState(sensorManagerRef.current?.getState() || sensorState);
    } catch (error) {
      console.error('Failed to start sensors:', error);
    }
  }, [initializeSensors, sensorState]);

  const stopSensors = useCallback(() => {
    sensorManagerRef.current?.stop();
    setSensorState(prev => ({ ...prev, isActive: false }));
  }, []);

  const getCurrentData = useCallback(() => {
    return sensorManagerRef.current?.getCurrentData() || {};
  }, []);

  useEffect(() => {
    if (autoStart) {
      initializeSensors();
    }

    return () => {
      sensorManagerRef.current?.stop();
    };
  }, [autoStart, initializeSensors]);

  return {
    sensorState,
    lastSensorEvent,
    startSensors,
    stopSensors,
    getCurrentData,
    isActive: sensorState.isActive,
    permissions: sensorState.permissions,
    availableSensors: sensorState.availableSensors
  };
};

// Specialized hook for shake detection
export const useShakeDetection = (
  onShake: (intensity: number) => void,
  threshold: number = 15
) => {
  const { startSensors, stopSensors, lastSensorEvent } = useSensors({
    config: {
      motion: {
        enabled: true,
        shakeThreshold: threshold,
        walkingThreshold: 2,
        runningThreshold: 8,
        stationaryTimeout: 5000
      }
    },
    autoStart: true
  });

  useEffect(() => {
    if (lastSensorEvent?.type === 'shake') {
      const motionData = lastSensorEvent.data as MotionData;
      onShake(motionData.intensity);
    }
  }, [lastSensorEvent, onShake]);

  return { startSensors, stopSensors };
};

// Specialized hook for motion detection
export const useMotionDetection = (
  onMotionChange: (motion: MotionData) => void
) => {
  const { startSensors, stopSensors, lastSensorEvent } = useSensors({
    config: {
      motion: {
        enabled: true,
        shakeThreshold: 15,
        walkingThreshold: 2,
        runningThreshold: 8,
        stationaryTimeout: 5000
      }
    },
    autoStart: true
  });

  useEffect(() => {
    if (lastSensorEvent?.type === 'motion') {
      const motionData = lastSensorEvent.data as MotionData;
      onMotionChange(motionData);
    }
  }, [lastSensorEvent, onMotionChange]);

  return { startSensors, stopSensors };
};

// Specialized hook for location tracking
export const useLocationTracking = (
  onLocationChange: (location: LocationData) => void,
  accuracy: 'high' | 'medium' | 'low' = 'medium'
) => {
  const { startSensors, stopSensors, lastSensorEvent } = useSensors({
    config: {
      location: {
        enabled: true,
        updateInterval: accuracy === 'high' ? 5000 : accuracy === 'medium' ? 10000 : 30000,
        accuracy,
        distanceFilter: accuracy === 'high' ? 5 : accuracy === 'medium' ? 10 : 50
      }
    },
    autoStart: true
  });

  useEffect(() => {
    if (lastSensorEvent?.type === 'location') {
      const locationData = lastSensorEvent.data as LocationData;
      onLocationChange(locationData);
    }
  }, [lastSensorEvent, onLocationChange]);

  return { startSensors, stopSensors };
};
