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
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

export interface UserProfile {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  avatar_url?: string;
  billing: Address;
  shipping: Address;
  created_at: string;
  updated_at: string;
}
