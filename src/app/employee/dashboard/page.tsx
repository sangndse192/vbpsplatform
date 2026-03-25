import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, BookOpen, MessageSquare, Award } from "lucide-react";

const stats = [
  { label: "Van ban moi", value: "—", icon: FileText, color: "text-blue-600" },
  { label: "Da doc", value: "—", icon: BookOpen, color: "text-green-600" },
  { label: "Cong dong", value: "—", icon: MessageSquare, color: "text-purple-600" },
  { label: "Diem quiz", value: "—", icon: Award, color: "text-orange-600" },
];

export default function EmployeeDashboard() {
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
