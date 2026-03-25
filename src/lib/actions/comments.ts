"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "./require-auth";
import { trackProgress } from "./progress";

export async function createComment(documentId: string, text: string) {
  const { supabase, user } = await requireAuth();

  const sanitized = text.trim().slice(0, 500);
  if (!sanitized) return { error: "Noi dung khong duoc de trong" };

  const { data, error } = await supabase
    .from("comments")
    .insert({
      document_id: documentId,
      user_id: user.id,
      content: sanitized,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  await trackProgress(documentId, "sent_feedback");
  revalidatePath(`/employee/docs/${documentId}`);
  return { data };
}

export async function getCommentsByDocument(documentId: string) {
  const { supabase } = await requireAuth();

  const { data, error } = await supabase
    .from("comments")
    .select(
      `
      *,
      user:profiles!comments_user_id_fkey(full_name, avatar_url, branch_id),
      replier:profiles!comments_replied_by_fkey(full_name)
    `
    )
    .eq("document_id", documentId)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };
  return { data: data ?? [] };
}

export async function getCommentCount(documentId: string) {
  const { supabase } = await requireAuth();

  const { count, error } = await supabase
    .from("comments")
    .select("id", { count: "exact", head: true })
    .eq("document_id", documentId);

  if (error) return 0;
  return count ?? 0;
}
