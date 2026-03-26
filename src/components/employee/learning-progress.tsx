"use client";

import { BookOpen, HelpCircle, Award, MessageSquare, Check } from "lucide-react";
import type { UserProgress } from "@/lib/supabase/types";

type LearningProgressProps = {
  progress: UserProgress | null;
};

const steps = [
  { key: "has_read" as const, label: "Đọc văn bản", icon: BookOpen },
  { key: "viewed_faq" as const, label: "Xem FAQ", icon: HelpCircle },
  { key: "quiz_passed" as const, label: "Làm quiz", icon: Award },
  { key: "sent_feedback" as const, label: "Góp ý", icon: MessageSquare },
];

export function LearningProgress({ progress }: LearningProgressProps) {
  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => {
        const done = progress?.[step.key] ?? false;
        const Icon = step.icon;

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                  done
                    ? "border-green-500 bg-green-50 text-green-600"
                    : "border-gray-200 bg-white text-gray-400"
                }`}
              >
                {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <span className="text-[10px] text-muted-foreground text-center w-14 leading-tight">
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-0.5 w-6 mx-1 mb-5 ${
                  done ? "bg-green-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
