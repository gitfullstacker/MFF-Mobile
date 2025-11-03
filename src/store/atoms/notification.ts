import { atom } from 'jotai';
import { Notification } from '../../types/notification';

export const notificationsAtom = atom<Notification[]>([]);
export const selectedNotificationAtom = atom<Notification | null>(null);
export const unreadCountAtom = atom<number>(0);
