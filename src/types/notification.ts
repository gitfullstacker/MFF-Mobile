export interface Notification {
  _id: string;
  title: string;
  body?: string;
  message?: string;
  link: string;
  mobile_link: string;
  image_url?: string;
  is_subscriber_only?: boolean;
  push_sent?: boolean;
  user_id: string;
  is_read: boolean;
  created_at: Date;
  updated_at?: Date;
}

export interface NotificationFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  unreadOnly?: boolean;
}

/**
 * The data payload received in a push notification from FCM.
 */
export interface PushNotificationData {
  link?: string;
  mobile_link?: string;
  notification_id?: string;
  klaviyo_flow_id?: string;
}
