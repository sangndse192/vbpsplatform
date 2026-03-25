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
  key: keyof Props;
  icon: LucideIcon;
  gradient: string;
};

const stats: StatConfig[] = [
  { label: "Van ban", key: "totalDocs", icon: FileText, gradient: "from-indigo-500 to-indigo-600" },
  { label: "Luot xem", key: "totalViews", icon: Eye, gradient: "from-sky-500 to-sky-600" },
  { label: "Gop y", key: "totalComments", icon: MessageSquare, gradient: "from-green-500 to-green-600" },
  { label: "Chi nhanh", key: "branchCount", icon: Building, gradient: "from-orange-500 to-orange-600" },
];

export function DashboardStatCards(props: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.key}
          className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${stat.gradient} p-5 text-white`}
        >
          {/* Decorative circle */}
          <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-white/10" />

          <stat.icon className="absolute top-4 right-4 h-6 w-6 opacity-40" />
          <p className="text-3xl font-bold">{props[stat.key]}</p>
          <p className="mt-1 text-sm opacity-80">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
