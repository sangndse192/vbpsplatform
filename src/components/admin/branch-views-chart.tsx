"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  data: { branch: string; views: number }[];
};

export function BranchViewsChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Luot xem theo chi nhanh</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground py-8 text-center">
          Chua co du lieu luot xem
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Luot xem theo chi nhanh</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={Math.max(200, data.length * 40)}>
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 30 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
            </defs>
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="branch"
              width={120}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value) => [`${value} luot xem`, "Luot xem"]}
            />
            <Bar dataKey="views" radius={[0, 4, 4, 0]} label={{ position: "right", fontSize: 12 }}>
              {data.map((_, i) => (
                <Cell key={i} fill="url(#barGradient)" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
