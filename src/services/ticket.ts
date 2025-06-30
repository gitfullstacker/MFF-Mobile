import { apiClient } from './api';
import { Ticket, CreateTicketRequest } from '../types/ticket';
import { PaginatedResponse } from '../types/common';

export const ticketService = {
  async getTickets(
    page = 0,
    pageSize = 20,
    type?: 'bug' | 'feature' | 'all',
    search?: string,
  ): Promise<PaginatedResponse<Ticket>> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    // Add type filter if specified and not 'all'
    if (type && type !== 'all') {
      params.append('type', type);
    } else {
      // Send 'all' explicitly to match backend DTO default
      params.append('type', 'all');
    }

    // Add search parameter if provided
    if (search && search.trim()) {
      params.append('search', search.trim());
    }

    return apiClient.get(`/tickets?${params.toString()}`);
  },

  async getTicket(id: string): Promise<Ticket> {
    return apiClient.get(`/tickets/${id}`);
  },

  async createTicket(data: CreateTicketRequest): Promise<Ticket> {
    return apiClient.post('/tickets', data);
  },

  async addComment(ticketId: string, content: string): Promise<Ticket> {
    return apiClient.post(`/tickets/${ticketId}/comments`, { content });
  },

  async addAttachment(ticketId: string, file: any): Promise<Ticket> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.upload(`/tickets/${ticketId}/attachments`, formData);
  },
};
