
-- Create enums for social media
CREATE TYPE public.social_platform AS ENUM ('facebook', 'instagram', 'tiktok', 'youtube');
CREATE TYPE public.social_post_status AS ENUM ('draft', 'scheduled', 'published', 'failed');

-- Create social_media_posts table
CREATE TABLE public.social_media_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  platform social_platform NOT NULL,
  status social_post_status NOT NULL DEFAULT 'draft',
  post_type TEXT NOT NULL DEFAULT 'post',
  image_url TEXT,
  post_url TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  tags TEXT[],
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.social_media_posts ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins and managers can manage social media posts"
  ON public.social_media_posts FOR ALL
  TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role]));

-- Updated_at trigger
CREATE TRIGGER update_social_media_posts_updated_at
  BEFORE UPDATE ON public.social_media_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
