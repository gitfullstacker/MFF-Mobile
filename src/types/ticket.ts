export type PlatformType = 'web' | 'ios' | 'android';

export interface Attachment {
  url: string;
  name?: string;
  created_at?: string;
}

export interface TicketComment {
  text: string;
  trello_comment_id?: string;
  created_at?: string;
  is_support: boolean;
  is_read: boolean;
}

export interface Ticket {
  _id: string;
  user_id: number;
  title: string;
  description: string;
  type: string; // Changed from 'bug' | 'feature' to string for flexibility
  platforms: PlatformType[];
  trello_card_id: string;
  comments: TicketComment[];
  attachments: Attachment[];
  created_at: string;
  updated_at: string;
  unread_support_comments?: number;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  type: string; // Changed from 'bug' | 'feature' to string
  platforms: PlatformType[];
}

export interface TicketFilters {
  type?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}
