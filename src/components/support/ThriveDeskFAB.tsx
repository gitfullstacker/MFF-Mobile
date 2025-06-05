import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {
  colors,
  shadows,
  spacing,
  typography,
  borderRadius,
} from '../../theme';
import { useThriveDesk } from '../../hooks/useThriveDesk';
import { ThriveDeskModal } from '../modals/ThriveDeskModal';

interface ThriveDeskFABProps {
  visible?: boolean;
  position?: 'bottom-right' | 'bottom-left';
  showLabel?: boolean;
  onPress?: () => void;
}

export const ThriveDeskFAB: React.FC<ThriveDeskFABProps> = ({
  visible = true,
  position = 'bottom-right',
  showLabel = false,
  onPress,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Animation values
  const scaleValue = useRef(new Animated.Value(1)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const tooltipOpacity = useRef(new Animated.Value(0)).current;

  // ThriveDesk integration
  const { modalState, hideModal, openGeneralSupport, generateWidgetUrl } =
    useThriveDesk({
      baseUrl: 'https://your-company.thrivedesk.com',
      defaultDepartment: 'support',
    });

  // Pulse animation effect
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.15,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    );

    if (visible) {
      pulse.start();
    } else {
      pulse.stop();
    }

    return () => pulse.stop();
  }, [visible, pulseValue]);

  // Tooltip animation
  useEffect(() => {
    Animated.timing(tooltipOpacity, {
      toValue: showTooltip ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showTooltip, tooltipOpacity]);

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      openGeneralSupport();
    }
  };

  const handleLongPress = () => {
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 2000);
  };

  if (!visible) return null;

  const positionStyle =
    position === 'bottom-right' ? styles.bottomRight : styles.bottomLeft;

  const labelPosition =
    position === 'bottom-right' ? styles.labelLeft : styles.labelRight;

  return (
    <>
      <View style={[styles.container, positionStyle]} pointerEvents="box-none">
        {/* Tooltip */}
        <Animated.View
          style={[
            styles.tooltip,
            labelPosition,
            {
              opacity: tooltipOpacity,
              transform: [
                {
                  scale: tooltipOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}>
          <Text style={styles.tooltipText}>Need help? Chat with support!</Text>
        </Animated.View>

        {/* Pulse circle */}
        <Animated.View
          style={[
            styles.pulseContainer,
            {
              transform: [{ scale: pulseValue }],
            },
          ]}>
          <View style={styles.pulseCircle} />
        </Animated.View>

        {/* Main FAB */}
        <TouchableOpacity
          style={styles.fab}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          onLongPress={handleLongPress}
          activeOpacity={0.9}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Animated.View
            style={[
              styles.fabContent,
              {
                transform: [{ scale: scaleValue }],
              },
            ]}>
            <Icon name="message-circle" size={24} color={colors.white} />
            {showLabel && <Text style={styles.fabLabel}>Help</Text>}
          </Animated.View>
        </TouchableOpacity>

        {/* Online indicator */}
        <View style={styles.onlineIndicator}>
          <View style={styles.onlineDot} />
        </View>
      </View>

      {/* ThriveDesk Modal */}
      <ThriveDeskModal
        visible={modalState.visible}
        onClose={hideModal}
        title={modalState.title}
        department={modalState.department}
        subject={modalState.subject}
        prefilledMessage={modalState.prefilledMessage}
        thriveDeskUrl={generateWidgetUrl()}
        showMinimize={true}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
  },
  bottomRight: {
    bottom: Platform.OS === 'ios' ? 100 : 80,
    right: spacing.md,
  },
  bottomLeft: {
    bottom: Platform.OS === 'ios' ? 100 : 80,
    left: spacing.md,
  },

  // Pulse animation
  pulseContainer: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    top: -5,
    left: -5,
  },
  pulseCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    opacity: 0.3,
  },

  // Main FAB
  fab: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
    position: 'relative',
  },
  fabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fabLabel: {
    ...typography.caption,
    color: colors.white,
    fontWeight: typography.fontWeights.bold,
    marginLeft: spacing.xs,
  },

  // Online indicator
  onlineIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.semantic.success,
  },

  // Tooltip
  tooltip: {
    position: 'absolute',
    bottom: 70,
    backgroundColor: colors.gray[800],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    maxWidth: 200,
  },
  labelLeft: {
    right: 0,
  },
  labelRight: {
    left: 0,
  },
  tooltipText: {
    ...typography.bodySmall,
    color: colors.white,
    textAlign: 'center',
  },
});

export default ThriveDeskFAB;
