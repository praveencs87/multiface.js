import React, { useRef, useCallback } from 'react';
import {
  View,
  PanResponder,
  Dimensions,
  StyleSheet,
  PanResponderGestureState,
} from 'react-native';
// import { useFusion } from '@multiface.js/fusion'; // Commented out for build compatibility

export interface GestureData {
  type: 'swipe' | 'pinch' | 'tap' | 'long_press' | 'shake';
  direction?: 'up' | 'down' | 'left' | 'right' | 'in' | 'out';
  velocity?: number;
  distance?: number;
  duration?: number;
  coordinates?: { x: number; y: number };
}

export interface RNGestureHandlerProps {
  onGesture: (gesture: GestureData) => void;
  children: React.ReactNode;
  enableSwipe?: boolean;
  enablePinch?: boolean;
  enableTap?: boolean;
  enableLongPress?: boolean;
  swipeThreshold?: number;
  longPressDelay?: number;
  style?: any;
}

export const RNGestureHandler: React.FC<RNGestureHandlerProps> = ({
  onGesture,
  children,
  enableSwipe = true,
  enablePinch = true,
  enableTap = true,
  enableLongPress = true,
  swipeThreshold = 50,
  longPressDelay = 500,
  style,
}) => {
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const gestureStartTime = useRef<number>(0);
  const initialDistance = useRef<number>(0);
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  const calculateDistance = (touches: any[]): number => {
    if (touches.length < 2) return 0;
    
    const [touch1, touch2] = touches;
    const dx = touch1.pageX - touch2.pageX;
    const dy = touch1.pageY - touch2.pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const detectSwipeDirection = (gestureState: PanResponderGestureState): string | null => {
    const { dx, dy } = gestureState;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) < swipeThreshold) return null;

    if (absDx > absDy) {
      return dx > 0 ? 'right' : 'left';
    } else {
      return dy > 0 ? 'down' : 'up';
    }
  };

  const calculateVelocity = (gestureState: PanResponderGestureState): number => {
    const { vx, vy } = gestureState;
    return Math.sqrt(vx * vx + vy * vy);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (evt: any, gestureState: any) => {
      // Allow gesture recognition for significant movements
      return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
    },

    onPanResponderGrant: (evt: any, gestureState: any) => {
      gestureStartTime.current = Date.now();
      
      // Handle multi-touch for pinch gestures
      if (enablePinch && evt.nativeEvent.touches.length === 2) {
        initialDistance.current = calculateDistance(evt.nativeEvent.touches);
      }

      // Start long press timer
      if (enableLongPress) {
        longPressTimer.current = setTimeout(() => {
          const gestureData: GestureData = {
            type: 'long_press',
            duration: Date.now() - gestureStartTime.current,
            coordinates: {
              x: evt.nativeEvent.pageX,
              y: evt.nativeEvent.pageY,
            },
          };
          onGesture(gestureData);
        }, longPressDelay);
      }
    },

    onPanResponderMove: (evt: any, gestureState: any) => {
      // Clear long press timer on movement
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      // Handle pinch gestures
      if (enablePinch && evt.nativeEvent.touches.length === 2) {
        const currentDistance = calculateDistance(evt.nativeEvent.touches);
        const scale = currentDistance / initialDistance.current;
        
        if (scale > 1.2 || scale < 0.8) {
          const gestureData: GestureData = {
            type: 'pinch',
            direction: scale > 1 ? 'out' : 'in',
            distance: Math.abs(currentDistance - initialDistance.current),
          };
          onGesture(gestureData);
          initialDistance.current = currentDistance; // Reset for next detection
        }
      }
    },

    onPanResponderRelease: (evt: any, gestureState: any) => {
      // Clear long press timer
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      const gestureDuration = Date.now() - gestureStartTime.current;
      const velocity = calculateVelocity(gestureState);

      // Handle tap gestures
      if (enableTap && gestureDuration < 200 && Math.abs(gestureState.dx) < 10 && Math.abs(gestureState.dy) < 10) {
        const gestureData: GestureData = {
          type: 'tap',
          duration: gestureDuration,
          coordinates: {
            x: evt.nativeEvent.pageX,
            y: evt.nativeEvent.pageY,
          },
        };
        onGesture(gestureData);
        return;
      }

      // Handle swipe gestures
      if (enableSwipe) {
        const direction = detectSwipeDirection(gestureState);
        if (direction) {
          const distance = Math.sqrt(gestureState.dx ** 2 + gestureState.dy ** 2);
          const gestureData: GestureData = {
            type: 'swipe',
            direction: direction as any,
            velocity,
            distance,
            duration: gestureDuration,
          };
          onGesture(gestureData);
        }
      }
    },

    onPanResponderTerminate: () => {
      // Clear long press timer on termination
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    },
  });

  return (
    <View style={[styles.container, style]} {...panResponder.panHandlers}>
      {children}
    </View>
  );
};

// Hook for easier gesture integration with fusion
// Commented out for build compatibility - will be enabled when fusion package is properly linked
export const useGestureWithFusion = (onFusedOutput: (fusedInput: any) => void) => {
  // const { processInput } = useFusion({ onFusedOutput });

  const handleGesture = useCallback((gesture: GestureData) => {
    const gestureString = gesture.direction 
      ? `${gesture.type}_${gesture.direction}`
      : gesture.type;

    // processInput({
    //   type: 'gesture',
    //   data: gestureString,
    //   priority: 3,
    //   confidence: 0.9,
    //   metadata: {
    //     gestureDetails: gesture,
    //     timestamp: Date.now(),
    //   },
    // });
    
    // For now, just call the callback directly
    onFusedOutput({
      type: 'gesture',
      data: gestureString,
      metadata: { gestureDetails: gesture }
    });
  }, [onFusedOutput]);

  return { handleGesture };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
