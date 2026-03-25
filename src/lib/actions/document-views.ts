"use server";

import { requireAuth } from "./require-auth";

export async function trackView(documentId: string) {
  const { supabase, user } = await requireAuth();

  // Get user's branch name for analytics denormalization
  const { data: profile } = await supabase
    .from("profiles")
    .select("branch_id")
    .eq("id", user.id)
    .single();

  let branchName: string | null = null;
  if (profile?.branch_id) {
    const { data: branch } = await supabase
      .from("branches")
      .select("name")
      .eq("id", profile.branch_id)
      .single();
    branchName = branch?.name ?? null;
  }

  // Insert with ON CONFLICT DO NOTHING via unique daily index
  const { error } = await supabase
    .from("document_views")
    .insert({
      user_id: user.id,
      document_id: documentId,
      branch: branchName,
    });

  // Duplicate key error means already tracked today — not an error
  if (error && !error.message.includes("duplicate")) return { error: error.message };
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
