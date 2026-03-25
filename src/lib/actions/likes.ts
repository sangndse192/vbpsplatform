"use server";

import { requireAuth } from "./require-auth";

export async function toggleLike(postId: string) {
  const { supabase, user } = await requireAuth();

  // Check if already liked
  const { data: existing } = await supabase
    .from("likes")
    .select("id")
    .eq("user_id", user.id)
    .eq("target_type", "post")
    .eq("target_id", postId)
    .single();

  if (existing) {
    await supabase.from("likes").delete().eq("id", existing.id);
    return { liked: false };
  }

  const { error } = await supabase.from("likes").insert({
    user_id: user.id,
    target_type: "post",
    target_id: postId,
  });

  if (error) return { error: error.message };
  return { liked: true };
}
