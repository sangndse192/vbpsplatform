"use server";

import { requireAuth } from "./require-auth";

export async function getNotifications(limit = 50) {
  const { supabase, user } = await requireAuth();

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return { error: error.message };
  return { data: data ?? [] };
}

export async function getUnreadCount() {
  const { supabase, user } = await requireAuth();

  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("read", false);

  if (error) return 0;
  return count ?? 0;
}

export async function markAsRead(notificationId: string) {
  const { supabase, user } = await requireAuth();

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function markAllAsRead() {
  const { supabase, user } = await requireAuth();

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false);

  if (error) return { error: error.message };
  return { success: true };
}

export async function createNotification(input: {
  userId: string;
  type: string;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
}) {
  const { supabase } = await requireAuth();

  const { error } = await supabase.from("notifications").insert({
    user_id: input.userId,
    type: input.type,
    title: input.title,
    body: input.body,
    data: input.data,
  });

  if (error) return { error: error.message };
  return { success: true };
}
