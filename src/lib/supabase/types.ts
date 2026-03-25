// Generated types placeholder — run `supabase gen types typescript --local` to generate
// For now, define minimal types used across the app

export type UserRole = "admin" | "employee" | "ambassador";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  branch_id: string | null;
  phone: string | null;
  position: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type DocType =
  | "policy"
  | "regulation"
  | "guideline"
  | "circular"
  | "decision"
  | "other";

export type DocStatus = "draft" | "published" | "paused";

export type Document = {
  id: string;
  title: string;
  doc_number: string | null;
  doc_type: DocType;
  status: DocStatus;
  urgency: "normal" | "important" | "urgent";
  target: "all" | "branch" | "department";
  summary: string | null;
  content: string | null;
  ai_summary: Record<string, unknown> | null;
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  issued_date: string | null;
  effective_date: string | null;
  created_by: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DocumentFaq = {
  id: string;
  document_id: string;
  question: string;
  answer: string;
  sort_order: number;
  created_at: string;
};

export type DocumentQuiz = {
  id: string;
  document_id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string | null;
  sort_order: number;
  created_at: string;
};

export type QuizAttempt = {
  id: string;
  user_id: string;
  document_id: string;
  answers: Record<string, number>;
  score: number;
  total: number;
  completed_at: string;
};

export type Comment = {
  id: string;
  document_id: string;
  user_id: string;
  content: string;
  replied_by: string | null;
  replied_at: string | null;
  reply_content: string | null;
  created_at: string;
};

export type UserProgress = {
  id: string;
  user_id: string;
  document_id: string;
  has_read: boolean;
  viewed_faq: boolean;
  sent_feedback: boolean;
  quiz_score: number | null;
  quiz_passed: boolean;
  completed_at: string | null;
  updated_at: string;
};
