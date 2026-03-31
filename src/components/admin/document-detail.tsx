"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Play, Pause, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "./status-badge";
import { toggleDocumentStatus, deleteDocument } from "@/lib/actions/documents";
import type { Document, DocStatus } from "@/lib/supabase/types";

type DocumentWithCounts = Document & {
  faq_count: number;
  quiz_count: number;
  view_count: number;
};

type Props = {
  document: DocumentWithCounts;
  pdfUrl?: string | null;
};

export function DocumentDetail({ document: doc, pdfUrl }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const nextStatus: DocStatus =
    doc.status === "draft" ? "published" : doc.status === "published" ? "paused" : "published";

  function handleToggle() {
    startTransition(async () => {
      await toggleDocumentStatus(doc.id, nextStatus);
    });
  }

  function handleDelete() {
    if (!confirm("Xóa văn bản này? Toàn bộ FAQ, quiz và file sẽ bị xóa.")) return;
    startTransition(async () => {
      await deleteDocument(doc.id);
      router.push("/admin/docs");
    });
  }

  return (
    <div className={`space-y-4 ${isPending ? "opacity-70" : ""}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/docs")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{doc.title}</h1>
            {doc.doc_number && <p className="text-sm text-muted-foreground">{doc.doc_number}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={doc.status} />
          <Button variant="outline" size="sm" onClick={handleToggle}>
            {nextStatus === "published" ? <><Play className="h-4 w-4 mr-1" />Start</> : <><Pause className="h-4 w-4 mr-1" />Tạm dừng</>}
          </Button>
          <Button variant="outline" size="sm" className="text-destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-1" />Xóa
          </Button>
        </div>
      </div>

      {/* Metadata */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Thông tin văn bản</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Loai</p>
              <Badge variant="outline">{doc.doc_type}</Badge>
            </div>
            <div>
              <p className="text-muted-foreground">Mức độ</p>
              <p className="font-medium capitalize">{doc.urgency}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Phạm vi</p>
              <p className="font-medium capitalize">{doc.target}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Ngày tạo</p>
              <p>{new Date(doc.created_at).toLocaleDateString("vi-VN")}</p>
            </div>
          </div>
          {doc.summary && <p className="text-sm mt-4 text-muted-foreground">{doc.summary}</p>}
          {pdfUrl && (
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-3 text-sm text-indigo-600 hover:underline">
              <FileText className="h-4 w-4" /> Xem file PDF
            </a>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{doc.view_count}</p><p className="text-xs text-muted-foreground">Lượt xem</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{doc.faq_count}</p><p className="text-xs text-muted-foreground">FAQ</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{doc.quiz_count}</p><p className="text-xs text-muted-foreground">Quiz</p></CardContent></Card>
      </div>
    </div>
  );
}
