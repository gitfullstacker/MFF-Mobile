import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { BottomSheet } from './BottomSheet';
import { Button } from '../forms/Button';
import { colors, typography, spacing } from '../../theme';
import { Recipe } from '../../types/recipe';

interface ShoppingListModalProps {
  visible: boolean;
  onClose: () => void;
  recipes: Recipe[];
}

interface IngredientItem {
  name: string;
  amount: string;
  unit: string;
  notes?: string;
  checked: boolean;
  recipeId: string;
  recipeName: string;
}

export const ShoppingListModal: React.FC<ShoppingListModalProps> = ({
  visible,
  onClose,
  recipes,
}) => {
  const [ingredients, setIngredients] = useState<IngredientItem[]>([]);
  const [groupByRecipe, setGroupByRecipe] = useState(true);

  useEffect(() => {
    const items: IngredientItem[] = [];

    recipes.forEach(recipe => {
      recipe.ingredients.forEach(group => {
        group.items.forEach(ingredient => {
          items.push({
            name: ingredient.name,
            amount: ingredient.amount,
            unit: ingredient.unit,
            notes: ingredient.notes,
            checked: false,
            recipeId: recipe._id,
            recipeName: recipe.name,
          });
        });
      });
    });

    setIngredients(items);
  }, [recipes]);

  const toggleIngredient = (index: number) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index].checked = !updatedIngredients[index].checked;
    setIngredients(updatedIngredients);
  };

  const sortedIngredients = () => {
    if (groupByRecipe) {
      // Group by recipe
      return [...ingredients].sort((a, b) => {
        // First by recipe name
        if (a.recipeName < b.recipeName) return -1;
        if (a.recipeName > b.recipeName) return 1;

        // Then by ingredient name
        return a.name.localeCompare(b.name);
      });
    } else {
      // Just alphabetically by ingredient name
      return [...ingredients].sort((a, b) => a.name.localeCompare(b.name));
    }
  };

  const getRecipeGroups = () => {
    const groups: { [key: string]: string } = {};
    recipes.forEach(recipe => {
      groups[recipe._id] = recipe.name;
    });
    return groups;
  };

  const generateShoppingListText = () => {
    let text = 'Shopping List\n\n';

    if (groupByRecipe) {
      const recipeGroups = getRecipeGroups();
      const groupedByRecipe: { [key: string]: IngredientItem[] } = {};

      ingredients.forEach(item => {
        if (!groupedByRecipe[item.recipeId]) {
          groupedByRecipe[item.recipeId] = [];
        }
        groupedByRecipe[item.recipeId].push(item);
      });

      Object.keys(groupedByRecipe).forEach(recipeId => {
        text += `${recipeGroups[recipeId]}:\n`;
        groupedByRecipe[recipeId].forEach(item => {
          text += `- ${item.amount} ${item.unit} ${item.name}`;
          if (item.notes) text += ` (${item.notes})`;
          text += '\n';
        });
        text += '\n';
      });
    } else {
      ingredients
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(item => {
          text += `- ${item.amount} ${item.unit} ${item.name}`;
          if (item.notes) text += ` (${item.notes})`;
          text += '\n';
        });
    }

    return text;
  };

  const handleShare = async () => {
    try {
      const text = generateShoppingListText();
      await Share.share({
        message: text,
        title: 'Shopping List',
      });
    } catch (error) {
      console.error('Error sharing shopping list:', error);
    }
  };

  const handlePrint = () => {
    // In a real app, this would integrate with a printing library
    // For now, we'll just share the text which can be printed from there
    handleShare();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} height="80%">
      <View style={styles.header}>
        <Text style={styles.title}>Shopping List</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="x" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.controls}>
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>Group by Recipe</Text>
          <Switch
            value={groupByRecipe}
            onValueChange={setGroupByRecipe}
            trackColor={{
              false: colors.gray[300],
              true: colors.primary + '70',
            }}
            thumbColor={groupByRecipe ? colors.primary : colors.gray[100]}
          />
        </View>

        <View style={styles.actionButtons}>
          <Button
            title="Share"
            onPress={handleShare}
            variant="outline"
            size="small"
            icon={<Icon name="share-2" size={16} color={colors.primary} />}
            style={styles.actionButton}
          />
          <Button
            title="Print"
            onPress={handlePrint}
            variant="outline"
            size="small"
            icon={<Icon name="printer" size={16} color={colors.primary} />}
            style={styles.actionButton}
          />
        </View>
      </View>

      <ScrollView style={styles.content}>
        {groupByRecipe
          ? // Grouped by recipe
            (() => {
              const sortedItems = sortedIngredients();
              const groupedByRecipe: { [key: string]: IngredientItem[] } = {};

              sortedItems.forEach(item => {
                if (!groupedByRecipe[item.recipeId]) {
                  groupedByRecipe[item.recipeId] = [];
                }
                groupedByRecipe[item.recipeId].push(item);
              });

              return Object.keys(groupedByRecipe).map(recipeId => (
                <View key={recipeId} style={styles.recipeGroup}>
                  <Text style={styles.recipeTitle}>
                    {groupedByRecipe[recipeId][0].recipeName}
                  </Text>
                  {groupedByRecipe[recipeId].map((item, index) => (
                    <TouchableOpacity
                      key={`${recipeId}-${index}`}
                      style={[
                        styles.ingredientItem,
                        item.checked && styles.ingredientItemChecked,
                      ]}
                      onPress={() => {
                        const originalIndex = ingredients.findIndex(
                          i =>
                            i.recipeId === item.recipeId &&
                            i.name === item.name &&
                            i.amount === item.amount,
                        );
                        if (originalIndex !== -1) {
                          toggleIngredient(originalIndex);
                        }
                      }}>
                      <View
                        style={[
                          styles.checkbox,
                          item.checked && styles.checkboxChecked,
                        ]}>
                        {item.checked && (
                          <Icon name="check" size={14} color={colors.white} />
                        )}
                      </View>
                      <View style={styles.ingredientInfo}>
                        <Text
                          style={[
                            styles.ingredientName,
                            item.checked && styles.ingredientNameChecked,
                          ]}
                          numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text style={styles.ingredientAmount}>
                          {item.amount} {item.unit}
                          {item.notes ? ` (${item.notes})` : ''}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ));
            })()
          : // Alphabetical list
            sortedIngredients().map(item => (
              <TouchableOpacity
                key={`${item.recipeId}-${item.name}-${item.amount}`}
                style={[
                  styles.ingredientItem,
                  item.checked && styles.ingredientItemChecked,
                ]}
                onPress={() => {
                  const originalIndex = ingredients.findIndex(
                    i =>
                      i.recipeId === item.recipeId &&
                      i.name === item.name &&
                      i.amount === item.amount,
                  );
                  if (originalIndex !== -1) toggleIngredient(originalIndex);
                }}>
                <View
                  style={[
                    styles.checkbox,
                    item.checked && styles.checkboxChecked,
                  ]}>
                  {item.checked && (
                    <Icon name="check" size={14} color={colors.white} />
                  )}
                </View>
                <View style={styles.ingredientInfo}>
                  <Text
                    style={[
                      styles.ingredientName,
                      item.checked && styles.ingredientNameChecked,
                    ]}
                    numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.ingredientAmount}>
                    {item.amount} {item.unit}
                    {item.notes ? ` (${item.notes})` : ''}
                  </Text>
                  <Text style={styles.recipeLabel}>{item.recipeName}</Text>
                </View>
              </TouchableOpacity>
            ))}
      </ScrollView>
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
  },
  closeButton: {
    padding: spacing.xs,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleText: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    marginRight: spacing.sm,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: spacing.sm,
  },
  content: {
    flex: 1,
    paddingTop: spacing.md,
  },
  recipeGroup: {
    marginBottom: spacing.lg,
  },
  recipeTitle: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    fontWeight: typography.fontWeights.semibold,
    marginBottom: spacing.sm,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  ingredientItemChecked: {
    opacity: 0.6,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    marginBottom: 2,
  },
  ingredientNameChecked: {
    textDecorationLine: 'line-through',
  },
  ingredientAmount: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  recipeLabel: {
    ...typography.bodySmall,
    color: colors.primary,
    marginTop: 2,
  },
});
