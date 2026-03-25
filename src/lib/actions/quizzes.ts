"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "./auth-guard";
import { quizSchema } from "@/lib/validations/quiz";
import type { QuizInput } from "@/lib/validations/quiz";

export async function createQuiz(documentId: string, input: QuizInput) {
  const { supabase } = await requireAdmin();
  const parsed = quizSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { count } = await supabase
    .from("document_quizzes")
    .select("id", { count: "exact", head: true })
    .eq("document_id", documentId);

  const { data, error } = await supabase
    .from("document_quizzes")
    .insert({
      document_id: documentId,
      ...parsed.data,
      sort_order: parsed.data.sort_order ?? (count ?? 0),
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath(`/admin/docs/${documentId}`);
  return { data };
}

export async function updateQuiz(id: string, documentId: string, input: QuizInput) {
  const { supabase } = await requireAdmin();
  const parsed = quizSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { error } = await supabase
    .from("document_quizzes")
    .update(parsed.data)
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath(`/admin/docs/${documentId}`);
  return { success: true };
}

export async function deleteQuiz(id: string, documentId: string) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("document_quizzes").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/admin/docs/${documentId}`);
  return { success: true };
}

export async function getQuizzesByDocument(documentId: string) {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("document_quizzes")
    .select("*")
    .eq("document_id", documentId)
    .order("sort_order");

  if (error) return { error: error.message };
  return { data: data ?? [] };
}
