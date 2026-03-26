import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DocumentGrid } from "@/components/employee/document-grid";
import type { Document, UserProgress } from "@/lib/supabase/types";

export default async function EmployeeDocsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Fetch published documents (RLS ensures only published visible)
  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  // Fetch user progress for all documents
  const { data: progressRows } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", user.id);

  const progressMap: Record<string, UserProgress> = {};
  for (const row of (progressRows ?? []) as UserProgress[]) {
    progressMap[row.document_id] = row;
  }

  // Count documents published in last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const newDocCount = (documents ?? []).filter(
    (d) => d.published_at && new Date(d.published_at) >= sevenDaysAgo
  ).length;

  return (
    <div className="space-y-6">
      <h1 className="text-[17px] font-extrabold text-slate-800">Văn bản Chính sách</h1>
      <DocumentGrid
        documents={(documents ?? []) as Document[]}
        progressMap={progressMap}
        newDocCount={newDocCount}
      />
    </div>
  );
}
