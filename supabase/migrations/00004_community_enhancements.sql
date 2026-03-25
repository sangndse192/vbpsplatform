-- Add images array and tags array to community_posts
ALTER TABLE community_posts ADD COLUMN images TEXT[] DEFAULT '{}';
ALTER TABLE community_posts ADD COLUMN tags TEXT[] DEFAULT '{}';

-- GIN index for tag filtering
CREATE INDEX idx_community_posts_tags ON community_posts USING GIN(tags);

-- Storage bucket for community images
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-images', 'community-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for community images
CREATE POLICY "community_images_auth_upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'community-images');

CREATE POLICY "community_images_public_read"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'community-images');

CREATE POLICY "community_images_own_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'community-images');
