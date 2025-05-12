import { atom } from 'jotai';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export const toastsAtom = atom<Toast[]>([]);
export const isLoadingAtom = atom(false);
export const isDarkModeAtom = atom(false);

// Toast actions
export const addToastAtom = atom(null, (get, set, toast: Omit<Toast, 'id'>) => {
  const id = Math.random().toString(36).substr(2, 9);
  const newToast = { ...toast, id };
  set(toastsAtom, [...get(toastsAtom), newToast]);

  // Auto-remove toast after duration
  if (toast.duration) {
    setTimeout(() => {
      set(removeToastAtom, id);
    }, toast.duration);
  }
});

export const removeToastAtom = atom(null, (get, set, toastId: string) => {
  set(
    toastsAtom,
    get(toastsAtom).filter(toast => toast.id !== toastId),
  );
});
