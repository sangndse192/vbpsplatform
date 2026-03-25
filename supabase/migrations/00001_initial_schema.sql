-- VBSP Platform: Initial Schema
-- 5 enums, 15 tables, triggers, indexes, RLS policies

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('admin', 'employee', 'ambassador');
CREATE TYPE doc_type AS ENUM ('policy', 'regulation', 'guideline', 'circular', 'decision', 'other');
CREATE TYPE doc_status AS ENUM ('draft', 'published', 'paused');
CREATE TYPE urgency_level AS ENUM ('normal', 'important', 'urgent');
CREATE TYPE target_scope AS ENUM ('all', 'branch', 'department');

-- ============================================================
-- TABLES
-- ============================================================

-- 1. Branches
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  city TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Profiles (linked to auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'employee',
  branch_id UUID REFERENCES branches(id),
  phone TEXT,
  position TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_branch ON profiles(branch_id);

-- 3. Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  doc_number TEXT,
  doc_type doc_type NOT NULL DEFAULT 'policy',
  status doc_status NOT NULL DEFAULT 'draft',
  urgency urgency_level NOT NULL DEFAULT 'normal',
  target target_scope NOT NULL DEFAULT 'all',
  summary TEXT,
  content TEXT,
  ai_summary JSONB,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  issued_date DATE,
  effective_date DATE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_type ON documents(doc_type);
CREATE INDEX idx_documents_created_by ON documents(created_by);
CREATE INDEX idx_documents_published_at ON documents(published_at);

-- 4. Document FAQs
CREATE TABLE document_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_document_faqs_doc ON document_faqs(document_id);

-- 5. Document Quizzes
CREATE TABLE document_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- ["A", "B", "C", "D"]
  correct_answer INTEGER NOT NULL, -- index of correct option
  explanation TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_document_quizzes_doc ON document_quizzes(document_id);

-- 6. Quiz Attempts
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  answers JSONB NOT NULL, -- {quiz_id: selected_index}
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_doc ON quiz_attempts(document_id);

-- 7. Comments (on documents)
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  replied_by UUID REFERENCES profiles(id),
  replied_at TIMESTAMPTZ,
  reply_content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_comments_doc ON comments(document_id);
CREATE INDEX idx_comments_user ON comments(user_id);

-- 8. Community Posts
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_community_posts_user ON community_posts(user_id);
CREATE INDEX idx_community_posts_created ON community_posts(created_at DESC);

-- 9. Community Comments
CREATE TABLE community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_community_comments_post ON community_comments(post_id);

-- 10. Likes (polymorphic)
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL, -- 'post' | 'comment'
  target_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, target_type, target_id)
);

CREATE INDEX idx_likes_target ON likes(target_type, target_id);

-- 11. Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT NOT NULL, -- 'document', 'quiz', 'comment', 'community', 'system'
  data JSONB,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);

-- 12. Document Views
CREATE TABLE document_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_document_views_doc ON document_views(document_id);
CREATE INDEX idx_document_views_user ON document_views(user_id);

-- 13. User Progress
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  has_read BOOLEAN NOT NULL DEFAULT false,
  quiz_score INTEGER,
  quiz_passed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, document_id)
);

CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_doc ON user_progress(document_id);

-- ============================================================
-- TRIGGER: Auto-create profile on auth.users insert
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _role user_role := 'employee';
  _raw_role TEXT;
BEGIN
  _raw_role := NEW.raw_user_meta_data->>'role';
  IF _raw_role IS NOT NULL AND _raw_role IN ('admin', 'employee', 'ambassador') THEN
    _role := _raw_role::user_role;
  END IF;

  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    _role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_documents_updated_at
  BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_community_posts_updated_at
  BEFORE UPDATE ON community_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_user_progress_updated_at
  BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- RLS POLICIES
-- ============================================================

ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Branches: all authenticated can read
CREATE POLICY "branches_select" ON branches FOR SELECT TO authenticated USING (true);

-- Profiles: all authenticated can read, own profile update
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- Documents: admin full access, employee/ambassador see published only
CREATE POLICY "documents_admin_all" ON documents FOR ALL TO authenticated
  USING (get_user_role() = 'admin');
CREATE POLICY "documents_employee_select" ON documents FOR SELECT TO authenticated
  USING (status = 'published' AND get_user_role() IN ('employee', 'ambassador'));

-- Document FAQs: admin full access, authenticated read
CREATE POLICY "faqs_admin_all" ON document_faqs FOR ALL TO authenticated
  USING (get_user_role() = 'admin');
CREATE POLICY "faqs_select" ON document_faqs FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM documents WHERE documents.id = document_faqs.document_id
    AND (documents.status = 'published' OR get_user_role() = 'admin')
  ));

-- Document Quizzes: admin full access, authenticated read published
CREATE POLICY "quizzes_admin_all" ON document_quizzes FOR ALL TO authenticated
  USING (get_user_role() = 'admin');
CREATE POLICY "quizzes_select" ON document_quizzes FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM documents WHERE documents.id = document_quizzes.document_id
    AND (documents.status = 'published' OR get_user_role() = 'admin')
  ));

-- Quiz Attempts: own insert/select, admin can select all
CREATE POLICY "quiz_attempts_insert" ON quiz_attempts FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "quiz_attempts_select_own" ON quiz_attempts FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR get_user_role() = 'admin');

-- Comments: authenticated read, own insert, admin can reply
CREATE POLICY "comments_select" ON comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "comments_insert" ON comments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "comments_update_admin" ON comments FOR UPDATE TO authenticated
  USING (get_user_role() = 'admin');

-- Community Posts: authenticated read, own insert/update/delete
CREATE POLICY "posts_select" ON community_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "posts_insert" ON community_posts FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "posts_update_own" ON community_posts FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "posts_delete_own" ON community_posts FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Community Comments: authenticated read, own insert/update/delete
CREATE POLICY "community_comments_select" ON community_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "community_comments_insert" ON community_comments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "community_comments_update_own" ON community_comments FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "community_comments_delete_own" ON community_comments FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Likes: own insert/delete, authenticated read
CREATE POLICY "likes_select" ON likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "likes_insert" ON likes FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "likes_delete_own" ON likes FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Notifications: own only
CREATE POLICY "notifications_select" ON notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "notifications_update" ON notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Document Views: own insert/select
CREATE POLICY "views_insert" ON document_views FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "views_select" ON document_views FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR get_user_role() = 'admin');

-- User Progress: own insert/update/select
CREATE POLICY "progress_select" ON user_progress FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR get_user_role() = 'admin');
CREATE POLICY "progress_insert" ON user_progress FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "progress_update" ON user_progress FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- STORAGE BUCKET
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false);

CREATE POLICY "documents_bucket_admin_upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents' AND get_user_role() = 'admin');

CREATE POLICY "documents_bucket_admin_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'documents' AND get_user_role() = 'admin');

CREATE POLICY "documents_bucket_auth_download"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'documents');
