"use client";

import { useState } from "react";
import { Check, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { AIQuizSuggestion } from "@/lib/openai/types";

type Props = {
  quizzes: AIQuizSuggestion[];
  onApprove: (selected: AIQuizSuggestion[]) => void;
};

type EditableQuiz = AIQuizSuggestion & { included: boolean; editing: boolean };

export function AiQuizPreview({ quizzes, onApprove }: Props) {
  const [items, setItems] = useState<EditableQuiz[]>(
    quizzes.map((q) => ({ ...q, included: true, editing: false }))
  );

  function toggle(i: number) {
    setItems((prev) => prev.map((item, idx) =>
      idx === i ? { ...item, included: !item.included } : item
    ));
  }

  function toggleEdit(i: number) {
    setItems((prev) => prev.map((item, idx) =>
      idx === i ? { ...item, editing: !item.editing } : item
    ));
  }

  function updateQuestion(i: number, value: string) {
    setItems((prev) => prev.map((item, idx) =>
      idx === i ? { ...item, question: value } : item
    ));
  }

  function updateOption(i: number, oi: number, value: string) {
    setItems((prev) => prev.map((item, idx) => {
      if (idx !== i) return item;
      const options = [...item.options] as [string, string, string, string];
      options[oi] = value;
      return { ...item, options };
    }));
  }

  function updateCorrect(i: number, value: string) {
    setItems((prev) => prev.map((item, idx) =>
      idx === i ? { ...item, correct_answer_index: Number(value) as 0 | 1 | 2 | 3 } : item
    ));
  }

  function handleApprove() {
    onApprove(
      items
        .filter((q) => q.included)
        .map(({ question, options, correct_answer_index }) => ({ question, options, correct_answer_index }))
    );
  }

  if (items.length === 0) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm">Quiz goi y ({items.filter((q) => q.included).length}/{items.length})</CardTitle>
        <Button size="sm" variant="outline" onClick={handleApprove}>
          <Check className="mr-1 h-3 w-3" />
          Duyet quiz da chon
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, i) => (
          <div
            key={i}
            className={`rounded-lg border p-3 text-sm ${item.included ? "" : "opacity-50"}`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="font-medium">Cau {i + 1}:</p>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleEdit(i)}>
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggle(i)}>
                  {item.included ? <Trash2 className="h-3 w-3 text-red-500" /> : <Check className="h-3 w-3 text-green-600" />}
                </Button>
              </div>
            </div>

            {item.editing ? (
              <div className="space-y-2">
                <Input value={item.question} onChange={(e) => updateQuestion(i, e.target.value)} />
                {item.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <RadioGroup value={String(item.correct_answer_index)} onValueChange={(v) => updateCorrect(i, v)}>
                      <RadioGroupItem value={String(oi)} />
                    </RadioGroup>
                    <Input value={opt} onChange={(e) => updateOption(i, oi, e.target.value)} className="flex-1" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                <p>{item.question}</p>
                {item.options.map((opt, oi) => (
                  <p key={oi} className={`pl-4 ${oi === item.correct_answer_index ? "text-green-700 font-medium" : "text-muted-foreground"}`}>
                    {String.fromCharCode(65 + oi)}. {opt} {oi === item.correct_answer_index && "✓"}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
