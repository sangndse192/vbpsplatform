"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { createQuiz, updateQuiz, deleteQuiz } from "@/lib/actions/quizzes";

type Quiz = {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string | null;
  sort_order: number;
};

type Props = {
  documentId: string;
  quizzes: Quiz[];
};

function QuizForm({
  onSubmit,
  onCancel,
  initial,
  submitLabel,
}: {
  onSubmit: (data: { question: string; options: string[]; correct_answer: number; explanation?: string }) => void;
  onCancel: () => void;
  initial?: Quiz;
  submitLabel: string;
}) {
  const [question, setQuestion] = useState(initial?.question || "");
  const [options, setOptions] = useState<string[]>(initial?.options || ["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(initial?.correct_answer ?? 0);
  const [explanation, setExplanation] = useState(initial?.explanation || "");

  return (
    <Card>
      <CardContent className="space-y-3 pt-4">
        <div className="space-y-1">
          <Label>Câu hỏi</Label>
          <Input value={question} onChange={(e) => setQuestion(e.target.value)} />
        </div>
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="radio"
              name="correct"
              checked={correctAnswer === i}
              onChange={() => setCorrectAnswer(i)}
              className="accent-indigo-600"
            />
            <Input
              value={opt}
              onChange={(e) => {
                const next = [...options];
                next[i] = e.target.value;
                setOptions(next);
              }}
              placeholder={`Lựa chọn ${String.fromCharCode(65 + i)}`}
              className="flex-1"
            />
          </div>
        ))}
        <div className="space-y-1">
          <Label>Giải thích (tùy chọn)</Label>
          <Input value={explanation} onChange={(e) => setExplanation(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => onSubmit({ question, options, correct_answer: correctAnswer, explanation: explanation || undefined })}
          >
            <Check className="h-4 w-4 mr-1" />{submitLabel}
          </Button>
          <Button size="sm" variant="ghost" onClick={onCancel}>
            <X className="h-4 w-4 mr-1" />Hủy
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function QuizManager({ documentId, quizzes }: Props) {
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  function handleAdd(data: { question: string; options: string[]; correct_answer: number; explanation?: string }) {
    startTransition(async () => {
      await createQuiz(documentId, data);
      setShowAdd(false);
    });
  }

  function handleUpdate(id: string, data: { question: string; options: string[]; correct_answer: number; explanation?: string }) {
    startTransition(async () => {
      await updateQuiz(id, documentId, data);
      setEditingId(null);
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Xóa câu hỏi này?")) return;
    startTransition(async () => { await deleteQuiz(id, documentId); });
  }

  return (
    <div className={`space-y-3 ${isPending ? "opacity-70" : ""}`}>
      {quizzes.map((quiz) =>
        editingId === quiz.id ? (
          <QuizForm
            key={quiz.id}
            initial={quiz}
            onSubmit={(data) => handleUpdate(quiz.id, data)}
            onCancel={() => setEditingId(null)}
            submitLabel="Lưu"
          />
        ) : (
          <Card key={quiz.id}>
            <CardContent className="pt-4">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <p className="font-medium text-sm">{quiz.question}</p>
                  <div className="mt-2 space-y-1">
                    {quiz.options.map((opt, i) => (
                      <p key={i} className={`text-sm ${i === quiz.correct_answer ? "text-green-600 font-medium" : "text-muted-foreground"}`}>
                        {String.fromCharCode(65 + i)}. {opt}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(quiz.id)}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleDelete(quiz.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      )}

      {showAdd ? (
        <QuizForm onSubmit={handleAdd} onCancel={() => setShowAdd(false)} submitLabel="Thêm" />
      ) : (
        <Button variant="outline" size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4 mr-1" /> Thêm câu hỏi
        </Button>
      )}
    </div>
  );
}
