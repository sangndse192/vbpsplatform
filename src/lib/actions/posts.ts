"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "./require-auth";

export async function createPost(input: {
  title?: string;
  content: string;
  images?: string[];
  tags?: string[];
}) {
  const { supabase, user } = await requireAuth();

  const content = input.content.trim();
  if (!content) return { error: "Noi dung khong duoc de trong" };

  const { data, error } = await supabase
    .from("community_posts")
    .insert({
      user_id: user.id,
      title: input.title?.trim() || "",
      content,
      images: input.images ?? [],
      tags: input.tags ?? [],
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/admin/community");
  revalidatePath("/employee/community");
  return { data };
}

export async function getPosts(options: {
  page?: number;
  limit?: number;
  tag?: string;
}) {
  const { supabase, user } = await requireAuth();
  const { page = 0, limit = 10, tag } = options;
  const offset = page * limit;

  let query = supabase
    .from("community_posts")
    .select(
      `
      *,
      author:profiles!community_posts_user_id_fkey(
        id, full_name, avatar_url, role, branch_id
      )
    `
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit);

  if (tag) {
    query = query.contains("tags", [tag]);
  }

  const { data: posts, error } = await query;
  if (error) return { error: error.message };

  // Get like counts and user's liked status for each post
  const postIds = (posts ?? []).map((p) => p.id);

  const [likeCounts, userLikes, commentCounts] = await Promise.all([
    supabase
      .from("likes")
      .select("target_id")
      .eq("target_type", "post")
      .in("target_id", postIds.length > 0 ? postIds : ["__none__"]),
    supabase
      .from("likes")
      .select("target_id")
      .eq("target_type", "post")
      .eq("user_id", user.id)
      .in("target_id", postIds.length > 0 ? postIds : ["__none__"]),
    supabase
      .from("community_comments")
      .select("post_id")
      .in("post_id", postIds.length > 0 ? postIds : ["__none__"]),
  ]);

  // Aggregate counts
  const likeCountMap: Record<string, number> = {};
  for (const row of likeCounts.data ?? []) {
    likeCountMap[row.target_id] = (likeCountMap[row.target_id] ?? 0) + 1;
  }

  const userLikedSet = new Set((userLikes.data ?? []).map((r) => r.target_id));

  const commentCountMap: Record<string, number> = {};
  for (const row of commentCounts.data ?? []) {
    commentCountMap[row.post_id] = (commentCountMap[row.post_id] ?? 0) + 1;
  }

  const enrichedPosts = (posts ?? []).map((post) => ({
    ...post,
    like_count: likeCountMap[post.id] ?? 0,
    comment_count: commentCountMap[post.id] ?? 0,
    user_has_liked: userLikedSet.has(post.id),
  }));

  return {
    data: enrichedPosts,
    hasMore: (posts ?? []).length > limit,
  };
}

export async function deletePost(postId: string) {
  const { supabase, user } = await requireAuth();

  // Verify ownership
  const { data: post } = await supabase
    .from("community_posts")
    .select("user_id")
    .eq("id", postId)
    .single();

  if (!post || post.user_id !== user.id) return { error: "Khong co quyen xoa" };

  const { error } = await supabase.from("community_posts").delete().eq("id", postId);
  if (error) return { error: error.message };

  revalidatePath("/admin/community");
  revalidatePath("/employee/community");
  return { success: true };
}

export async function getCommunityStats() {
  const { supabase } = await requireAuth();

  const today = new Date().toISOString().slice(0, 10);

  const [totalPosts, totalMembers, postsToday] = await Promise.all([
    supabase.from("community_posts").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase
      .from("community_posts")
      .select("id", { count: "exact", head: true })
      .gte("created_at", `${today}T00:00:00Z`),
  ]);

  return {
    totalPosts: totalPosts.count ?? 0,
    totalMembers: totalMembers.count ?? 0,
    postsToday: postsToday.count ?? 0,
  };
}

export async function getPopularTags() {
  const { supabase } = await requireAuth();

  const { data } = await supabase
    .from("community_posts")
    .select("tags")
    .order("created_at", { ascending: false })
    .limit(100);

  const tagCounts: Record<string, number> = {};
  for (const post of data ?? []) {
    for (const tag of (post.tags as string[]) ?? []) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
  }

  return Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}
