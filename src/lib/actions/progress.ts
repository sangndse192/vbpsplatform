"use server";

import { requireAuth } from "./require-auth";
import type { UserProgress } from "@/lib/supabase/types";

type ProgressField = "has_read" | "viewed_faq" | "quiz_passed" | "sent_feedback";

export async function getProgress(
  documentId: string
): Promise<UserProgress | null> {
  const { supabase, user } = await requireAuth();

  const { data } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("document_id", documentId)
    .single();

  return data as UserProgress | null;
}

export async function trackProgress(documentId: string, field: ProgressField) {
  const { supabase, user } = await requireAuth();

  // Use upsert to avoid TOCTOU race condition
  const { error } = await supabase
    .from("user_progress")
    .upsert(
      {
        user_id: user.id,
        document_id: documentId,
        [field]: true,
      },
      { onConflict: "user_id,document_id" }
    );

  if (error) return { error: error.message };
  return { success: true };
}

export async function updateQuizProgress(
  documentId: string,
  score: number,
  passed: boolean
) {
  const { supabase, user } = await requireAuth();

  const { data: existing } = await supabase
    .from("user_progress")
    .select("id, quiz_score")
    .eq("user_id", user.id)
    .eq("document_id", documentId)
    .single();

  const updates: Record<string, unknown> = {
    quiz_score: score,
    quiz_passed: passed,
  };

  // Only set completed_at on pass; never clear it on retry fail
  if (passed) updates.completed_at = new Date().toISOString();

  if (existing) {
    // Keep best score
    if (existing.quiz_score !== null && existing.quiz_score > score) {
      updates.quiz_score = existing.quiz_score;
    }
    const { error } = await supabase
      .from("user_progress")
      .update(updates)
      .eq("id", existing.id);

    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("user_progress").insert({
      user_id: user.id,
      document_id: documentId,
      ...updates,
    });

    if (error) return { error: error.message };
  }

  return { success: true };
}

export async function getUserProgressSummary() {
  const { supabase, user } = await requireAuth();

  const { data, error } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  const rows = (data ?? []) as UserProgress[];
  return {
    total: rows.length,
    read: rows.filter((r) => r.has_read).length,
    faq_viewed: rows.filter((r) => r.viewed_faq).length,
    quiz_passed: rows.filter((r) => r.quiz_passed).length,
    feedback_sent: rows.filter((r) => r.sent_feedback).length,
  };
}
