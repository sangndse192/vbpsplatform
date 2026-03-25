"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmployeeDocumentCard } from "./document-card";
import { NotificationBanner } from "./notification-banner";
import type { Document, DocType, UserProgress } from "@/lib/supabase/types";

type DocumentGridProps = {
  documents: Document[];
  progressMap: Record<string, UserProgress>;
  newDocCount: number;
};

const typeOptions: { value: string; label: string }[] = [
  { value: "all", label: "Tat ca loai" },
  { value: "policy", label: "Chinh sach" },
  { value: "regulation", label: "Quy dinh" },
  { value: "guideline", label: "Huong dan" },
  { value: "circular", label: "Thong tu" },
  { value: "decision", label: "Quyet dinh" },
  { value: "other", label: "Khac" },
];

export function DocumentGrid({ documents, progressMap, newDocCount }: DocumentGridProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        !search ||
        doc.title.toLowerCase().includes(search.toLowerCase()) ||
        doc.doc_number?.toLowerCase().includes(search.toLowerCase());

      const matchesType = typeFilter === "all" || doc.doc_type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [documents, search, typeFilter]);

  return (
    <div className="space-y-4">
      <NotificationBanner newDocCount={newDocCount} />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tim kiem van ban..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          {typeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Khong tim thay van ban nao
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((doc) => (
            <EmployeeDocumentCard
              key={doc.id}
              document={doc}
              progress={progressMap[doc.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
