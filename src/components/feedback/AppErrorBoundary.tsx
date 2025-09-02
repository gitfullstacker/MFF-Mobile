import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing } from '../../theme';

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<{
    error: Error;
    errorInfo: any;
    resetError: () => void;
  }>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
  errorCount: number;
}

export class AppErrorBoundary extends Component<Props, State> {
  private errorLogKey = 'app_error_boundary_logs';

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  async componentDidCatch(error: Error, errorInfo: any) {
    const errorCount = this.state.errorCount + 1;

    console.error('🚨 AppErrorBoundary caught error:', error);
    console.error('🚨 Error info:', errorInfo);

    this.setState({
      errorInfo,
      errorCount,
    });

    // Log error details for debugging
    const errorLog = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorCount,
      props: JSON.stringify(this.props, null, 2),
    };

    try {
      // Store error log locally
      const existingLogs = await AsyncStorage.getItem(this.errorLogKey);
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      logs.unshift(errorLog);

      // Keep only last 20 errors
      const trimmedLogs = logs.slice(0, 20);
      await AsyncStorage.setItem(this.errorLogKey, JSON.stringify(trimmedLogs));
    } catch (storageError) {
      console.error('Failed to log error to storage:', storageError);
    }

    // If too many errors, show critical alert
    if (errorCount >= 3) {
      Alert.alert(
        'Critical Error',
        'The app has encountered multiple errors. Please restart the application.',
        [
          {
            text: 'Restart App',
            onPress: () => {
              // In production, you might want to restart the app
              this.resetError();
            },
          },
        ],
      );
    }

    // TODO: In production, send error to crash reporting service
    // crashlytics().recordError(error);
    // Sentry.captureException(error, { extra: errorInfo });
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    });
  };

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props;

      if (Fallback && this.state.error && this.state.errorInfo) {
        return (
          <Fallback
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            resetError={this.resetError}
          />
        );
      }

      return (
        <View style={styles.container}>
          <Text style={styles.title}>Oops! Something went wrong</Text>
          <Text style={styles.message}>
            An unexpected error occurred. The app will try to recover.
          </Text>

          {__DEV__ && this.state.error && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>Debug Info:</Text>
              <Text style={styles.debugText} numberOfLines={10}>
                {this.state.error.message}
                {'\n\n'}
                {this.state.error.stack}
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.button} onPress={this.resetError}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background.light,
  },
  title: {
    ...typography.h4,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  message: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
    marginTop: spacing.lg,
  },
  buttonText: {
    ...typography.buttonMedium,
    color: colors.white,
  },
  debugContainer: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    maxHeight: 200,
    width: '100%',
  },
  debugTitle: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  debugText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontFamily: 'monospace',
  },
});
