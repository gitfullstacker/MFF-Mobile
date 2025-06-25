import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';
import { colors, typography, spacing, shadows } from '../../theme';
import { TAB_BAR_CONFIG } from '../../constants/navigation';
import { useNavigationHelpers } from '@/hooks/useNavigation';
import { MainTabParamList } from '@/types';

export const TabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { navigateToMainTab } = useNavigationHelpers();

  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;
        // Type-safe icon lookup with fallback
        const icon =
          (TAB_BAR_CONFIG.ICONS as Record<string, string>)[route.name] ||
          'circle';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigateToMainTab(route.name as keyof MainTabParamList);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tab}>
            <Icon
              name={icon}
              size={24}
              color={isFocused ? colors.primary : colors.gray[400]}
            />
            <Text
              style={[
                styles.label,
                { color: isFocused ? colors.primary : colors.gray[400] },
              ]}>
              {typeof label === 'string' ? label : route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    height:
      Platform.OS === 'ios'
        ? TAB_BAR_CONFIG.HEIGHT.IOS
        : TAB_BAR_CONFIG.HEIGHT.ANDROID,
    paddingBottom:
      Platform.OS === 'ios'
        ? TAB_BAR_CONFIG.SAFE_AREA_BOTTOM.IOS
        : TAB_BAR_CONFIG.SAFE_AREA_BOTTOM.ANDROID,
    ...shadows.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xs,
  },
  label: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
});
