import { FileText, Eye, MessageSquare, Building } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Props = {
  totalDocs: number;
  totalViews: number;
  totalComments: number;
  branchCount: number;
};

type StatConfig = {
  label: string;
  subText: string;
  key: keyof Props;
  icon: LucideIcon;
  gradient: string;
};

const stats: StatConfig[] = [
  {
    label: "Tổng văn bản",
    subText: "3 đang hiệu lực",
    key: "totalDocs",
    icon: FileText,
    gradient: "from-indigo-500 to-indigo-400",
  },
  {
    label: "Lượt tiếp cận",
    subText: "Toàn hệ thống",
    key: "totalViews",
    icon: Eye,
    gradient: "from-cyan-400 to-teal-500",
  },
  {
    label: "Bình luận",
    subText: "Chờ phản hồi: 3",
    key: "totalComments",
    icon: MessageSquare,
    gradient: "from-orange-400 to-amber-500",
  },
  {
    label: "Chi nhánh",
    subText: "Đang kết nối",
    key: "branchCount",
    icon: Building,
    gradient: "from-emerald-400 to-green-500",
  },
];

export function DashboardStatCards(props: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.key}
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.gradient} p-5 text-white h-[114px]`}
        >
          {/* Decorative circle */}
          <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-white/10" />

          <stat.icon className="absolute top-4 right-4 h-6 w-6 opacity-40" />
          <p className="text-3xl font-extrabold">{props[stat.key]}</p>
          <p className="mt-1 text-sm font-medium opacity-90">{stat.label}</p>
          <p className="text-xs opacity-70 mt-0.5">{stat.subText}</p>
        </div>
      ))}
    </div>
  );
}
