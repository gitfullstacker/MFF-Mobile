import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { BottomSheet } from './BottomSheet';
import { Button } from '../forms/Button';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  fontWeights,
  shadows,
} from '../../theme';

interface AIAdviceModalProps {
  visible: boolean;
  onClose: () => void;
  loading: boolean;
  advice: string;
  recommendations: string[];
}

const AIAdviceModal: React.FC<AIAdviceModalProps> = ({
  visible,
  onClose,
  loading,
  advice,
  recommendations,
}) => {
  return (
    <BottomSheet visible={visible} onClose={onClose} height="85%">
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Icon name="cpu" size={24} color={colors.primary} />
          <Text style={styles.title}>AI Nutritional Advice</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="x" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {loading && !advice ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>
              Generating personalized advice...
            </Text>
          </View>
        ) : (
          <>
            {advice && (
              <View style={styles.adviceContainer}>
                <View style={styles.adviceHeader}>
                  <Icon name="file-text" size={20} color={colors.primary} />
                  <Text style={styles.adviceHeaderText}>
                    Personalized Advice
                  </Text>
                </View>
                <Text style={styles.adviceText}>{advice}</Text>
              </View>
            )}

            {recommendations.length > 0 && (
              <View style={styles.recommendationsContainer}>
                <View style={styles.recommendationsHeader}>
                  <Icon name="lightbulb" size={20} color={colors.primary} />
                  <Text style={styles.recommendationsTitle}>
                    Key Recommendations
                  </Text>
                </View>
                {recommendations.map((recommendation, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <View style={styles.checkIconContainer}>
                      <Icon
                        name="check"
                        size={16}
                        color={colors.semantic.success}
                      />
                    </View>
                    <Text style={styles.recommendationText}>
                      {recommendation}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {!loading && !advice && (
              <View style={styles.emptyContainer}>
                <Icon
                  name="alert-circle"
                  size={48}
                  color={colors.text.disabled}
                />
                <Text style={styles.emptyText}>
                  No advice available at the moment
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button title="Close" onPress={onClose} variant="primary" fullWidth />
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.h6,
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  scrollContent: {
    paddingVertical: spacing.lg,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  loadingText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  adviceContainer: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  adviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  adviceHeaderText: {
    ...typography.bodyLarge,
    fontWeight: fontWeights.semibold,
    color: colors.text.primary,
  },
  adviceText: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    lineHeight: 22,
  },
  recommendationsContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing.lg,
    ...shadows.sm,
  },
  recommendationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  recommendationsTitle: {
    ...typography.bodyLarge,
    fontWeight: fontWeights.semibold,
    color: colors.text.primary,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  checkIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.semantic.success + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  recommendationText: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    flex: 1,
    lineHeight: 22,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    ...typography.bodyRegular,
    color: colors.text.disabled,
    marginTop: spacing.md,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
});

export default AIAdviceModal;
