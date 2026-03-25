"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "./auth-guard";
import { faqSchema } from "@/lib/validations/faq";
import type { FaqInput } from "@/lib/validations/faq";

export async function createFaq(documentId: string, input: FaqInput) {
  const { supabase } = await requireAdmin();
  const parsed = faqSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  // Auto-increment sort_order
  const { count } = await supabase
    .from("document_faqs")
    .select("id", { count: "exact", head: true })
    .eq("document_id", documentId);

  const { data, error } = await supabase
    .from("document_faqs")
    .insert({
      document_id: documentId,
      ...parsed.data,
      sort_order: parsed.data.sort_order ?? (count ?? 0),
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath(`/admin/docs/${documentId}`);
  return { data };
}

export async function updateFaq(id: string, documentId: string, input: FaqInput) {
  const { supabase } = await requireAdmin();
  const parsed = faqSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { error } = await supabase
    .from("document_faqs")
    .update(parsed.data)
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath(`/admin/docs/${documentId}`);
  return { success: true };
}

export async function deleteFaq(id: string, documentId: string) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("document_faqs").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/admin/docs/${documentId}`);
  return { success: true };
}

export async function getFaqsByDocument(documentId: string) {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("document_faqs")
    .select("*")
    .eq("document_id", documentId)
    .order("sort_order");

  if (error) return { error: error.message };
  return { data: data ?? [] };
}
