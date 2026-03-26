import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AiSummaryCardProps = {
  aiSummary: Record<string, unknown> | null;
};

export function AiSummaryCard({ aiSummary }: AiSummaryCardProps) {
  if (!aiSummary) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          <span>Tóm tắt AI đang được tạo...</span>
        </CardContent>
      </Card>
    );
  }

  const why = (aiSummary.why_this_matters as string) ?? null;
  const who = (aiSummary.who_is_affected as string) ?? null;
  const points = (aiSummary.key_points as string[]) ?? [];

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Sparkles className="h-4 w-4 text-blue-600" />
          Tóm tắt 3 phút
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {why && (
          <div>
            <p className="font-medium text-blue-800">Tại sao quan trọng</p>
            <p className="text-blue-700">{why}</p>
          </div>
        )}
        {who && (
          <div>
            <p className="font-medium text-blue-800">Đối tượng ảnh hưởng</p>
            <p className="text-blue-700">{who}</p>
          </div>
        )}
        {points.length > 0 && (
          <div>
            <p className="font-medium text-blue-800">Điểm chính</p>
            <ul className="list-disc pl-4 text-blue-700 space-y-1">
              {points.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
