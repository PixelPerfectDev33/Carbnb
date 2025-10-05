// components/SlideViewModal.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Modal, Pressable, Dimensions, Platform, Animated, Keyboard, View } from 'react-native';
import { Image } from 'expo-image';
import { Text, StyleSheet } from 'react-native';
import {
  PanGestureHandler,
  TapGestureHandler,
  State,
} from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Constants for Web Zoom
const MIN_ZOOM = 1.0;
const MAX_ZOOM = 3.0;
const ZOOM_STEP = 0.5;

interface SlideViewModalProps {
  visible: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
}

export const SlideViewModal = ({
  visible,
  onClose,
  images,
  initialIndex = 0,
}: SlideViewModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomScale, setZoomScale] = useState(MIN_ZOOM);
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const isSwiping = useRef(false);

  // Web pan state
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Reset state when modal opens/changes image list
  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
      setZoomScale(MIN_ZOOM);
      setPanOffset({ x: 0, y: 0 });
      translateX.setValue(0);
      translateY.setValue(0);
    }
  }, [visible, initialIndex, translateX, translateY]);

  // --- Navigation Handlers ---
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setZoomScale(MIN_ZOOM);
      setPanOffset({ x: 0, y: 0 });
    }
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setZoomScale(MIN_ZOOM);
      setPanOffset({ x: 0, y: 0 });
    }
  };

  // --- Web Zoom Handlers ---
  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  };

  const isMaxZoom = useMemo(() => zoomScale >= MAX_ZOOM, [zoomScale]);
  const isMinZoom = useMemo(() => zoomScale <= MIN_ZOOM, [zoomScale]);

  // Double-tap/Click to zoom/reset
  const toggleWebZoom = () => {
    if (Platform.OS === 'web') {
      if (zoomScale > MIN_ZOOM) {
        setZoomScale(MIN_ZOOM);
        setPanOffset({ x: 0, y: 0 });
      } else {
        setZoomScale(MAX_ZOOM);
      }
    }
  };

  // --- Web Drag/Pan Handlers ---
  const handleDragStart = (e: React.MouseEvent) => {
    if (zoomScale > MIN_ZOOM) {
      setIsDragging(true);
      dragStart.current = {
        x: e.clientX - panOffset.x,
        y: e.clientY - panOffset.y
      };
    }
  };

  const handleDragMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // --- Keyboard Controls (Web) ---
  useEffect(() => {
    if (Platform.OS !== 'web' || !visible) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();

      switch (event.key) {
        case 'ArrowLeft':
          handlePrev();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible, handlePrev, handleNext, onClose, handleZoomIn, handleZoomOut]);

  // --- Swipe/Pan Handlers (Mobile) ---
  const onPanGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onPanHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.2;
      const delta = translateX._value;

      if (Math.abs(delta) > SWIPE_THRESHOLD) {
        if (delta < 0 && currentIndex < images.length - 1) {
          handleNext();
        } else if (delta > 0 && currentIndex > 0) {
          handlePrev();
        }
      }

      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 8,
      }).start();
    }
  };

  if (!visible || images.length === 0) return null;

  const isWeb = Platform.OS === 'web';

  return (
    <Modal transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={styles.imageContainer}
          onPress={(e) => e.stopPropagation()}
        >
          <PanGestureHandler
            onGestureEvent={onPanGestureEvent}
            onHandlerStateChange={onPanHandlerStateChange}
            enabled={!isWeb}
          >
            <Animated.View
              style={[
                styles.animatedImageWrapper,
                {
                  transform: [{ translateX: !isWeb ? translateX : 0 }],
                },
              ]}
            >
              {!isWeb ? (
                <TapGestureHandler
                  numberOfTaps={2}
                  onHandlerStateChange={(event) => {
                    if (event.nativeEvent.state === State.END) {
                    }
                  }}
                >
                  <View style={styles.imageWrapper}>
                    <Image
                      source={{ uri: images[currentIndex] }}
                      style={styles.fullscreenImage}
                      contentFit="contain"
                      placeholder="https://placehold.co/600x400/CCCCCC/999999?text=Loading"
                      enableZoom={true}
                      enableAutoZoomOnDoubleClick={true}
                    />
                  </View>
                </TapGestureHandler>
              ) : (
                <View 
                  style={styles.imageWrapper}
                  onMouseDown={handleDragStart}
                  onMouseMove={handleDragMove}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                >
                  <Image
                    source={{ uri: images[currentIndex] }}
                    style={[
                      styles.fullscreenImage,
                      {
                        transform: [
                          { scale: zoomScale },
                          { translateX: panOffset.x },
                          { translateY: panOffset.y }
                        ]
                      },
                      zoomScale > MIN_ZOOM && styles.zoomedImageWeb,
                    ]}
                    contentFit="contain"
                    placeholder="https://placehold.co/600x400/CCCCCC/999999?text=Loading"
                  />
                </View>
              )}
            </Animated.View>
          </PanGestureHandler>

          {currentIndex > 0 && (
            <Pressable onPress={handlePrev} style={[styles.navButton, styles.leftButton]}>
              <Text style={styles.navText}>‹</Text>
            </Pressable>
          )}
          {currentIndex < images.length - 1 && (
            <Pressable onPress={handleNext} style={[styles.navButton, styles.rightButton]}>
              <Text style={styles.navText}>›</Text>
            </Pressable>
          )}

          {isWeb && (
            <View style={styles.webZoomControls}>
              <Pressable
                onPress={handleZoomOut}
                disabled={isMinZoom}
                style={[styles.zoomButton, isMinZoom && styles.zoomDisabled]}
              >
                <Text style={styles.zoomText}>-</Text>
              </Pressable>
              <Pressable
                onPress={handleZoomIn}
                disabled={isMaxZoom}
                style={[styles.zoomButton, isMaxZoom && styles.zoomDisabled]}
              >
                <Text style={styles.zoomText}>+</Text>
              </Pressable>
            </View>
          )}

          <Text style={styles.counter}>
            {currentIndex + 1} / {images.length}
          </Text>

          {isWeb && (
            <Text style={styles.hint}>
              Click to zoom/reset • Drag to pan when zoomed • Arrow keys to navigate • +/- to fine-tune zoom • Esc to close
            </Text>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  animatedImageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  imageWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: SCREEN_WIDTH * 0.95,
    height: SCREEN_HEIGHT * 0.8,
    overflow: 'hidden',
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
    transition: Platform.OS === 'web' ? 'transform 0.3s ease' : undefined,
  },
  zoomedImageWeb: {
    width: '100%',
    height: '100%',
    cursor: 'grab',
    // Prevents browser from initiating drag on image
    userSelect: 'none',        // disables text/image selection
    WebkitUserDrag: 'none',    // Safari drag disable
    pointerEvents: 'auto',     // ensure interactions work
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  leftButton: {
    left: 16,
  },
  rightButton: {
    right: 16,
  },
  navText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  webZoomControls: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    zIndex: 10,
  },
  zoomButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  zoomDisabled: {
    opacity: 0.4,
  },
  zoomText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: Platform.OS === 'web' ? 24 : 36,
  },
  counter: {
    position: 'absolute',
    bottom: 80,
    color: 'white',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 10,
  },
  hint: {
    position: 'absolute',
    bottom: 30,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontStyle: 'italic',
    zIndex: 10,
  },
});