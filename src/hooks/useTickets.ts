import { useCallback, useState } from 'react';
import { useAtom } from 'jotai';
import { addToastAtom } from '../store';
import { ticketService } from '../services/ticket';
import { Ticket, CreateTicketRequest } from '../types/ticket';

export const useTickets = () => {
  const [, addToast] = useAtom(addToastAtom);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTickets = useCallback(
    async (page = 0, pageSize = 20, type?: string, search?: string) => {
      try {
        setLoading(true);
        const response = await ticketService.getTickets(
          page,
          pageSize,
          type,
          search,
        );

        if (page === 0) {
          setTickets(response.data);
        } else {
          setTickets(prev => [...prev, ...response.data]);
        }

        return response;
      } catch (error: any) {
        addToast({
          message: error.response?.data?.message || 'Failed to fetch tickets',
          type: 'error',
          duration: 5000,
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [addToast],
  );

  const fetchTicket = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        const ticket = await ticketService.getTicket(id);
        setSelectedTicket(ticket);
        return ticket;
      } catch (error: any) {
        addToast({
          message: error.response?.data?.message || 'Failed to fetch ticket',
          type: 'error',
          duration: 5000,
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [addToast],
  );

  const createTicket = useCallback(
    async (data: CreateTicketRequest) => {
      try {
        setLoading(true);
        const newTicket = await ticketService.createTicket(data);
        setTickets(prev => [newTicket, ...prev]);

        addToast({
          message: 'Support ticket created successfully!',
          type: 'success',
          duration: 3000,
        });

        return newTicket;
      } catch (error: any) {
        addToast({
          message: error.response?.data?.message || 'Failed to create ticket',
          type: 'error',
          duration: 5000,
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [addToast],
  );

  const addAttachment = useCallback(
    async (ticketId: string, file: any) => {
      try {
        await ticketService.addAttachment(ticketId, file);

        addToast({
          message: 'Attachment added successfully',
          type: 'success',
          duration: 3000,
        });
      } catch (error: any) {
        addToast({
          message: error.response?.data?.message || 'Failed to add attachment',
          type: 'error',
          duration: 5000,
        });
        throw error;
      }
    },
    [addToast],
  );

  const addComment = useCallback(
    async (ticketId: string, text: string) => {
      try {
        // Changed parameter name from 'content' to 'text' to match backend
        const updatedTicket = await ticketService.addComment(ticketId, text);

        // Update the selected ticket if it matches
        if (selectedTicket?._id === ticketId) {
          setSelectedTicket(updatedTicket);
        }

        // Update the ticket in the tickets list as well
        setTickets(prev =>
          prev.map(ticket =>
            ticket._id === ticketId ? updatedTicket : ticket,
          ),
        );

        addToast({
          message: 'Comment added successfully',
          type: 'success',
          duration: 3000,
        });

        return updatedTicket;
      } catch (error: any) {
        addToast({
          message: error.response?.data?.message || 'Failed to add comment',
          type: 'error',
          duration: 5000,
        });
        throw error;
      }
    },
    [selectedTicket, addToast],
  );

  const refreshTickets = useCallback(() => {
    setTickets([]);
  }, []);

  return {
    tickets,
    selectedTicket,
    loading,
    fetchTickets,
    fetchTicket,
    createTicket,
    addAttachment,
    addComment,
    refreshTickets,
  };
};
