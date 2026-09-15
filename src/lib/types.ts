export interface Post {
  id: number;
  title: string;
  slug: string;
  cover_image: string | null;
  content: string;
  excerpt: string | null;
  category: string;
  status: 'publish' | 'draft';
  views: number;
  created_at: string;
  updated_at?: string;
  tags?: string | null;
  author_name?: string | null;
  cta_text?: string | null;
  cta_url?: string | null;
}

export interface Setting {
  setting_key: string;
  setting_value: string;
}

export interface Comment {
  id: number;
  post_id: number;
  parent_id: number;
  author_name: string;
  author_email: string;
  author_website?: string | null;
  content: string;
  status: 'approved' | 'pending';
  created_at: string;
}

export interface Subscriber {
  id: number;
  email: string;
  created_at: string;
}

export interface User {
  id: number;
  username: string;
  role: string;
  created_at: string;
}
