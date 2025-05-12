export interface LineItem {
  id: number;
  product_id: number;
  name: string;
  quantity: number;
  subtotal: string;
  total: string;
}

export interface Subscription {
  subscription_id: number;
  user_id: number;
  status: 'active' | 'cancelled' | 'expired' | 'on-hold' | 'pending';
  start_date: string;
  end_date: string;
  next_payment_date: string;
  billing_period: string;
  billing_interval: string;
  total: string;
  line_items: LineItem[];
}

export interface SubscriptionStats {
  status: string;
  name: string;
  expire_date: string;
  paid_date: string;
  total_price: string;
  subscription_id: number;
  product_id: number;
  allowed_category_ids: number[];
}
