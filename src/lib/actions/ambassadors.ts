"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "./auth-guard";
import { requireAuth } from "./require-auth";

export async function assignAmbassador(userId: string) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("profiles")
    .update({ role: "ambassador" })
    .eq("id", userId);

  if (error) return { error: error.message };

  // Create notification for the user
  await supabase.from("notifications").insert({
    user_id: userId,
    type: "system",
    title: "Ban da duoc chi dinh lam Dai su",
    body: "Chuc mung! Ban da duoc chi dinh lam Dai su chi nhanh.",
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function revokeAmbassador(userId: string) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("profiles")
    .update({ role: "employee" })
    .eq("id", userId);

  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { success: true };
}

export async function getTopAmbassadors(limit = 5) {
  const { supabase } = await requireAuth();

  // Get ambassadors
  const { data: ambassadors } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, branch_id")
    .eq("role", "ambassador")
    .eq("is_active", true);

  if (!ambassadors || ambassadors.length === 0) return [];

  // Get post counts
  const { data: posts } = await supabase
    .from("community_posts")
    .select("user_id")
    .in("user_id", ambassadors.map((a) => a.id));

  const postCounts: Record<string, number> = {};
  for (const post of posts ?? []) {
    postCounts[post.user_id] = (postCounts[post.user_id] ?? 0) + 1;
  }

  return ambassadors
    .map((a) => ({
      id: a.id,
      full_name: a.full_name,
      avatar_url: a.avatar_url,
      post_count: postCounts[a.id] ?? 0,
    }))
    .sort((a, b) => b.post_count - a.post_count)
    .slice(0, limit);
}
