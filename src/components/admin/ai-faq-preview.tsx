"use client";

import { useState } from "react";
import { Check, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AIFaqSuggestion } from "@/lib/openai/types";

type Props = {
  faqs: AIFaqSuggestion[];
  onApprove: (selected: AIFaqSuggestion[]) => void;
};

type EditableFaq = AIFaqSuggestion & { included: boolean; editing: boolean };

export function AiFaqPreview({ faqs, onApprove }: Props) {
  const [items, setItems] = useState<EditableFaq[]>(
    faqs.map((f) => ({ ...f, included: true, editing: false }))
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

  function updateField(i: number, field: "question" | "answer", value: string) {
    setItems((prev) => prev.map((item, idx) =>
      idx === i ? { ...item, [field]: value } : item
    ));
  }

  function handleApprove() {
    onApprove(items.filter((f) => f.included).map(({ question, answer }) => ({ question, answer })));
  }

  if (items.length === 0) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm">FAQ goi y ({items.filter((f) => f.included).length}/{items.length})</CardTitle>
        <Button size="sm" variant="outline" onClick={handleApprove}>
          <Check className="mr-1 h-3 w-3" />
          Duyet FAQ da chon
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className={`rounded-lg border p-3 text-sm ${item.included ? "" : "opacity-50"}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-1">
                {item.editing ? (
                  <>
                    <Input
                      value={item.question}
                      onChange={(e) => updateField(i, "question", e.target.value)}
                      className="text-sm"
                    />
                    <Textarea
                      value={item.answer}
                      onChange={(e) => updateField(i, "answer", e.target.value)}
                      rows={2}
                      className="text-sm"
                    />
                  </>
                ) : (
                  <>
                    <p className="font-medium">Q: {item.question}</p>
                    <p className="text-muted-foreground">A: {item.answer}</p>
                  </>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleEdit(i)}>
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggle(i)}>
                  {item.included ? <Trash2 className="h-3 w-3 text-red-500" /> : <Check className="h-3 w-3 text-green-600" />}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
