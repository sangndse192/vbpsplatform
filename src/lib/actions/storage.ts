"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "./auth-guard";

// Validate storage path: must be UUID/filename, no traversal
function isValidPath(path: string): boolean {
  return /^[0-9a-f-]+\/[^/]+$/i.test(path) && !path.includes("..");
}

// Sanitize filename: strip path separators and dangerous chars
function sanitizeFileName(name: string): string {
  return name.replace(/[/\\:*?"<>|]/g, "_");
}

export async function uploadPdf(formData: FormData, documentId: string) {
  const { supabase } = await requireAdmin();

  const file = formData.get("file") as File;
  if (!file) return { error: "No file provided" };
  if (file.type !== "application/pdf") return { error: "Only PDF files allowed" };
  if (file.size > 20 * 1024 * 1024) return { error: "File must be under 20MB" };

  const safeName = sanitizeFileName(file.name);
  const filePath = `${documentId}/${safeName}`;

  if (!isValidPath(filePath)) return { error: "Invalid file path" };

  const { error } = await supabase.storage
    .from("documents")
    .upload(filePath, file, { upsert: true });

  if (error) return { error: error.message };

  const { error: updateError } = await supabase
    .from("documents")
    .update({
      file_url: filePath,
      file_name: safeName,
      file_size: file.size,
    })
    .eq("id", documentId);

  if (updateError) return { error: updateError.message };

  revalidatePath(`/admin/docs/${documentId}`);
  return { data: { path: filePath } };
}

export async function getSignedUrl(path: string) {
  const { supabase } = await requireAdmin();

  if (!isValidPath(path)) return { error: "Invalid path" };

  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(path, 3600);

  if (error) return { error: error.message };
  return { data: data.signedUrl };
}

export async function deletePdf(path: string) {
  const { supabase } = await requireAdmin();

  if (!isValidPath(path)) return { error: "Invalid path" };

  const { error } = await supabase.storage.from("documents").remove([path]);
  if (error) return { error: error.message };
  return { success: true };
}
