"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type NotificationBannerProps = {
  newDocCount: number;
};

export function NotificationBanner({ newDocCount }: NotificationBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || newDocCount === 0) return null;

  return (
    <div className="flex items-center justify-between rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 border border-amber-200">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
        <span>
          Có <strong>{newDocCount}</strong> văn bản mới được ban hành trong tháng này. Vui lòng xem và hoàn thành Quiz.
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-amber-600 hover:text-amber-800 hover:bg-amber-100 shrink-0 ml-2"
        onClick={() => setDismissed(true)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
