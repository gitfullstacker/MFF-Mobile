import React from 'react';
import {
  ScrollView,
  RefreshControl,
  ScrollViewProps,
  StyleSheet,
} from 'react-native';
import { colors } from '../../theme';

interface ScrollContainerProps extends ScrollViewProps {
  children: React.ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  showScrollIndicator?: boolean;
}

export const ScrollContainer: React.FC<ScrollContainerProps> = ({
  children,
  refreshing = false,
  onRefresh,
  showScrollIndicator = false,
  style,
  ...rest
}) => {
  return (
    <ScrollView
      style={[styles.container, style]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={showScrollIndicator}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        ) : undefined
      }
      {...rest}>
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
});
