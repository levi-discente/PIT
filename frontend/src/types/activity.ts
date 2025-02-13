export interface Activity {
  id: number;
  pit_id: number;
  activity_type_id: number;
  name: string;
  description: string;
  hours: number;
  created_at: string;
  updated_at: string;
}

export interface ActivityCreate {
  pit_id: number;
  activity_type_id: number;
  name: string;
  description: string;
  hours: number;
}

export interface ActivityUpdate {
  pit_id: number;
  activity_type_id: number;
  name: string;
  description: string;
  hours: number;
}