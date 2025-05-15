export interface LineItem {
  id: number;
  name: string;
  product_id: number;
  variation_id: number;
  quantity: number;
  tax_class: string;
  subtotal: string;
  subtotal_tax: string;
  total: string;
  total_tax: string;
  taxes: any[];
  sku: string;
  price: number;
  image?: {
    id: number;
    src: string;
  };
  parent_name: string;
}

export interface BillingAddress {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phone: string;
  email: string;
}

export interface ShippingAddress {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phone: string;
}

export interface Subscription {
  _id: string; // MongoDB ID
  subscription_id: number;
  user_id: number;
  parent_id: number;
  status: string;
  currency: string;
  version: string;
  prices_include_tax: boolean;
  discount_total: string;
  discount_tax: string;
  shipping_total: string;
  shipping_tax: string;
  cart_tax: string;
  total: string;
  total_tax: string;
  customer_id: number;
  order_key: string;
  billing: BillingAddress;
  shipping: ShippingAddress;
  payment_method: string;
  payment_method_title: string;
  customer_ip_address: string;
  customer_user_agent: string;
  created_via: string;
  customer_note: string;
  date_completed: string;
  date_paid: string;
  number: string;
  line_items: LineItem[];
  payment_url: string;
  is_editable: boolean;
  needs_payment: boolean;
  needs_processing: boolean;

  billing_period: string;
  billing_interval: string;
  trial_period: string;
  suspension_count: number;
  requires_manual_renewal: boolean;
  start_date: string;
  trial_end_date: string | null;
  next_payment_date: string | null;
  payment_retry_date: string | null;
  last_payment_date: string | null;
  cancelled_date: string | null;
  end_date: string | null;

  resubscribed_from: string;
  resubscribed_subscription: string;
  removed_line_items: any[];

  created_at: string;
  last_updated: string;
}

export interface SubscriptionStats {
  status: string | null;
  name: string | null;
  expire_date: string | null;
  paid_date: string | null;
  total_price: string | null;
  subscription_id: number | null;
  product_id: number | null;
  allowed_category_ids: number[];
}
