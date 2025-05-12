export interface Attachment {
  id: string;
  filename: string;
  url: string;
  created_at: string;
}

export interface TicketComment {
  id: string;
  content: string;
  author: string;
  created_at: string;
}

export interface Ticket {
  _id: string;
  user_id: number;
  title: string;
  description: string;
  type: 'bug' | 'feature';
  trello_card_id: string;
  comments: TicketComment[];
  attachments: Attachment[];
  created_at: string;
  updated_at: string;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  type: 'bug' | 'feature';
}
