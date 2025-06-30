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
  trello_card_id: string;
  comments: TicketComment[];
  attachments: Attachment[];
  created_at: string;
  updated_at: string;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  type: string; // Changed from 'bug' | 'feature' to string
}
