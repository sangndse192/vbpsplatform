"use client";

import { FileText, Award, MessageSquare, Bell as BellIcon } from "lucide-react";
import { markAsRead } from "@/lib/actions/notifications";
import type { LucideIcon } from "lucide-react";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  data: Record<string, unknown> | null;
  created_at: string;
};

type Props = {
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
};

const typeIcons: Record<string, LucideIcon> = {
  document: FileText,
  quiz: Award,
  comment: MessageSquare,
  community: MessageSquare,
  system: BellIcon,
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ`;
  return `${Math.floor(hours / 24)} ngày`;
}

export function NotificationList({ notifications, onMarkRead }: Props) {
  if (notifications.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">
        Không có thông báo
      </div>
    );
  }

  async function handleClick(n: NotificationItem) {
    if (!n.read) {
      await markAsRead(n.id);
      onMarkRead(n.id);
    }
  }

  return (
    <div>
      {notifications.map((n) => {
        const Icon = typeIcons[n.type] ?? BellIcon;

        return (
          <button
            key={n.id}
            onClick={() => handleClick(n)}
            className={`flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
              !n.read ? "bg-blue-50/50" : ""
            }`}
          >
            <Icon className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className={`text-sm ${!n.read ? "font-medium" : ""}`}>{n.title}</p>
              {n.body && (
                <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
              {timeAgo(n.created_at)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
