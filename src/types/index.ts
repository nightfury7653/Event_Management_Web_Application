export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  created_at: string;
  user_id: string;
  image_url?: string;
  max_attendees: number;
  current_attendees: number;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
}