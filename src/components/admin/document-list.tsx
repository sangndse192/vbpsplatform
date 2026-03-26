"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentCard } from "./document-card";
import { toggleDocumentStatus, deleteDocument } from "@/lib/actions/documents";
import type { Document, DocStatus } from "@/lib/supabase/types";

type DocumentListProps = {
  documents: Document[];
  counts: { all: number; published: number; draft: number; paused: number };
  onCreateClick: () => void;
};

export function DocumentList({ documents, counts, onCreateClick }: DocumentListProps) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "published" | "draft" | "paused">("all");
  const [isPending, startTransition] = useTransition();

  const filtered = search
    ? documents.filter(
        (d) =>
          d.title.toLowerCase().includes(search.toLowerCase()) ||
          d.doc_number?.toLowerCase().includes(search.toLowerCase())
      )
    : documents;

  function handleToggle(id: string, newStatus: DocStatus) {
    startTransition(async () => {
      await toggleDocumentStatus(id, newStatus);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteDocument(id);
    });
  }

  function renderList(docs: Document[]) {
    if (docs.length === 0) {
      return <p className="text-center text-muted-foreground py-8">Không có văn bản nào</p>;
    }
    return (
      <div className="flex flex-col gap-2">
        {docs.map((doc) => (
          <DocumentCard
            key={doc.id}
            document={doc}
            onToggleStatus={handleToggle}
            onDelete={handleDelete}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${isPending ? "opacity-70 pointer-events-none" : ""}`}>
      {/* Row 1: Filter pill tabs + Create button */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {(
            [
              { key: "all", label: "Tất cả", count: counts.all },
              { key: "published", label: "Đang hiệu lực", count: counts.published },
              { key: "draft", label: "Nháp", count: counts.draft },
              { key: "paused", label: "Tạm dừng", count: counts.paused },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-indigo-600 text-white"
                  : "border border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <Button
          onClick={onCreateClick}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" /> Tạo văn bản mới
        </Button>
      </div>

      {/* Document list */}
      {renderList(
        activeTab === "all"
          ? filtered
          : filtered.filter((d) => d.status === activeTab)
      )}
    </div>
  );
}
