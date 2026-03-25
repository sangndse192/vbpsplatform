"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "./auth-guard";
import { createDocumentSchema, updateDocumentSchema } from "@/lib/validations/document";
import type { CreateDocumentInput, UpdateDocumentInput } from "@/lib/validations/document";
import type { DocStatus } from "@/lib/supabase/types";

export async function createDocument(input: CreateDocumentInput) {
  const { supabase, user } = await requireAdmin();
  const parsed = createDocumentSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { data, error } = await supabase
    .from("documents")
    .insert({ ...parsed.data, created_by: user.id })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/admin/docs");
  return { data };
}

export async function updateDocument(id: string, input: UpdateDocumentInput) {
  const { supabase } = await requireAdmin();
  const parsed = updateDocumentSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { error } = await supabase
    .from("documents")
    .update(parsed.data)
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath(`/admin/docs/${id}`);
  revalidatePath("/admin/docs");
  return { success: true };
}

export async function deleteDocument(id: string) {
  const { supabase } = await requireAdmin();

  // Get file path before deleting
  const { data: doc } = await supabase
    .from("documents")
    .select("file_url")
    .eq("id", id)
    .single();

  // Delete storage file if exists
  if (doc?.file_url) {
    await supabase.storage.from("documents").remove([doc.file_url]);
  }

  // CASCADE handles FAQs, quizzes, etc.
  const { error } = await supabase.from("documents").delete().eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/docs");
  return { success: true };
}

export async function toggleDocumentStatus(id: string, newStatus: DocStatus) {
  const { supabase } = await requireAdmin();

  const updates: Record<string, unknown> = { status: newStatus };
  if (newStatus === "published") updates.published_at = new Date().toISOString();

  const { error } = await supabase.from("documents").update(updates).eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/docs");
  revalidatePath(`/admin/docs/${id}`);
  return { success: true };
}

export async function getDocuments(status?: DocStatus, search?: string) {
  const { supabase } = await requireAdmin();

  let query = supabase
    .from("documents")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (search) {
    // Escape special characters to prevent ilike injection
    const sanitized = search.replace(/[%_\\]/g, "\\$&");
    query = query.or(`title.ilike.%${sanitized}%,doc_number.ilike.%${sanitized}%`);
  }

  const { data, count, error } = await query;
  if (error) return { error: error.message };
  return { data: data ?? [], count: count ?? 0 };
}

export async function getDocumentById(id: string) {
  const { supabase } = await requireAdmin();

  const [docResult, faqCount, quizCount, viewCount] = await Promise.all([
    supabase.from("documents").select("*").eq("id", id).single(),
    supabase.from("document_faqs").select("id", { count: "exact" }).eq("document_id", id),
    supabase.from("document_quizzes").select("id", { count: "exact" }).eq("document_id", id),
    supabase.from("document_views").select("id", { count: "exact" }).eq("document_id", id),
  ]);

  if (docResult.error) return { error: docResult.error.message };

  return {
    data: {
      ...docResult.data,
      faq_count: faqCount.count ?? 0,
      quiz_count: quizCount.count ?? 0,
      view_count: viewCount.count ?? 0,
    },
  };
}

export async function getDocumentCounts() {
  const { supabase } = await requireAdmin();

  const [all, published, draft, paused] = await Promise.all([
    supabase.from("documents").select("id", { count: "exact", head: true }),
    supabase.from("documents").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("documents").select("id", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("documents").select("id", { count: "exact", head: true }).eq("status", "paused"),
  ]);

  return {
    all: all.count ?? 0,
    published: published.count ?? 0,
    draft: draft.count ?? 0,
    paused: paused.count ?? 0,
  };
}
