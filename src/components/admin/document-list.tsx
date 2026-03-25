"use client";

import { useState, useTransition } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  function renderGrid(docs: Document[]) {
    if (docs.length === 0) {
      return <p className="text-center text-muted-foreground py-8">Khong co van ban nao</p>;
    }
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tim kiem van ban..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={onCreateClick}>
          <Plus className="h-4 w-4 mr-2" /> Tao van ban
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Tat ca ({counts.all})</TabsTrigger>
          <TabsTrigger value="published">Published ({counts.published})</TabsTrigger>
          <TabsTrigger value="draft">Draft ({counts.draft})</TabsTrigger>
          <TabsTrigger value="paused">Paused ({counts.paused})</TabsTrigger>
        </TabsList>
        <TabsContent value="all">{renderGrid(filtered)}</TabsContent>
        <TabsContent value="published">
          {renderGrid(filtered.filter((d) => d.status === "published"))}
        </TabsContent>
        <TabsContent value="draft">
          {renderGrid(filtered.filter((d) => d.status === "draft"))}
        </TabsContent>
        <TabsContent value="paused">
          {renderGrid(filtered.filter((d) => d.status === "paused"))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
