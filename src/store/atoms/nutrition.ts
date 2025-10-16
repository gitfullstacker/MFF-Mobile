import { atom } from 'jotai';
import { NutritionProfile } from '../../types/nutrition';

export const nutritionProfileAtom = atom<NutritionProfile | null>(null);
