import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { PageContainer } from '../../components/layout/PageContainer';
import { Header } from '../../components/navigation/Header';
import { Section } from '../../components/layout/Section';
import { Input } from '../../components/forms/Input';
import { Button } from '../../components/forms/Button';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  fontWeights,
} from '../../theme';
import { useAtom } from 'jotai';
import { userPreferencesAtom } from '@/store/atoms/userPreferences';

const PreferencesScreen: React.FC = () => {
  const navigation = useNavigation();

  const [userPreferences, setUserPreferences] = useAtom(userPreferencesAtom);

  // Initialize state from stored preferences
  const [calorieTarget, setCalorieTarget] = useState(
    userPreferences.calorieTarget.toString(),
  );
  const [proteinTarget, setProteinTarget] = useState(
    userPreferences.proteinTarget.toString(),
  );
  const [carbsTarget, setCarbsTarget] = useState(
    userPreferences.carbsTarget.toString(),
  );
  const [fatTarget, setFatTarget] = useState(
    userPreferences.fatTarget.toString(),
  );

  // Notifications
  const [mealReminders, setMealReminders] = useState(true);
  const [shoppingListReminders, setShoppingListReminders] = useState(false);
  const [weeklyMealPlan, setWeeklyMealPlan] = useState(true);

  // Units
  const [useMetric, setUseMetric] = useState(false);

  // Update save handler:
  const handleSavePreferences = () => {
    const newPreferences = {
      ...userPreferences,
      calorieTarget: parseInt(calorieTarget) || 2000,
      proteinTarget: parseInt(proteinTarget) || 150,
      carbsTarget: parseInt(carbsTarget) || 200,
      fatTarget: parseInt(fatTarget) || 65,
    };

    setUserPreferences(newPreferences);

    Alert.alert('Success', 'Your preferences have been saved!', [
      { text: 'OK' },
    ]);
  };

  const renderNotification = (
    title: string,
    description: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    icon: string,
  ) => (
    <View style={styles.preferenceItem}>
      <View style={styles.preferenceIcon}>
        <Icon name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.preferenceContent}>
        <Text style={styles.preferenceTitle}>{title}</Text>
        <Text style={styles.preferenceDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: colors.gray[300],
          true: colors.primary + '70',
        }}
        thumbColor={value ? colors.primary : colors.gray[100]}
      />
    </View>
  );

  return (
    <PageContainer safeArea={false}>
      <Header title="Preferences" showBack={true} />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Macro Targets */}
        <Section title="Daily Macro Targets">
          <Input
            label="Calories"
            placeholder="2000"
            value={calorieTarget}
            onChangeText={setCalorieTarget}
            keyboardType="numeric"
            rightIcon="target"
          />

          <Input
            label="Protein (g)"
            placeholder="150"
            value={proteinTarget}
            onChangeText={setProteinTarget}
            keyboardType="numeric"
            rightIcon="target"
          />

          <Input
            label="Carbohydrates (g)"
            placeholder="200"
            value={carbsTarget}
            onChangeText={setCarbsTarget}
            keyboardType="numeric"
            rightIcon="target"
          />

          <Input
            label="Fat (g)"
            placeholder="65"
            value={fatTarget}
            onChangeText={setFatTarget}
            keyboardType="numeric"
            rightIcon="target"
          />
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          {renderNotification(
            'Meal Reminders',
            'Get reminded about meal times',
            mealReminders,
            setMealReminders,
            'bell',
          )}
          {renderNotification(
            'Shopping List Reminders',
            'Weekly shopping list notifications',
            shoppingListReminders,
            setShoppingListReminders,
            'shopping-cart',
          )}
          {renderNotification(
            'Weekly Meal Plan',
            'Reminders to plan your week',
            weeklyMealPlan,
            setWeeklyMealPlan,
            'calendar',
          )}
        </Section>

        {/* Save Button */}
        <View style={styles.saveContainer}>
          <Button
            title="Save Preferences"
            onPress={handleSavePreferences}
            variant="primary"
            fullWidth
            icon={<Icon name="save" size={18} color={colors.white} />}
          />
        </View>
      </ScrollView>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  preferenceIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  preferenceContent: {
    flex: 1,
  },
  preferenceTitle: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    fontWeight: fontWeights.semibold,
    marginBottom: spacing.xs,
  },
  preferenceDescription: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  saveContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
});

export default PreferencesScreen;
