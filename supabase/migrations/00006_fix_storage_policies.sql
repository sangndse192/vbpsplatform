-- Fix: Add missing UPDATE policy for storage.objects (needed for upsert uploads)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'documents_bucket_admin_update' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "documents_bucket_admin_update"
      ON storage.objects FOR UPDATE TO authenticated
      USING (bucket_id = 'documents' AND get_user_role() = 'admin');
  END IF;
END $$;

-- Add community-images bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-images', 'community-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for community-images bucket (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'community_images_auth_upload' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "community_images_auth_upload"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'community-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'community_images_public_read' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "community_images_public_read"
      ON storage.objects FOR SELECT TO authenticated
      USING (bucket_id = 'community-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'community_images_owner_delete' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "community_images_owner_delete"
      ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'community-images' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
END $$;
