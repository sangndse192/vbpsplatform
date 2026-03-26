"use client";

import { Award, Clock, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
  questionCount: number;
  bestScore: { score: number; total: number } | null;
  onStart: () => void;
};

export function QuizStartScreen({ questionCount, bestScore, onStart }: Props) {
  const estimatedMinutes = Math.max(1, Math.ceil(questionCount * 1.5));

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-8">
        <Award className="h-12 w-12 text-blue-600" />
        <h3 className="text-lg font-semibold">Kiểm tra kiến thức</h3>

        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <FileQuestion className="h-4 w-4" />
            {questionCount} câu hỏi
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            ~{estimatedMinutes} phút
          </span>
        </div>

        {bestScore && (
          <p className="text-sm">
            Điểm cao nhất:{" "}
            <span className="font-semibold text-green-600">
              {bestScore.score}/{bestScore.total}
            </span>
          </p>
        )}

        <Button onClick={onStart} className="mt-2">
          Bắt đầu làm quiz
        </Button>
      </CardContent>
    </Card>
  );
}
