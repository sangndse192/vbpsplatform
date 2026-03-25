// Vietnamese formatting utilities

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTimeAgo(date: string | Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return "Vua xong";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} phut truoc`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} gio truoc`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Hom qua";
  if (days < 30) return `${days} ngay truoc`;
  return formatDate(date);
}

export function formatNumber(n: number): string {
  return n.toLocaleString("vi-VN");
}
