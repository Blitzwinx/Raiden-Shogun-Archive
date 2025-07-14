import { supabase } from '../lib/supabase';
import type { Post } from '../lib/supabase';

export const postService = {
  // Get all posts or filter by category
  async getPosts(category?: string): Promise<Post[]> {
    let query = supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching posts:', error);
      console.warn('Using offline mode or check your connection');
      return [];
    }
    
    return data || [];
  },

  // Get single post by ID
  async getPost(id: number): Promise<Post | null> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Post not found
      }
      console.error('Error fetching post:', error);
      console.warn('Could not fetch post');
      return null;
    }

    return data;
  },

  // Create new post
  async createPost(post: Omit<Post, 'id' | 'created_at' | 'updated_at'>): Promise<Post> {
    const { data, error } = await supabase
      .from('posts')
      .insert([post])
      .select()
      .single();

    if (error) {
      console.error('Error creating post:', error);
      alert('Could not create post - check connection');
      throw error;
    }

    return data;
  },

  // Update post
  async updatePost(id: number, post: Partial<Omit<Post, 'id' | 'created_at' | 'updated_at'>>): Promise<Post> {
    const { data, error } = await supabase
      .from('posts')
      .update({ ...post, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating post:', error);
      alert('Could not update post - check connection');
      throw error;
    }

    return data;
  },

  // Delete post
  async deletePost(id: number): Promise<void> {
    // First delete associated images from storage
    const { data: images } = await supabase
      .from('post_images')
      .select('storage_path')
      .eq('post_id', id);

    if (images && images.length > 0) {
      const filePaths = images.map(img => img.storage_path);
      await supabase.storage
        .from('post-images')
        .remove(filePaths);
    }

    // Delete the post (images will be deleted via CASCADE)
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting post:', error);
      alert('Could not delete post - check connection');
    }
  }
};