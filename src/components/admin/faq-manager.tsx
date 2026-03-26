"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { createFaq, updateFaq, deleteFaq } from "@/lib/actions/faqs";

type Faq = {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
};

type Props = {
  documentId: string;
  faqs: Faq[];
};

export function FaqManager({ documentId, faqs }: Props) {
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  function handleAdd() {
    if (!question.trim() || !answer.trim()) return;
    startTransition(async () => {
      await createFaq(documentId, { question, answer });
      setQuestion("");
      setAnswer("");
      setShowAdd(false);
    });
  }

  function handleUpdate(id: string) {
    startTransition(async () => {
      await updateFaq(id, documentId, { question, answer });
      setEditingId(null);
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Xóa FAQ này?")) return;
    startTransition(async () => { await deleteFaq(id, documentId); });
  }

  function startEdit(faq: Faq) {
    setEditingId(faq.id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
  }

  return (
    <div className={`space-y-3 ${isPending ? "opacity-70" : ""}`}>
      {faqs.map((faq) =>
        editingId === faq.id ? (
          <Card key={faq.id}>
            <CardContent className="space-y-2 pt-4">
              <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Câu hỏi" />
              <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Trả lời" rows={3} />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleUpdate(faq.id)}><Check className="h-4 w-4 mr-1" />Lưu</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="h-4 w-4 mr-1" />Hủy</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card key={faq.id}>
            <CardContent className="pt-4">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <p className="font-medium text-sm">{faq.question}</p>
                  <p className="text-sm text-muted-foreground mt-1">{faq.answer}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(faq)}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleDelete(faq.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      )}

      {showAdd ? (
        <Card>
          <CardContent className="space-y-2 pt-4">
            <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Câu hỏi" />
            <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Trả lời" rows={3} />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd}><Check className="h-4 w-4 mr-1" />Thêm</Button>
              <Button size="sm" variant="ghost" onClick={() => { setShowAdd(false); setQuestion(""); setAnswer(""); }}>
                <X className="h-4 w-4 mr-1" />Hủy
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" size="sm" onClick={() => { setShowAdd(true); setQuestion(""); setAnswer(""); }}>
          <Plus className="h-4 w-4 mr-1" /> Thêm FAQ
        </Button>
      )}
    </div>
  );
}
