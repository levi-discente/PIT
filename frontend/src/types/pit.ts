export interface Pit {
  id: number;
  user_id: number;
  semester: string;
  description: string;
  year: string;
  created_at: string;
  updated_at: string;
}

export interface PitCreate {
  user_id: number;
  semester: string;
  description: string;
  year: string;
}

export interface PitUpdate {
  semester: string;
  description: string;
  year: string;
  updated_at: string;
}