import { permission } from "./project";

export interface LoginPayload {
  username: string;
  password: string;
}

export interface User {
  _id: string;
  username: string;
  name?: string;
  email?: string;
  location?: string;
  avatar_url?: string;
}

export interface UserUpdate {
  name?: string;
  email?: string;
  location?: string;
  avatar_url?: string;
}

export interface members {
  user: User;
  permissions: permission[];
}