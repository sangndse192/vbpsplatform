import { getDocuments, getDocumentCounts } from "@/lib/actions/documents";
import { DocsPageClient } from "./docs-page-client";

export default async function AdminDocsPage() {
  const [docsResult, counts] = await Promise.all([
    getDocuments(),
    getDocumentCounts(),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Quan ly van ban</h1>
      <DocsPageClient documents={docsResult.data ?? []} counts={counts} />
    </div>
  );
}
