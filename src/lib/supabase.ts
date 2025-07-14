import { createClient } from '@supabase/supabase-js';

// For personal use - replace with your actual values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL_HERE';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY_HERE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Post {
  id: number;
  title: string;
  content: string;
  category: 'lore' | 'ingame' | 'powerscaling' | 'blog';
  created_at: string;
  updated_at: string;
}

export interface PostImage {
  id: number;
  post_id: number;
  filename: string;
  alt_text: string | null;
  position: number;
  created_at: string;
  storage_path: string;
  public_url: string;
}