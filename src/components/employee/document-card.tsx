"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Document, UserProgress } from "@/lib/supabase/types";

type EmployeeDocumentCardProps = {
  document: Document;
  progress?: UserProgress | null;
};

const urgencyConfig = {
  normal: { label: "Binh thuong", className: "border-l-transparent" },
  important: { label: "Quan trong", className: "border-l-yellow-500" },
  urgent: { label: "Khan cap", className: "border-l-red-500" },
};

const typeColors: Record<string, string> = {
  policy: "bg-blue-100 text-blue-700",
  regulation: "bg-purple-100 text-purple-700",
  guideline: "bg-green-100 text-green-700",
  circular: "bg-orange-100 text-orange-700",
  decision: "bg-red-100 text-red-700",
  other: "bg-gray-100 text-gray-700",
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
  const urgency = urgencyConfig[document.urgency];

  return (
    <Link href={`/employee/docs/${document.id}`}>
      <Card className={`border-l-4 ${urgency.className} hover:shadow-md transition-shadow cursor-pointer h-full`}>
        <CardHeader className="pb-2">
          <h3 className="font-medium text-sm leading-tight line-clamp-2">
            {document.title}
          </h3>
          {document.doc_number && (
            <p className="text-xs text-muted-foreground mt-1">{document.doc_number}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={typeColors[document.doc_type] ?? typeColors.other}>
              {document.doc_type}
            </Badge>
            {document.urgency !== "normal" && (
              <Badge variant="destructive" className="text-xs">
                {urgency.label}
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {document.published_at
                ? new Date(document.published_at).toLocaleDateString("vi-VN")
                : ""}
            </span>
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 w-4 rounded-full ${
                    i < completed ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              ))}
              <span className="text-xs text-muted-foreground ml-1">{completed}/4</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
