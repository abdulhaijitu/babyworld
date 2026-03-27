import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type SocialPlatform = 'facebook' | 'instagram' | 'tiktok' | 'youtube';
export type SocialPostStatus = 'draft' | 'scheduled' | 'published' | 'failed';

export interface SocialMediaPost {
  id: string;
  title: string;
  content: string;
  platform: SocialPlatform;
  status: SocialPostStatus;
  post_type: string;
  image_url: string | null;
  post_url: string | null;
  scheduled_at: string | null;
  published_at: string | null;
  notes: string | null;
  tags: string[] | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type SocialMediaPostInsert = Omit<SocialMediaPost, 'id' | 'created_at' | 'updated_at'>;

export function useSocialMediaPosts(statusFilter?: SocialPostStatus | 'all', platformFilter?: SocialPlatform | 'all') {
  return useQuery({
    queryKey: ['social-media-posts', statusFilter, platformFilter],
    queryFn: async () => {
      let query = supabase
        .from('social_media_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (platformFilter && platformFilter !== 'all') {
        query = query.eq('platform', platformFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SocialMediaPost[];
    },
  });
}

export function useCreateSocialMediaPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (post: SocialMediaPostInsert) => {
      const { data, error } = await supabase
        .from('social_media_posts')
        .insert(post as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-media-posts'] });
      toast.success('Post created');
    },
    onError: (error: any) => {
      toast.error('Failed to create post: ' + error.message);
    },
  });
}

export function useUpdateSocialMediaPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SocialMediaPostInsert> }) => {
      const { data, error } = await supabase
        .from('social_media_posts')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-media-posts'] });
      toast.success('Post updated');
    },
    onError: (error: any) => {
      toast.error('Update failed: ' + error.message);
    },
  });
}

export function useDeleteSocialMediaPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('social_media_posts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-media-posts'] });
      toast.success('Post deleted');
    },
    onError: (error: any) => {
      toast.error('Delete failed: ' + error.message);
    },
  });
}
