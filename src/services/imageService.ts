import { supabase } from '../lib/supabase';
import type { PostImage } from '../lib/supabase';

export const imageService = {
  // Upload image to Supabase Storage
  async uploadImage(file: File, postId: number = 0, altText?: string): Promise<PostImage> {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${postId || 'general'}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Failed to upload image');
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(filePath);

      // Save image metadata to database
      const { data: imageData, error: dbError } = await supabase
        .from('post_images')
        .insert([{
          post_id: postId || 0,
          filename: fileName,
          alt_text: altText || '',
          position: 0,
          storage_path: filePath,
          public_url: publicUrl
        }])
        .select()
        .single();

      if (dbError) {
        // If database insert fails, clean up the uploaded file
        await supabase.storage
          .from('post-images')
          .remove([filePath]);
        
        console.error('Database error:', dbError);
        throw new Error('Failed to save image metadata');
      }

      return imageData;
    } catch (error) {
      console.error('Error in uploadImage:', error);
      throw error;
    }
  },

  // Get images for a post
  async getPostImages(postId: number): Promise<PostImage[]> {
    const { data, error } = await supabase
      .from('post_images')
      .select('*')
      .eq('post_id', postId)
      .order('position');

    if (error) {
      console.error('Error fetching images:', error);
      throw new Error('Failed to fetch images');
    }

    return data || [];
  },

  // Delete image
  async deleteImage(imageId: number): Promise<void> {
    // Get image info first
    const { data: image, error: fetchError } = await supabase
      .from('post_images')
      .select('storage_path')
      .eq('id', imageId)
      .single();

    if (fetchError) {
      console.error('Error fetching image:', fetchError);
      throw new Error('Failed to fetch image');
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('post-images')
      .remove([image.storage_path]);

    if (storageError) {
      console.error('Error deleting from storage:', storageError);
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('post_images')
      .delete()
      .eq('id', imageId);

    if (dbError) {
      console.error('Error deleting from database:', dbError);
      throw new Error('Failed to delete image');
    }
  }
};