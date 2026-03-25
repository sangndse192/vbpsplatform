"use client";

import Link from "next/link";
import { MoreVertical, Trash2, Eye, Play, Pause } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "./status-badge";
import { Badge } from "@/components/ui/badge";
import type { Document, DocStatus } from "@/lib/supabase/types";

type DocumentCardProps = {
  document: Document;
  onToggleStatus: (id: string, newStatus: DocStatus) => void;
  onDelete: (id: string) => void;
};

const urgencyColors = {
  normal: "",
  important: "border-l-yellow-500",
  urgent: "border-l-red-500",
};

export function DocumentCard({ document, onToggleStatus, onDelete }: DocumentCardProps) {
  const nextStatus: DocStatus =
    document.status === "draft" ? "published" : document.status === "published" ? "paused" : "published";

  return (
    <Card className={`border-l-4 ${urgencyColors[document.urgency] || "border-l-transparent"}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <Link href={`/admin/docs/${document.id}`} className="flex-1 min-w-0">
          <h3 className="font-medium text-sm leading-tight truncate hover:text-indigo-600">
            {document.title}
          </h3>
          {document.doc_number && (
            <p className="text-xs text-muted-foreground mt-1">{document.doc_number}</p>
          )}
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" />}>
            <MoreVertical className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onToggleStatus(document.id, nextStatus)}>
              {nextStatus === "published" ? (
                <><Play className="mr-2 h-4 w-4" /> Xuat ban</>
              ) : (
                <><Pause className="mr-2 h-4 w-4" /> Tam dung</>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.open(`/admin/docs/${document.id}`, "_self")}>
              <Eye className="mr-2 h-4 w-4" /> Chi tiet
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                if (confirm("Xoa van ban nay?")) onDelete(document.id);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Xoa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex items-center gap-2 flex-wrap">
        <StatusBadge status={document.status} />
        <Badge variant="outline" className="text-xs">{document.doc_type}</Badge>
        <span className="text-xs text-muted-foreground ml-auto">
          {new Date(document.created_at).toLocaleDateString("vi-VN")}
        </span>
      </CardContent>
    </Card>
  );
}
