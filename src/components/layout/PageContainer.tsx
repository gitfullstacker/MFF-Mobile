import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ViewStyle,
} from 'react-native';
import { colors, spacing } from '../../theme';

interface PageContainerProps {
  children: React.ReactNode;
  backgroundColor?: string;
  padding?: boolean;
  safeArea?: boolean;
  statusBarStyle?: 'light-content' | 'dark-content';
  style?: ViewStyle;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  backgroundColor = colors.background.light,
  padding = true,
  safeArea = true,
  statusBarStyle = 'dark-content',
  style,
}) => {
  const Container = safeArea ? SafeAreaView : View;

  return (
    <>
      <StatusBar barStyle={statusBarStyle} backgroundColor={backgroundColor} />
      <Container style={[styles.container, { backgroundColor }, style]}>
        <View style={[styles.content, padding && styles.padding]}>
          {children}
        </View>
      </Container>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  padding: {
    paddingHorizontal: spacing.md,
  },
});
