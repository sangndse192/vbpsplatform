"use client";

import { useState } from "react";
import { Check, X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { AISummary } from "@/lib/openai/types";

type Props = {
  summary: AISummary;
  onApprove: (edited: AISummary) => void;
  onReject: () => void;
};

export function AiSummaryPreview({ summary, onApprove, onReject }: Props) {
  const [editing, setEditing] = useState(false);
  const [why, setWhy] = useState(summary.why_this_matters);
  const [who, setWho] = useState(summary.who_is_affected);
  const [points, setPoints] = useState(summary.key_points.join("\n"));

  function handleApprove() {
    onApprove({
      ...summary,
      why_this_matters: why,
      who_is_affected: who,
      key_points: points.split("\n").filter(Boolean),
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm">Tom tat AI</CardTitle>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(!editing)}>
            <Pencil className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" onClick={handleApprove}>
            <Check className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={onReject}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {editing ? (
          <>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Tai sao quan trong</label>
              <Textarea value={why} onChange={(e) => setWhy(e.target.value)} rows={2} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Doi tuong anh huong</label>
              <Textarea value={who} onChange={(e) => setWho(e.target.value)} rows={2} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Diem chinh (moi dong 1 diem)</label>
              <Textarea value={points} onChange={(e) => setPoints(e.target.value)} rows={4} />
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="font-medium">Tai sao quan trong</p>
              <p className="text-muted-foreground">{why}</p>
            </div>
            <div>
              <p className="font-medium">Doi tuong anh huong</p>
              <p className="text-muted-foreground">{who}</p>
            </div>
            <div>
              <p className="font-medium">Diem chinh</p>
              <ul className="list-disc pl-4 text-muted-foreground">
                {points.split("\n").filter(Boolean).map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
