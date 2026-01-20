import { apiClient } from './api';
import { Ticket, CreateTicketRequest } from '../types/ticket';
import { PaginatedResponse } from '../types/common';
import { DownloadFilters } from '@/types/download';

export const ticketService = {
  async getTickets(
    filters?: DownloadFilters,
  ): Promise<PaginatedResponse<Ticket>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    return apiClient.get(`/tickets?${params.toString()}`);
  },

  async getTicket(id: string): Promise<Ticket> {
    return apiClient.get(`/tickets/${id}`);
  },

  async createTicket(data: CreateTicketRequest): Promise<Ticket> {
    return apiClient.post('/tickets', data);
  },

  async addComment(ticketId: string, text: string): Promise<Ticket> {
    return apiClient.post(`/tickets/${ticketId}/comments`, { text });
  },

  async addAttachment(ticketId: string, file: any): Promise<Ticket> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.upload(`/tickets/${ticketId}/attachments`, formData);
  },
};
