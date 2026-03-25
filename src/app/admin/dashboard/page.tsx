import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, MessageSquare, BarChart3 } from "lucide-react";

const stats = [
  { label: "Van ban", value: "—", icon: FileText, color: "text-indigo-600" },
  { label: "Nhan vien", value: "—", icon: Users, color: "text-green-600" },
  { label: "Binh luan", value: "—", icon: MessageSquare, color: "text-blue-600" },
  { label: "Luot xem", value: "—", icon: BarChart3, color: "text-orange-600" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
