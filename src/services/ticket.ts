import { apiClient } from './api';
import { Ticket, CreateTicketRequest } from '../types/ticket';
import { PaginatedResponse } from '../types/common';

export const ticketService = {
  async getTickets(
    page = 0,
    pageSize = 20,
    type?: 'bug' | 'feature' | 'all',
  ): Promise<PaginatedResponse<Ticket>> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (type) {
      params.append('type', type);
    }

    return apiClient.get(`/tickets?${params.toString()}`);
  },

  async createTicket(data: CreateTicketRequest): Promise<Ticket> {
    return apiClient.post('/tickets', data);
  },

  async addComment(ticketId: string, content: string): Promise<void> {
    return apiClient.post(`/tickets/${ticketId}/comments`, { content });
  },

  async addAttachment(ticketId: string, file: any): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.upload(`/tickets/${ticketId}/attachments`, formData);
  },
};
