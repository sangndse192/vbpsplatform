"use server";

import { requireAdmin } from "./auth-guard";

export async function getDashboardStats() {
  const { supabase } = await requireAdmin();

  const [docs, views, comments, branches] = await Promise.all([
    supabase.from("documents").select("id", { count: "exact", head: true }),
    supabase.from("document_views").select("id", { count: "exact", head: true }),
    supabase.from("comments").select("id", { count: "exact", head: true }),
    supabase.from("branches").select("id", { count: "exact", head: true }),
  ]);

  return {
    totalDocs: docs.count ?? 0,
    totalViews: views.count ?? 0,
    totalComments: comments.count ?? 0,
    branchCount: branches.count ?? 0,
  };
}

export async function getBranchViewCounts() {
  const { supabase } = await requireAdmin();

  // Use raw RPC or manual aggregation since Supabase JS doesn't support GROUP BY
  const { data, error } = await supabase
    .from("document_views")
    .select("branch");

  if (error || !data) return [];

  // Aggregate in JS
  const counts: Record<string, number> = {};
  for (const row of data) {
    const branch = (row.branch as string) || "Khong xac dinh";
    counts[branch] = (counts[branch] ?? 0) + 1;
  }

  return Object.entries(counts)
    .map(([branch, views]) => ({ branch, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 15);
}

export async function getLatestDocuments(limit = 4) {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("documents")
    .select("id, title, doc_number, status, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return data ?? [];
}

export async function getDocumentAnalytics(documentId: string) {
  const { supabase } = await requireAdmin();

  // Views by branch for this document
  const { data: viewsData } = await supabase
    .from("document_views")
    .select("branch")
    .eq("document_id", documentId);

  const viewsByBranch: Record<string, number> = {};
  for (const row of viewsData ?? []) {
    const branch = (row.branch as string) || "Khong xac dinh";
    viewsByBranch[branch] = (viewsByBranch[branch] ?? 0) + 1;
  }

  const branchViews = Object.entries(viewsByBranch)
    .map(([branch, views]) => ({ branch, views }))
    .sort((a, b) => b.views - a.views);

  // Quiz completion rate
  const [viewUsers, quizUsers] = await Promise.all([
    supabase
      .from("document_views")
      .select("user_id")
      .eq("document_id", documentId),
    supabase
      .from("quiz_attempts")
      .select("user_id")
      .eq("document_id", documentId),
  ]);

  const uniqueViewers = new Set((viewUsers.data ?? []).map((r) => r.user_id)).size;
  const uniqueQuizTakers = new Set((quizUsers.data ?? []).map((r) => r.user_id)).size;
  const quizCompletionRate = uniqueViewers > 0 ? Math.round((uniqueQuizTakers / uniqueViewers) * 100) : 0;

  return { viewsByBranch: branchViews, quizCompletionRate, totalViews: viewsData?.length ?? 0 };
}
