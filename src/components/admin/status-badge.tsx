import { Badge } from "@/components/ui/badge";
import type { DocStatus } from "@/lib/supabase/types";

const statusConfig: Record<DocStatus, { label: string; className: string }> = {
  published: { label: "Đang hiệu lực", className: "bg-green-100 text-green-700 hover:bg-green-100" },
  draft: { label: "Nháp", className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100" },
  paused: { label: "Tạm dừng", className: "bg-gray-100 text-gray-600 hover:bg-gray-100" },
};

export function StatusBadge({ status }: { status: DocStatus }) {
  const config = statusConfig[status];
  return <Badge className={config.className}>{config.label}</Badge>;
}
