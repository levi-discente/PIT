export type Role = "free" | "premium";

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface UserUpdate {
  name: string;
  email: string;
  password: string;
}
