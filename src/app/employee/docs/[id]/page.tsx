import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { trackView } from "@/lib/actions/document-views";
import { trackProgress, getProgress } from "@/lib/actions/progress";
import { DocumentDetailClient } from "@/components/employee/document-detail-client";
import type { Document, UserProgress } from "@/lib/supabase/types";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function EmployeeDocDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { tab } = await searchParams;
  const supabase = await createClient();

  const { data: doc, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !doc || doc.status !== "published") notFound();

  // Track view + mark as read (fire and forget, with error suppression)
  trackView(id).catch(() => {});
  trackProgress(id, "has_read").catch(() => {});

  // Fetch progress
  const progress = await getProgress(id);

  // Fetch FAQs and quizzes count for tab badges
  const [faqResult, quizResult, commentResult] = await Promise.all([
    supabase
      .from("document_faqs")
      .select("id", { count: "exact", head: true })
      .eq("document_id", id),
    supabase
      .from("document_quizzes")
      .select("id", { count: "exact", head: true })
      .eq("document_id", id),
    supabase
      .from("comments")
      .select("id", { count: "exact", head: true })
      .eq("document_id", id),
  ]);

  return (
    <DocumentDetailClient
      document={doc as Document}
      progress={progress as UserProgress | null}
      initialTab={tab ?? "detail"}
      counts={{
        faqs: faqResult.count ?? 0,
        quizzes: quizResult.count ?? 0,
        comments: commentResult.count ?? 0,
      }}
    />
  );
}
