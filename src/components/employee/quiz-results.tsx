"use client";

import { CheckCircle2, XCircle, RotateCcw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { DocumentQuiz } from "@/lib/supabase/types";

type Props = {
  score: number;
  total: number;
  passed: boolean;
  answers: Record<string, number>;
  quizzes: DocumentQuiz[];
  onRetry: () => void;
  onBack: () => void;
};

export function QuizResults({
  score,
  total,
  passed,
  answers,
  quizzes,
  onRetry,
  onBack,
}: Props) {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Score Card */}
      <Card className={passed ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"}>
        <CardContent className="flex flex-col items-center gap-2 py-6">
          {passed ? (
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          ) : (
            <XCircle className="h-12 w-12 text-red-500" />
          )}
          <h3 className="text-2xl font-bold">
            {score}/{total}
          </h3>
          <p className="text-sm text-muted-foreground">{percentage}% chính xác</p>
          <p className={`text-sm font-medium ${passed ? "text-green-700" : "text-red-600"}`}>
            {passed ? "Đạt yêu cầu!" : "Chưa đạt (cần >= 70%)"}
          </p>
        </CardContent>
      </Card>

      {/* Answer Review */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Xem lại câu trả lời</h4>
        {quizzes.map((quiz, i) => {
          const userAnswer = answers[quiz.id] ?? -1;
          const isCorrect = userAnswer === quiz.correct_answer;

          return (
            <Card key={quiz.id}>
              <CardContent className="py-3 space-y-2">
                <div className="flex items-start gap-2">
                  {isCorrect ? (
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 mt-0.5 text-red-500 shrink-0" />
                  )}
                  <p className="text-sm font-medium">
                    Câu {i + 1}: {quiz.question}
                  </p>
                </div>
                <div className="pl-6 space-y-1">
                  {quiz.options.map((opt, oi) => (
                    <p
                      key={oi}
                      className={`text-sm rounded px-2 py-0.5 ${
                        oi === quiz.correct_answer
                          ? "bg-green-100 text-green-800 font-medium"
                          : oi === userAnswer && !isCorrect
                            ? "bg-red-100 text-red-700 line-through"
                            : "text-muted-foreground"
                      }`}
                    >
                      {opt}
                    </p>
                  ))}
                  {quiz.explanation && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      {quiz.explanation}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lai
        </Button>
        <Button onClick={onRetry}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Lam lai
        </Button>
      </div>
    </div>
  );
}
