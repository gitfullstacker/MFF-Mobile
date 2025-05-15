export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}

export interface Address {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  postcode: string;
  country: string;
  state: string;
  phone: string;
}

export interface BillingAddress extends Address {
  email: string;
}

export interface UserProfile {
  _id?: string; // MongoDB ID
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  avatar_url: string;
  billing: BillingAddress;
  shipping: Address;
  created_at?: string;
  updated_at?: string;
  full_name?: string; // Virtual property
}
