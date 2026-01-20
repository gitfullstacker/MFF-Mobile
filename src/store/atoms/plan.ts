import { atom } from 'jotai';
import { Plan } from '../../types/plan';

export const plansAtom = atom<Plan[]>([]);
export const selectedPlanAtom = atom<Plan | null>(null);
export const activePlanAtom = atom<Plan | null>(null);
export const suggestedPlanAtom = atom<Plan | null>(null);