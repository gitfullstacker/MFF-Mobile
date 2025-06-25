import { User } from './user';

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
