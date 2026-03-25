-- Search indexes for documents and community posts
-- Using ILIKE for MVP; pg_trgm for scale if available

-- Document search indexes (some may already exist)
CREATE INDEX IF NOT EXISTS idx_documents_created ON documents(created_at DESC);

-- Notifications partial index for unread
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id) WHERE read = false;
