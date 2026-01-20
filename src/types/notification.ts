export interface Notification {
  _id: string;
  title: string;
  message?: string;
  link: string;
  mobile_link: string;
  user_id: string;
  is_read: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface NotificationFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  unreadOnly?: boolean;
}
