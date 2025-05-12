export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  avatar_url?: string;
}

export interface LoginResponse {
  token: string;
  wp_token?: string;
  is_migrated: boolean;
  user: User;
}

export interface LoginRequest {
  username: string;
  password: string;
}
