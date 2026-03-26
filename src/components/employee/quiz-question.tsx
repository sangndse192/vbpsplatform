"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type Props = {
  questionIndex: number;
  totalQuestions: number;
  question: string;
  options: string[];
  selectedAnswer: number | null;
  onSelectAnswer: (index: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  isLast: boolean;
};

export function QuizQuestion({
  questionIndex,
  totalQuestions,
  question,
  options,
  selectedAnswer,
  onSelectAnswer,
  onNext,
  onPrev,
  onSubmit,
  isLast,
}: Props) {
  const progressValue = ((questionIndex + 1) / totalQuestions) * 100;

  return (
    <Card>
      <CardContent className="space-y-4 py-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Câu {questionIndex + 1} / {totalQuestions}
            </span>
            <span>{Math.round(progressValue)}%</span>
          </div>
          <Progress value={progressValue} />
        </div>

        <h3 className="text-base font-medium">{question}</h3>

        <RadioGroup
          value={selectedAnswer !== null ? String(selectedAnswer) : undefined}
          onValueChange={(val) => onSelectAnswer(Number(val))}
          className="space-y-2"
        >
          {options.map((option, i) => (
            <label
              key={i}
              className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                selectedAnswer === i
                  ? "border-blue-500 bg-blue-50"
                  : "hover:bg-gray-50"
              }`}
            >
              <RadioGroupItem value={String(i)} />
              <Label className="cursor-pointer flex-1">{option}</Label>
            </label>
          ))}
        </RadioGroup>

        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            onClick={onPrev}
            disabled={questionIndex === 0}
          >
            Trước
          </Button>
          {isLast ? (
            <Button onClick={onSubmit} disabled={selectedAnswer === null}>
              Nộp bài
            </Button>
          ) : (
            <Button onClick={onNext} disabled={selectedAnswer === null}>
              Tiếp theo
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
