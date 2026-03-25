"use server";

import { requireAuth } from "./require-auth";

export async function trackView(documentId: string) {
  const { supabase, user } = await requireAuth();

  // Deduplicate: one view per user per doc per day
  const today = new Date().toISOString().slice(0, 10);
  const { count } = await supabase
    .from("document_views")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("document_id", documentId)
    .gte("viewed_at", `${today}T00:00:00Z`);

  if ((count ?? 0) > 0) return { success: true, deduplicated: true };

  const { error } = await supabase
    .from("document_views")
    .insert({ user_id: user.id, document_id: documentId });

  if (error) return { error: error.message };
  return { success: true };
}

export async function getViewCount(documentId: string) {
  const { supabase } = await requireAuth();

  const [total, unique] = await Promise.all([
    supabase
      .from("document_views")
      .select("id", { count: "exact", head: true })
      .eq("document_id", documentId),
    supabase
      .from("document_views")
      .select("user_id", { count: "exact", head: true })
      .eq("document_id", documentId),
  ]);

  return {
    total: total.count ?? 0,
    unique: unique.count ?? 0,
  };
}
