"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  documentId: string;
  hasFile: boolean;
  isProcessing: boolean;
  onProcessingStart: () => void;
  onProcessingComplete: (success: boolean) => void;
};

export function AiTriggerButton({
  documentId,
  hasFile,
  isProcessing,
  onProcessingStart,
  onProcessingComplete,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleTrigger() {
    if (!confirm("Su dung AI de phan tich van ban? Qua trinh co the mat 1-2 phut.")) return;

    setLoading(true);
    onProcessingStart();

    try {
      const res = await fetch("/api/ai/process-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document_id: documentId }),
      });

      const data = await res.json();
      onProcessingComplete(data.status === "completed");
    } catch {
      onProcessingComplete(false);
    } finally {
      setLoading(false);
    }
  }

  if (!hasFile) {
    return (
      <Button variant="outline" disabled>
        <Sparkles className="mr-2 h-4 w-4" />
        Tai PDF truoc de su dung AI
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={handleTrigger}
      disabled={loading || isProcessing}
    >
      {loading || isProcessing ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="mr-2 h-4 w-4" />
      )}
      {loading || isProcessing ? "Dang xu ly AI..." : "Tao tom tat & cau hoi AI"}
    </Button>
  );
}
