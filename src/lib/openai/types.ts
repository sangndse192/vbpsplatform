export interface AISummary {
  why_this_matters: string;
  who_is_affected: string;
  key_points: string[];
  processing_status: "pending" | "completed" | "failed";
  processed_at: string | null;
  error?: string;
}

export interface AIFaqSuggestion {
  question: string;
  answer: string;
}

export interface AIQuizSuggestion {
  question: string;
  options: [string, string, string, string];
  correct_answer_index: 0 | 1 | 2 | 3;
}

export interface AIProcessingResult {
  summary: AISummary;
  faqs: AIFaqSuggestion[];
  quizzes: AIQuizSuggestion[];
}
