
export interface NewsItem {
  id: string;
  title: string;
  content: string;
  publish_date: string; // ISO string from database
  updated_at: string;   // ISO string from database
  published: boolean;
  image_url?: string;
}
