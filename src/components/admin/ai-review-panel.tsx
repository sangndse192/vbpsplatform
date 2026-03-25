"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AiProcessingStatus } from "./ai-processing-status";
import { AiTriggerButton } from "./ai-trigger-button";
import { AiSummaryPreview } from "./ai-summary-preview";
import type { AISummary } from "@/lib/openai/types";
import type { Document } from "@/lib/supabase/types";

type Props = {
  document: Document;
};

export function AiReviewPanel({ document }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const aiSummary = document.ai_summary as AISummary | null;
  const status = aiSummary?.processing_status ?? null;
  const [localStatus, setLocalStatus] = useState(status);

  function handleProcessingStart() {
    setLocalStatus("pending");
  }

  function handleProcessingComplete(success: boolean) {
    setLocalStatus(success ? "completed" : "failed");
    if (success) router.refresh();
  }

  function handleApproveSummary(edited: AISummary) {
    // Summary is already stored by the API route; edits update via page refresh
    startTransition(() => {
      router.refresh();
    });
  }

  function handleRejectSummary() {
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <Card className={isPending ? "opacity-70" : ""}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">AI Processing</CardTitle>
        <AiProcessingStatus
          status={localStatus}
          error={aiSummary?.error}
        />
      </CardHeader>
      <CardContent className="space-y-4">
        <AiTriggerButton
          documentId={document.id}
          hasFile={!!document.file_url}
          isProcessing={localStatus === "pending"}
          onProcessingStart={handleProcessingStart}
          onProcessingComplete={handleProcessingComplete}
        />

        {localStatus === "completed" && aiSummary && (
          <AiSummaryPreview
            summary={aiSummary}
            onApprove={handleApproveSummary}
            onReject={handleRejectSummary}
          />
        )}

        {localStatus === "completed" && (
          <p className="text-xs text-muted-foreground">
            FAQ va quiz da duoc tao trong cac tab ben duoi. Xem va chinh sua o do.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
