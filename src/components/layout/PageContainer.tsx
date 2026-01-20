import React from 'react';
import { View, StyleSheet, StatusBar, ViewStyle, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../../theme';

interface PageContainerProps {
  children: React.ReactNode;
  backgroundColor?: string;
  padding?: boolean;
  statusBarStyle?: 'light-content' | 'dark-content';
  style?: ViewStyle;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  backgroundColor = colors.background.light,
  padding = true,
  statusBarStyle = 'dark-content',
  style,
}) => {
  const Container = Platform.OS === 'android' ? SafeAreaView : View;

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
