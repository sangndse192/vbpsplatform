"use server";

import { requireAuth } from "./require-auth";

export async function globalSearch(query: string) {
  const { supabase } = await requireAuth();

  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return { documents: [], posts: [] };

  const sanitized = trimmed.replace(/[%_\\]/g, "\\$&");
  const pattern = `%${sanitized}%`;

  const [docsResult, postsResult] = await Promise.all([
    supabase
      .from("documents")
      .select("id, title, doc_number, doc_type, status")
      .or(`title.ilike.${pattern},doc_number.ilike.${pattern}`)
      .limit(5),
    supabase
      .from("community_posts")
      .select("id, title, content, tags, user_id")
      .or(`title.ilike.${pattern},content.ilike.${pattern}`)
      .limit(5),
  ]);

  return {
    documents: (docsResult.data ?? []).map((d) => ({
      id: d.id,
      title: d.title,
      doc_number: d.doc_number,
      doc_type: d.doc_type,
      status: d.status,
    })),
    posts: (postsResult.data ?? []).map((p) => ({
      id: p.id,
      title: p.title,
      content_preview: (p.content as string)?.slice(0, 80) ?? "",
      tags: p.tags as string[],
    })),
  };
}
