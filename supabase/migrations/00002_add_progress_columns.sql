-- Add viewed_faq and sent_feedback tracking to user_progress
ALTER TABLE user_progress ADD COLUMN viewed_faq BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE user_progress ADD COLUMN sent_feedback BOOLEAN NOT NULL DEFAULT false;
