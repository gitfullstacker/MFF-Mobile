import { RecipeFilters } from '@/types';

export const getFilterCount = (filters: RecipeFilters) => {
  let count = 0;
  Object.entries(filters).forEach(([key, value]) => {
    if (
      key !== 'search' &&
      value !== undefined &&
      value !== null &&
      value !== '' &&
      value !== 'newest'
    ) {
      count++;
    }
  });
  return count;
};
