"use server";

import { requireAuth } from "./require-auth";

export async function createCommunityComment(postId: string, content: string) {
  const { supabase, user } = await requireAuth();

  const text = content.trim().slice(0, 500);
  if (!text) return { error: "Noi dung khong duoc de trong" };

  const { data, error } = await supabase
    .from("community_comments")
    .insert({
      post_id: postId,
      user_id: user.id,
      content: text,
    })
    .select(
      `
      *,
      author:profiles!community_comments_user_id_fkey(
        full_name, avatar_url, role
      )
    `
    )
    .single();

  if (error) return { error: error.message };
  return { data };
}

export async function getCommunityComments(postId: string) {
  const { supabase } = await requireAuth();

  const { data, error } = await supabase
    .from("community_comments")
    .select(
      `
      *,
      author:profiles!community_comments_user_id_fkey(
        full_name, avatar_url, role
      )
    `
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) return { error: error.message };
  return { data: data ?? [] };
}
