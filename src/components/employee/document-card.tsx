"use client";

import Link from "next/link";
import { Eye, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Document, UserProgress } from "@/lib/supabase/types";

type EmployeeDocumentCardProps = {
  document: Document;
  progress?: UserProgress | null;
};

const topBorderColors: Record<string, string> = {
  regulation: "border-t-red-500",
  decision:   "border-t-red-500",
  guideline:  "border-t-green-500",
  policy:     "border-t-purple-500",
  circular:   "border-t-blue-500",
  other:      "border-t-gray-300",
};

const typeLabels: Record<string, string> = {
  policy:     "Chính sách",
  regulation: "Quy định",
  guideline:  "Hướng dẫn",
  circular:   "Thông tư",
  decision:   "Quyết định",
  other:      "Khác",
};

const typeBadgeColors: Record<string, string> = {
  policy:     "bg-purple-100 text-purple-700",
  regulation: "bg-red-100 text-red-700",
  guideline:  "bg-green-100 text-green-700",
  circular:   "bg-blue-100 text-blue-700",
  decision:   "bg-red-100 text-red-700",
  other:      "bg-gray-100 text-gray-700",
};

function getProgressCount(p?: UserProgress | null): number {
  if (!p) return 0;
  let count = 0;
  if (p.has_read) count++;
  if (p.viewed_faq) count++;
  if (p.quiz_passed) count++;
  if (p.sent_feedback) count++;
  return count;
}

export function EmployeeDocumentCard({ document, progress }: EmployeeDocumentCardProps) {
  const completed = getProgressCount(progress);
  const borderColor = topBorderColors[document.doc_type] ?? topBorderColors.other;
  const badgeColor = typeBadgeColors[document.doc_type] ?? typeBadgeColors.other;
  const typeLabel = typeLabels[document.doc_type] ?? document.doc_type;

  return (
    <Link href={`/employee/docs/${document.id}`}>
      <Card className={`border-t-4 ${borderColor} hover:shadow-md transition-shadow cursor-pointer h-full`}>
        <CardHeader className="pb-2 space-y-1.5">
          {/* Doc number + type badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {document.doc_number && (
              <span className="text-[10px] font-mono bg-gray-100 text-gray-600 rounded px-1.5 py-0.5">
                {document.doc_number}
              </span>
            )}
            <Badge className={`text-[10px] ${badgeColor}`}>
              {typeLabel}
            </Badge>
          </div>
          {/* Title */}
          <h3 className="font-semibold text-sm leading-snug line-clamp-2">
            {document.title}
          </h3>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Metadata: department · date */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground flex-wrap">
            {document.issued_date && (
              <span>{new Date(document.issued_date).toLocaleDateString("vi-VN")}</span>
            )}
            {!document.issued_date && document.published_at && (
              <span>{new Date(document.published_at).toLocaleDateString("vi-VN")}</span>
            )}
          </div>

          {/* View count + comment count */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {completed > 0 ? `${completed}/4 hoàn thành` : "Chưa xem"}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              Bình luận
            </span>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full ${
                  i < completed ? "bg-green-500" : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          {/* FAQ + Quiz badges */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
              FAQ
            </span>
            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700">
              Quiz
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
