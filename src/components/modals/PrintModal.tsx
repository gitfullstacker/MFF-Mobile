import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';
import { BottomSheet } from './BottomSheet';
import { Input } from '../forms/Input';
import { Button } from '../forms/Button';
import { usePrint } from '../../hooks/usePrint';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  fontWeights,
  shadows,
} from '../../theme';
import { PrintHistory } from '../../types/print';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PrintModalProps {
  visible: boolean;
  onClose: () => void;
  recipeId: number;
  recipeName?: string;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  visible,
  onClose,
  recipeId,
  recipeName,
}) => {
  const {
    loading,
    quotaInfo,
    quotaLoading,
    fetchQuotaInfo,
    previewRecipe,
    printRecipe,
    openPrintInBrowser,
  } = usePrint();

  const [imageWidth, setImageWidth] = useState('500');
  const [imageHeight, setImageHeight] = useState('900');
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'settings' | 'preview' | 'history'
  >('settings');
  const [errors, setErrors] = useState<{
    width?: string;
    height?: string;
  }>({});

  // Fetch quota info when modal opens
  useEffect(() => {
    if (visible) {
      fetchQuotaInfo();
    }
  }, [visible, fetchQuotaInfo]);

  // Validate dimensions
  const validateDimensions = useCallback((): boolean => {
    const newErrors: { width?: string; height?: string } = {};

    const width = parseInt(imageWidth, 10);
    const height = parseInt(imageHeight, 10);

    if (isNaN(width) || width < 100 || width > 2000) {
      newErrors.width = 'Width must be between 100 and 2000';
    }

    if (isNaN(height) || height < 100 || height > 2000) {
      newErrors.height = 'Height must be between 100 and 2000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [imageWidth, imageHeight]);

  // Handle preview
  const handlePreview = useCallback(async () => {
    if (!validateDimensions()) {
      return;
    }

    try {
      const width = parseInt(imageWidth, 10);
      const height = parseInt(imageHeight, 10);

      const html = await previewRecipe(recipeId, width, height);
      setPreviewHtml(html);
      setActiveTab('preview');
    } catch (error) {
      // Error handling is done in the hook
    }
  }, [recipeId, imageWidth, imageHeight, validateDimensions, previewRecipe]);

  // Handle print
  const handlePrint = useCallback(async () => {
    if (!validateDimensions()) {
      return;
    }

    if (!quotaInfo || quotaInfo.remaining <= 0) {
      Alert.alert(
        'Quota Exceeded',
        'You have reached your weekly print limit. Please wait until the quota resets.',
        [{ text: 'OK' }],
      );
      return;
    }

    Alert.alert(
      'Print Recipe',
      `This will count against your weekly print quota. You have ${quotaInfo.remaining} prints remaining.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Print',
          onPress: async () => {
            try {
              const width = parseInt(imageWidth, 10);
              const height = parseInt(imageHeight, 10);

              const html = await printRecipe(recipeId, width, height);

              // Open in browser for printing
              await openPrintInBrowser(html);

              // Optionally close modal after successful print
              // onClose();
            } catch (error) {
              // Error handling is done in the hook
            }
          },
        },
      ],
    );
  }, [
    recipeId,
    imageWidth,
    imageHeight,
    quotaInfo,
    validateDimensions,
    printRecipe,
    openPrintInBrowser,
  ]);

  // Handle close
  const handleClose = useCallback(() => {
    setActiveTab('settings');
    setPreviewHtml(null);
    setImageWidth('500');
    setImageHeight('900');
    setErrors({});
    onClose();
  }, [onClose]);

  // Render quota info
  const renderQuotaInfo = () => {
    if (quotaLoading) {
      return (
        <View style={styles.quotaLoading}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      );
    }

    if (!quotaInfo) {
      return null;
    }

    const quotaPercentage =
      (quotaInfo.current_usage / quotaInfo.weekly_limit) * 100;
    const isLowQuota = quotaInfo.remaining <= 3;

    return (
      <View style={styles.quotaContainer}>
        <View style={styles.quotaHeader}>
          <View style={styles.quotaTextContainer}>
            <Text style={styles.quotaLabel}>Print Quota</Text>
            <Text
              style={[
                styles.quotaValue,
                isLowQuota && styles.quotaValueWarning,
              ]}>
              {quotaInfo.remaining} / {quotaInfo.weekly_limit} remaining
            </Text>
          </View>
          <Icon
            name="info"
            size={20}
            color={colors.text.secondary}
            onPress={() => {
              Alert.alert(
                'Print Quota',
                `You can print up to ${
                  quotaInfo.weekly_limit
                } recipes per week. Your quota resets on ${format(
                  new Date(quotaInfo.reset_date),
                  'EEEE, MMMM do',
                )}.`,
                [{ text: 'OK' }],
              );
            }}
          />
        </View>

        <View style={styles.quotaBar}>
          <View
            style={[
              styles.quotaBarFill,
              {
                width: `${quotaPercentage}%`,
                backgroundColor: isLowQuota
                  ? colors.semantic.error
                  : colors.primary,
              },
            ]}
          />
        </View>

        <Text style={styles.quotaResetText}>
          Resets on {format(new Date(quotaInfo.reset_date), 'EEEE, MMMM do')}
        </Text>
      </View>
    );
  };

  // Render settings tab
  const renderSettingsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {renderQuotaInfo()}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Print Settings</Text>
        <Text style={styles.sectionDescription}>
          Customize the image dimensions for your printed recipe
        </Text>

        <View style={styles.inputRow}>
          <View style={styles.inputContainer}>
            <Input
              label="Image Width (px)"
              value={imageWidth}
              onChangeText={setImageWidth}
              keyboardType="number-pad"
              placeholder="500"
              error={errors.width}
            />
          </View>

          <View style={styles.inputContainer}>
            <Input
              label="Image Height (px)"
              value={imageHeight}
              onChangeText={setImageHeight}
              keyboardType="number-pad"
              placeholder="900"
              error={errors.height}
            />
          </View>
        </View>

        <Text style={styles.helperText}>
          Recommended dimensions: Width 400-600px, Height 800-1000px
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Preview"
          onPress={handlePreview}
          variant="outline"
          style={styles.button}
          icon={<Icon name="eye" size={18} color={colors.primary} />}
          disabled={loading}
        />

        <Button
          title="Print"
          onPress={handlePrint}
          variant="primary"
          style={styles.button}
          icon={<Icon name="printer" size={18} color={colors.white} />}
          disabled={loading || !quotaInfo || quotaInfo.remaining <= 0}
        />
      </View>
    </ScrollView>
  );

  // Render preview tab
  const renderPreviewTab = () => (
    <View style={styles.tabContent}>
      {previewHtml ? (
        <>
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>Recipe Preview</Text>
            <TouchableOpacity
              style={styles.updateButton}
              onPress={handlePreview}
              disabled={loading}>
              <Icon name="refresh-cw" size={16} color={colors.primary} />
              <Text style={styles.updateButtonText}>Update Preview</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.webViewContainer}>
            <WebView
              source={{ html: previewHtml }}
              style={styles.webView}
              scalesPageToFit={Platform.OS === 'android'}
              showsVerticalScrollIndicator={true}
            />
          </View>

          <View style={styles.previewActions}>
            <Button
              title="Back to Settings"
              onPress={() => setActiveTab('settings')}
              variant="outline"
              style={styles.previewButton}
            />
            <Button
              title="Print"
              onPress={handlePrint}
              variant="primary"
              style={styles.previewButton}
              icon={<Icon name="printer" size={18} color={colors.white} />}
              disabled={loading || !quotaInfo || quotaInfo.remaining <= 0}
            />
          </View>
        </>
      ) : (
        <View style={styles.emptyPreview}>
          <MaterialIcon name="preview" size={64} color={colors.text.disabled} />
          <Text style={styles.emptyPreviewText}>
            Click "Preview" to see your recipe
          </Text>
        </View>
      )}
    </View>
  );

  // Render history tab
  const renderHistoryTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {renderQuotaInfo()}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Print History</Text>
        <Text style={styles.sectionDescription}>
          Your recent printed recipes
        </Text>

        {quotaInfo && quotaInfo.print_history.length > 0 ? (
          <View style={styles.historyList}>
            {quotaInfo.print_history.map((item, index) => (
              <View
                key={`${item.recipe_id}-${index}`}
                style={styles.historyItem}>
                <View style={styles.historyIconContainer}>
                  <Icon name="file-text" size={20} color={colors.primary} />
                </View>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyRecipeName}>
                    {item.recipe_name}
                  </Text>
                  <Text style={styles.historyDate}>
                    {format(new Date(item.printed_at), 'MMM dd, yyyy • h:mm a')}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyHistory}>
            <MaterialIcon
              name="history"
              size={48}
              color={colors.text.disabled}
            />
            <Text style={styles.emptyHistoryText}>No print history yet</Text>
            <Text style={styles.emptyHistorySubtext}>
              Your printed recipes will appear here
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      height={SCREEN_HEIGHT * 0.9}>
      <View style={styles.header}>
        <Text style={styles.title}>Print Recipe</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Icon name="x" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {recipeName && (
        <View style={styles.recipeNameContainer}>
          <Icon name="book-open" size={16} color={colors.text.secondary} />
          <Text style={styles.recipeName} numberOfLines={1}>
            {recipeName}
          </Text>
        </View>
      )}

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' && styles.tabActive]}
          onPress={() => setActiveTab('settings')}>
          <Icon
            name="settings"
            size={20}
            color={
              activeTab === 'settings' ? colors.primary : colors.text.secondary
            }
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'settings' && styles.tabTextActive,
            ]}>
            Settings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'preview' && styles.tabActive]}
          onPress={() => setActiveTab('preview')}>
          <Icon
            name="eye"
            size={20}
            color={
              activeTab === 'preview' ? colors.primary : colors.text.secondary
            }
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'preview' && styles.tabTextActive,
            ]}>
            Preview
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}>
          <Icon
            name="clock"
            size={20}
            color={
              activeTab === 'history' ? colors.primary : colors.text.secondary
            }
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'history' && styles.tabTextActive,
            ]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'settings' && renderSettingsTab()}
      {activeTab === 'preview' && renderPreviewTab()}
      {activeTab === 'history' && renderHistoryTab()}

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            {activeTab === 'preview' ? 'Generating preview...' : 'Printing...'}
          </Text>
        </View>
      )}
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  title: {
    ...typography.h5,
    color: colors.text.primary,
    fontWeight: fontWeights.semibold,
  },
  closeButton: {
    padding: spacing.xs,
  },
  recipeNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.gray,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  recipeName: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    marginTop: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: fontWeights.semibold,
  },
  tabContent: {
    flex: 1,
    marginTop: spacing.md,
  },
  quotaContainer: {
    backgroundColor: colors.background.gray,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  quotaLoading: {
    padding: spacing.md,
    alignItems: 'center',
  },
  quotaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quotaTextContainer: {
    flex: 1,
  },
  quotaLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  quotaValue: {
    ...typography.h6,
    color: colors.text.primary,
    fontWeight: fontWeights.semibold,
  },
  quotaValueWarning: {
    color: colors.semantic.error,
  },
  quotaBar: {
    height: 8,
    backgroundColor: colors.border.light,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  quotaBarFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  quotaResetText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h6,
    color: colors.text.primary,
    fontWeight: fontWeights.semibold,
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  inputContainer: {
    flex: 1,
  },
  helperText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  button: {
    flex: 1,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  previewTitle: {
    ...typography.h6,
    color: colors.text.primary,
    fontWeight: fontWeights.semibold,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  updateButtonText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: fontWeights.medium,
  },
  webViewContainer: {
    flex: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.light,
    marginBottom: spacing.md,
  },
  webView: {
    flex: 1,
    backgroundColor: colors.white,
  },
  emptyPreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyPreviewText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  previewActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  previewButton: {
    flex: 1,
  },
  historyList: {
    marginTop: spacing.md,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  historyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.gray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  historyInfo: {
    flex: 1,
  },
  historyRecipeName: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: fontWeights.medium,
    marginBottom: spacing.md,
  },
  historyDate: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  emptyHistory: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.lg,
  },
  emptyHistoryText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginTop: spacing.md,
    fontWeight: fontWeights.medium,
  },
  emptyHistorySubtext: {
    ...typography.caption,
    color: colors.text.disabled,
    marginTop: spacing.xs,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  loadingText: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
});
