"use client";

import Link from "next/link";
import { Eye, MessageSquare, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Document, DocStatus } from "@/lib/supabase/types";

type DocumentCardProps = {
  document: Document;
  onToggleStatus: (id: string, newStatus: DocStatus) => void;
  onDelete: (id: string) => void;
};

const leftBarColor: Record<string, string> = {
  published: "bg-red-500",
  draft: "bg-yellow-400",
  paused: "bg-gray-400",
};

const docTypeLabel: Record<string, string> = {
  policy: "Chính sách",
  regulation: "Quy định",
  guideline: "Hướng dẫn",
  circular: "Thông tư",
  decision: "Quyết định",
  other: "Khác",
};

const statusLabel: Record<string, string> = {
  published: "Đang hiệu lực",
  draft: "Nháp",
  paused: "Tạm dừng",
};

const statusBadgeClass: Record<string, string> = {
  published: "bg-green-100 text-green-700",
  draft: "bg-yellow-100 text-yellow-700",
  paused: "bg-orange-100 text-orange-700",
};

const targetLabel: Record<string, string> = {
  all: "Toàn hệ thống",
  branch: "Chi nhánh",
  department: "Phòng ban",
};

export function DocumentCard({ document, onToggleStatus, onDelete }: DocumentCardProps) {
  const isPublished = document.status === "published";
  const nextStatus: DocStatus = isPublished ? "paused" : "published";
  const actionLabel = isPublished ? "Tạm dừng" : "Kích hoạt";
  const ActionIcon = isPublished ? Pause : Play;

  const dateStr = document.published_at ?? document.created_at;
  const formattedDate = new Date(dateStr).toLocaleDateString("vi-VN");

  return (
    <div className="flex rounded-2xl bg-white overflow-hidden shadow-[0_2px_8px_rgba(99,102,241,0.06)] hover:shadow-[0_4px_12px_rgba(99,102,241,0.1)] transition-shadow">
      {/* Left color bar */}
      <div className={`w-1 shrink-0 ${leftBarColor[document.status] ?? "bg-gray-300"}`} />

      {/* Main content */}
      <div className="flex flex-1 items-center gap-4 px-4 py-3 min-w-0">
        {/* Badges row + title */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            {document.doc_number && (
              <Badge variant="outline" className="text-[11px] font-mono px-1.5 py-0">
                {document.doc_number}
              </Badge>
            )}
            <Badge variant="outline" className="text-[11px] px-1.5 py-0">
              {docTypeLabel[document.doc_type] ?? document.doc_type}
            </Badge>
            <Badge className={`text-[11px] px-1.5 py-0 ${statusBadgeClass[document.status] ?? "bg-gray-100 text-gray-600"}`}>
              {statusLabel[document.status] ?? document.status}
            </Badge>
          </div>

          <Link href={`/admin/docs/${document.id}`}>
            <h3 className="text-sm font-semibold leading-snug truncate hover:text-indigo-600 transition-colors">
              {document.title}
            </h3>
          </Link>

          <p className="text-xs text-muted-foreground truncate">
            {formattedDate}
            {" · "}
            <span>Đối tượng: {targetLabel[document.target] ?? document.target}</span>
          </p>
        </div>

        {/* Right: stats + action */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden sm:flex flex-col items-center text-center min-w-[40px]">
            <span className="text-sm font-bold text-gray-800">0</span>
            <span className="text-[10px] text-muted-foreground">Lượt xem</span>
          </div>
          <div className="hidden sm:flex flex-col items-center text-center min-w-[30px]">
            <span className="text-sm font-bold text-gray-800">0</span>
            <span className="text-[10px] text-muted-foreground">BL</span>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7 px-2.5"
            onClick={() => onToggleStatus(document.id, nextStatus)}
          >
            <ActionIcon className="h-3 w-3 mr-1" />
            {actionLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
