"use client";

import { useState } from "react";
import { DocumentList } from "@/components/admin/document-list";
import { CreateDocumentModal } from "@/components/admin/create-document-modal";
import type { Document } from "@/lib/supabase/types";

type Props = {
  documents: Document[];
  counts: { all: number; published: number; draft: number; paused: number };
};

export function DocsPageClient({ documents, counts }: Props) {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <>
      <DocumentList
        documents={documents}
        counts={counts}
        onCreateClick={() => setShowCreate(true)}
      />
      <CreateDocumentModal open={showCreate} onOpenChange={setShowCreate} />
    </>
  );
}
