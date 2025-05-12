import { atom } from 'jotai';
import { MealPlan } from '../../types/plan';

export const mealPlansAtom = atom<MealPlan[]>([]);
export const selectedMealPlanAtom = atom<MealPlan | null>(null);
export const currentWeekPlanAtom = atom<MealPlan | null>(null);
