"use client";

import { useState } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type NotificationBannerProps = {
  newDocCount: number;
};

export function NotificationBanner({ newDocCount }: NotificationBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || newDocCount === 0) return null;

  return (
    <div className="flex items-center justify-between rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800 border border-blue-200">
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4" />
        <span>
          <strong>{newDocCount}</strong> van ban moi can xem trong 7 ngay qua
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-blue-600 hover:text-blue-800"
        onClick={() => setDismissed(true)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
