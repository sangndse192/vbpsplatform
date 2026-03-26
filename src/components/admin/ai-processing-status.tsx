"use client";

import { Loader2, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Props = {
  status: string | null;
  error?: string;
};

export function AiProcessingStatus({ status, error }: Props) {
  if (!status) {
    return (
      <Badge variant="outline" className="gap-1">
        <Sparkles className="h-3 w-3" />
        Chưa xử lý AI
      </Badge>
    );
  }

  if (status === "pending") {
    return (
      <Badge className="gap-1 bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
        <Loader2 className="h-3 w-3 animate-spin" />
        Đang xử lý...
      </Badge>
    );
  }

  if (status === "completed") {
    return (
      <Badge className="gap-1 bg-green-100 text-green-700 hover:bg-green-100">
        <CheckCircle2 className="h-3 w-3" />
        AI đã hoàn thành
      </Badge>
    );
  }

  if (status === "failed") {
    return (
      <div className="space-y-1">
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          AI thất bại
        </Badge>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  return null;
}
