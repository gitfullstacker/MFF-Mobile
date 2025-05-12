import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useAtom } from 'jotai';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../../theme';
import { Toast as ToastType, toastsAtom, removeToastAtom } from '../../store';

export const ToastContainer: React.FC = () => {
  const [toasts] = useAtom(toastsAtom);

  return (
    <View style={styles.container}>
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </View>
  );
};

interface ToastItemProps {
  toast: ToastType;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast }) => {
  const [, removeToast] = useAtom(removeToastAtom);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    if (toast.duration) {
      const timer = setTimeout(() => {
        handleClose();
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      removeToast(toast.id);
    });
  };

  const getIconAndColor = () => {
    switch (toast.type) {
      case 'success':
        return { icon: 'check-circle', color: colors.semantic.success };
      case 'error':
        return { icon: 'x-circle', color: colors.semantic.error };
      case 'warning':
        return { icon: 'alert-circle', color: colors.semantic.warning };
      case 'info':
        return { icon: 'info', color: colors.semantic.info };
    }
  };

  const { icon, color } = getIconAndColor();

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Icon name={icon} size={20} color={color} />
      </View>
      <Text style={styles.message}>{toast.message}</Text>
      <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
        <Icon name="x" size={20} color={colors.text.secondary} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: spacing.md,
    right: spacing.md,
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
    ...shadows.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  message: {
    flex: 1,
    ...typography.bodyRegular,
    color: colors.text.primary,
  },
  closeButton: {
    padding: spacing.xs,
  },
});
