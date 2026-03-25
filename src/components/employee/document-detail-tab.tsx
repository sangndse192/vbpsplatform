"use client";

import { useEffect, useState } from "react";
import { Download, Calendar, Building, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AiSummaryCard } from "./ai-summary-card";
import { LearningProgress } from "./learning-progress";
import { AmbassadorContact } from "./ambassador-contact";
import { createClient } from "@/lib/supabase/client";
import type { Document, UserProgress, Profile } from "@/lib/supabase/types";

type Props = {
  document: Document;
  progress: UserProgress | null;
};

export function DocumentDetailTab({ document, progress }: Props) {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [ambassador, setAmbassador] = useState<Pick<
    Profile,
    "full_name" | "avatar_url" | "phone" | "position"
  > | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Generate signed URL for PDF
    if (document.file_url) {
      supabase.storage
        .from("documents")
        .createSignedUrl(document.file_url, 3600)
        .then(({ data }) => {
          if (data) setDownloadUrl(data.signedUrl);
        });
    }

    // Fetch ambassador
    supabase
      .from("profiles")
      .select("full_name, avatar_url, phone, position")
      .eq("role", "ambassador")
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) setAmbassador(data);
      });
  }, [document.file_url]);

  return (
    <div className="space-y-4">
      {/* Metadata */}
      <Card>
        <CardContent className="grid gap-3 py-4 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Ngay ban hanh:</span>
            <span>
              {document.issued_date
                ? new Date(document.issued_date).toLocaleDateString("vi-VN")
                : "—"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Hieu luc:</span>
            <span>
              {document.effective_date
                ? new Date(document.effective_date).toLocaleDateString("vi-VN")
                : "—"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Pham vi:</span>
            <Badge variant="outline">{document.target}</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Muc do:</span>
            <Badge
              variant={document.urgency === "urgent" ? "destructive" : "outline"}
            >
              {document.urgency}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* PDF Download */}
      {document.file_url && (
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => downloadUrl && window.open(downloadUrl, "_blank")}
          disabled={!downloadUrl}
        >
          <Download className="mr-2 h-4 w-4" />
          Tai file PDF
          {document.file_name && (
            <span className="ml-1 text-muted-foreground">({document.file_name})</span>
          )}
        </Button>
      )}

      {/* Summary */}
      {document.summary && (
        <Card>
          <CardContent className="py-4">
            <p className="text-sm whitespace-pre-wrap">{document.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* AI Summary */}
      <AiSummaryCard aiSummary={document.ai_summary} />

      {/* Learning Progress */}
      <div>
        <h3 className="text-sm font-medium mb-2">Tien do hoc tap</h3>
        <LearningProgress progress={progress} />
      </div>

      {/* Ambassador */}
      <AmbassadorContact ambassador={ambassador} />
    </div>
  );
}
