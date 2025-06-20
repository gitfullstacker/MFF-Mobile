import { Ticket } from '@/types/ticket';
import { atom } from 'jotai';

export const ticketsAtom = atom<Ticket[]>([]);
export const selectedTicketAtom = atom<Ticket | null>(null);
