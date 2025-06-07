import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  StatusBar,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/Feather';
import {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
} from '../../theme';
import { useAuth } from '../../hooks/useAuth';

const { height: screenHeight } = Dimensions.get('window');

interface ThriveDeskModalProps {
  visible: boolean;
  onClose: () => void;
  thriveDeskUrl?: string;
  title?: string;
  department?: string;
  subject?: string;
  prefilledMessage?: string;
  showMinimize?: boolean;
}

export const ThriveDeskModal: React.FC<ThriveDeskModalProps> = ({
  visible,
  onClose,
  thriveDeskUrl = 'https://your-company.thrivedesk.com/widget',
  title = 'Support Chat',
  department,
  subject,
  prefilledMessage,
  showMinimize = true,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [webViewKey, setWebViewKey] = useState(0);

  // Animation values
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const minimizedAnimation = useRef(new Animated.Value(0)).current;

  // Generate URL with user data and parameters
  const generateUrl = () => {
    const url = new URL(thriveDeskUrl);
    const params = url.searchParams;

    // Add user information if available
    if (user) {
      if (user.first_name && user.last_name) {
        params.append('name', `${user.first_name} ${user.last_name}`);
      }
      if (user.email) {
        params.append('email', user.email);
      }
      if (user.id) {
        params.append('user_id', user.id.toString());
      }
    }

    // Add conversation parameters
    if (department) params.append('department', department);
    if (subject) params.append('subject', subject);
    if (prefilledMessage) params.append('message', prefilledMessage);

    // Add app context
    params.append('source', 'mobile_app');
    params.append('platform', Platform.OS);
    params.append('app_version', '1.0.0');

    return url.toString();
  };

  // Animation effects
  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  useEffect(() => {
    Animated.timing(minimizedAnimation, {
      toValue: isMinimized ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isMinimized]);

  const handleLoadStart = () => {
    setLoading(true);
    setError(false);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    setLoading(false);
    setError(true);
  };

  const handleRetry = () => {
    setError(false);
    setLoading(true);
    setWebViewKey(prev => prev + 1); // Force WebView reload
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleMaximize = () => {
    setIsMinimized(false);
  };

  const handleClose = () => {
    if (isMinimized) {
      setIsMinimized(false);
      setTimeout(() => onClose(), 300);
    } else {
      onClose();
    }
  };

  const confirmClose = () => {
    Alert.alert(
      'Close Chat',
      'Are you sure you want to close the support chat? Your conversation will be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Close', style: 'destructive', onPress: handleClose },
      ],
    );
  };

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Icon name="wifi-off" size={48} color={colors.gray[400]} />
      <Text style={styles.errorTitle}>Connection Error</Text>
      <Text style={styles.errorMessage}>
        Unable to load support chat. Please check your internet connection and
        try again.
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>Connecting to support...</Text>
    </View>
  );

  // Minimized view
  const renderMinimizedView = () => (
    <Animated.View
      style={[
        styles.minimizedContainer,
        {
          opacity: minimizedAnimation,
          transform: [
            {
              translateY: minimizedAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0],
              }),
            },
          ],
        },
      ]}>
      <TouchableOpacity style={styles.minimizedChat} onPress={handleMaximize}>
        <View style={styles.minimizedContent}>
          <Icon name="message-circle" size={20} color={colors.white} />
          <Text style={styles.minimizedText}>Support Chat</Text>
          <View style={styles.minimizedBadge}>
            <View style={styles.onlineIndicator} />
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.minimizedCloseButton}
        onPress={confirmClose}>
        <Icon name="x" size={16} color={colors.white} />
      </TouchableOpacity>
    </Animated.View>
  );

  if (!visible && !isMinimized) return null;

  return (
    <>
      {/* Full Modal */}
      <Modal
        visible={visible && !isMinimized}
        animationType="none"
        presentationStyle="fullScreen"
        onRequestClose={confirmClose}>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

          <Animated.View
            style={[
              styles.modalContent,
              {
                opacity: slideAnimation,
                transform: [
                  {
                    translateY: slideAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [screenHeight, 0],
                    }),
                  },
                ],
              },
            ]}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.headerIcon}>
                  <Icon
                    name="message-circle"
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View>
                  <Text style={styles.headerTitle}>{title}</Text>
                  <View style={styles.statusIndicator}>
                    <View style={styles.onlineIndicator} />
                    <Text style={styles.statusText}>Online</Text>
                  </View>
                </View>
              </View>

              <View style={styles.headerActions}>
                {showMinimize && (
                  <TouchableOpacity
                    onPress={handleMinimize}
                    style={styles.actionButton}>
                    <Icon
                      name="minimize-2"
                      size={20}
                      color={colors.text.secondary}
                    />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={confirmClose}
                  style={styles.actionButton}>
                  <Icon name="x" size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* WebView Content */}
            <View style={styles.webViewContainer}>
              {error ? (
                renderError()
              ) : (
                <>
                  <WebView
                    key={webViewKey}
                    source={{ uri: generateUrl() }}
                    onLoadStart={handleLoadStart}
                    onLoadEnd={handleLoadEnd}
                    onError={handleError}
                    style={styles.webView}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={false}
                    userAgent="MacroFriendlyFood-Mobile-App/1.0.0"
                    allowsInlineMediaPlayback={true}
                    mediaPlaybackRequiresUserAction={false}
                    mixedContentMode="compatibility"
                    cacheEnabled={true}
                    incognito={false}
                    // ThriveDesk specific optimizations
                    onMessage={event => {
                      // Handle messages from ThriveDesk if needed
                      console.log(
                        'ThriveDesk message:',
                        event.nativeEvent.data,
                      );
                    }}
                  />
                  {loading && renderLoading()}
                </>
              )}
            </View>
          </Animated.View>
        </SafeAreaView>
      </Modal>

      {/* Minimized View */}
      {isMinimized && renderMinimizedView()}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  modalContent: {
    flex: 1,
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  headerTitle: {
    ...typography.h6,
    color: colors.text.primary,
    fontWeight: typography.fontWeights.semibold,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.semantic.success,
    marginRight: spacing.xs,
  },
  statusText: {
    ...typography.caption,
    color: colors.semantic.success,
    fontWeight: typography.fontWeights.medium,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: spacing.sm,
    marginLeft: spacing.xs,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
  },

  // WebView Styles
  webViewContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
  },

  // Loading Styles
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    zIndex: 1,
  },
  loadingText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },

  // Error Styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.white,
  },
  errorTitle: {
    ...typography.h5,
    color: colors.text.primary,
    fontWeight: typography.fontWeights.semibold,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
  },
  retryButtonText: {
    ...typography.bodyRegular,
    color: colors.white,
    fontWeight: typography.fontWeights.semibold,
  },

  // Minimized View Styles
  minimizedContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1000,
  },
  minimizedChat: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.xs,
    ...shadows.lg,
  },
  minimizedContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  minimizedText: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: typography.fontWeights.medium,
    marginLeft: spacing.xs,
    marginRight: spacing.sm,
  },
  minimizedBadge: {
    position: 'relative',
  },
  minimizedCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray[600],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
});
