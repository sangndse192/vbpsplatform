"use server";

import { requireAuth } from "./require-auth";
import { updateQuizProgress } from "./progress";
import type { QuizAttempt } from "@/lib/supabase/types";

// Fetch quiz questions WITHOUT correct_answer (safe for client)
export async function getQuizQuestions(documentId: string) {
  const { supabase } = await requireAuth();

  const { data, error } = await supabase
    .from("document_quizzes")
    .select("id, document_id, question, options, sort_order, created_at")
    .eq("document_id", documentId)
    .order("sort_order");

  if (error) return { error: error.message };
  return { data: data ?? [] };
}

export async function submitAttempt(
  documentId: string,
  answers: Record<string, number>
) {
  const { supabase, user } = await requireAuth();

  // Fetch correct answers server-side
  const { data: quizzes, error: qError } = await supabase
    .from("document_quizzes")
    .select("id, correct_answer")
    .eq("document_id", documentId);

  if (qError || !quizzes) return { error: qError?.message ?? "No quizzes found" };

  // Validate all questions belong to this document
  const quizIds = new Set(quizzes.map((q) => q.id));
  for (const qId of Object.keys(answers)) {
    if (!quizIds.has(qId)) return { error: "Invalid question ID" };
  }

  // Calculate score
  let score = 0;
  const total = quizzes.length;
  for (const quiz of quizzes) {
    if (answers[quiz.id] === quiz.correct_answer) score++;
  }

  const { data, error } = await supabase
    .from("quiz_attempts")
    .insert({
      user_id: user.id,
      document_id: documentId,
      answers,
      score,
      total,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  // Update progress
  const passed = total > 0 && (score / total) * 100 >= 70;
  await updateQuizProgress(documentId, score, passed);

  return { data: { id: data.id, score, total, passed } };
}

export async function getAttemptResults(attemptId: string) {
  const { supabase, user } = await requireAuth();

  // Only allow viewing own attempts
  const { data: attempt, error } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("id", attemptId)
    .eq("user_id", user.id)
    .single();

  if (error || !attempt) return { error: error?.message ?? "Not found" };

  // Fetch questions with correct answers for review
  const { data: quizzes } = await supabase
    .from("document_quizzes")
    .select("id, question, options, correct_answer, explanation")
    .eq("document_id", attempt.document_id)
    .order("sort_order");

  return {
    data: {
      attempt: attempt as QuizAttempt,
      quizzes: quizzes ?? [],
    },
  };
}

export async function getAttemptHistory(documentId: string) {
  const { supabase, user } = await requireAuth();

  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("id, score, total, completed_at")
    .eq("user_id", user.id)
    .eq("document_id", documentId)
    .order("completed_at", { ascending: false });

  if (error) return { error: error.message };
  return { data: data ?? [] };
}

export async function getBestScore(documentId: string) {
  const { supabase, user } = await requireAuth();

  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("score, total")
    .eq("user_id", user.id)
    .eq("document_id", documentId)
    .order("score", { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data as { score: number; total: number };
}
