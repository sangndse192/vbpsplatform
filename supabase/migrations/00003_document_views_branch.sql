-- Add branch denormalization column to document_views for analytics aggregation
ALTER TABLE document_views ADD COLUMN branch TEXT;

-- Unique daily constraint: one view per user/doc/day
CREATE UNIQUE INDEX idx_doc_views_unique_daily
  ON document_views(document_id, user_id, (viewed_at::date));

CREATE INDEX idx_doc_views_branch ON document_views(branch);
