import { useCallback, useState } from 'react';
import { useAtom } from 'jotai';
import { addToastAtom } from '../store';
import { ticketService } from '../services/ticketService';
import { Ticket, CreateTicketRequest, TicketFilters } from '../types/ticket';

export const useTickets = () => {
  const [, addToast] = useAtom(addToastAtom);

  const [filters, setFilters] = useState<TicketFilters>();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTickets = useCallback(
    async (appliedFilters?: TicketFilters, reset = false) => {
      if (loading && !reset && !refreshing) return;

      try {
        setLoading(true);
        const currentPage = reset ? 0 : page + 1;
        const filtersToUse = appliedFilters || filters;

        const response = await ticketService.getTickets({
          ...filtersToUse,
          page: currentPage,
          pageSize: 20,
        });

        if (reset) {
          setTickets(response.data);
          setPage(0);
        } else {
          // Prevent duplicates
          const existingIds = new Set(tickets.map(d => d._id));
          const newTickets = response.data.filter(
            (ticket: Ticket) => !existingIds.has(ticket._id),
          );
          setTickets(prev => [...prev, ...newTickets]);
          setPage(currentPage);
        }

        setHasMore(response.hasMore);
      } catch (error: any) {
        addToast({
          message: error.response?.data?.message || 'Failed to fetch tickets',
          type: 'error',
          duration: 5000,
        });
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [tickets, filters, page, loading, refreshing, setTickets, addToast],
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

  const loadMoreTickets = useCallback(() => {
    if (!loading && hasMore) {
      fetchTickets();
    }
  }, [loading, hasMore, fetchTickets]);

  const refreshTickets = useCallback(
    async (appliedFilters?: TicketFilters) => {
      setRefreshing(true);
      await fetchTickets(appliedFilters || filters, true);
      setRefreshing(false);
    },
    [fetchTickets, filters],
  );

  const applyFilters = useCallback(
    (newFilters: TicketFilters) => {
      setFilters(newFilters);
      fetchTickets(newFilters, true);
    },
    [setFilters, fetchTickets],
  );

  return {
    tickets,
    selectedTicket,
    filters,
    loading,
    refreshing,
    hasMore,
    fetchTickets,
    fetchTicket,
    createTicket,
    addAttachment,
    addComment,
    loadMoreTickets,
    refreshTickets,
    applyFilters,
  };
};
