export interface ActivityType {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityTypeCreate {
  name: string;
  description: string;
}

export interface ActivityTypeUpdate {
  name: string;
  description: string;
}