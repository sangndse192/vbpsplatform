"use client";

import { useEffect, useState } from "react";
import { Award } from "lucide-react";
import { submitAttempt, getBestScore, getQuizQuestions } from "@/lib/actions/quiz-attempts";
import { QuizStartScreen } from "./quiz-start-screen";
import { QuizQuestion } from "./quiz-question";
import { QuizResults } from "./quiz-results";
import type { DocumentQuiz } from "@/lib/supabase/types";

type Props = {
  documentId: string;
};

type QuizState = "idle" | "started" | "submitted";

export function DocumentQuizTab({ documentId }: Props) {
  const [quizzes, setQuizzes] = useState<DocumentQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [bestScore, setBestScore] = useState<{ score: number; total: number } | null>(null);
  const [state, setState] = useState<QuizState>("idle");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{
    score: number;
    total: number;
    passed: boolean;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      getQuizQuestions(documentId).then((res) =>
        setQuizzes((res.data ?? []) as DocumentQuiz[])
      ),
      getBestScore(documentId).then(setBestScore),
    ]).then(() => setLoading(false));
  }, [documentId]);

  function handleStart() {
    setAnswers({});
    setCurrentIndex(0);
    setResult(null);
    setState("started");
  }

  function handleSelectAnswer(index: number) {
    const quiz = quizzes[currentIndex];
    setAnswers((prev) => ({ ...prev, [quiz.id]: index }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    const res = await submitAttempt(documentId, answers);
    setSubmitting(false);

    if (res.data) {
      setResult({
        score: res.data.score,
        total: res.data.total,
        passed: res.data.passed,
      });
      setState("submitted");
      // Refresh best score
      getBestScore(documentId).then(setBestScore);
    }
  }

  if (loading) {
    return <div className="h-48 animate-pulse rounded-lg bg-gray-100" />;
  }

  if (quizzes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
        <Award className="h-8 w-8" />
        <p>Chua co quiz cho van ban nay</p>
      </div>
    );
  }

  if (state === "idle") {
    return (
      <QuizStartScreen
        questionCount={quizzes.length}
        bestScore={bestScore}
        onStart={handleStart}
      />
    );
  }

  if (state === "submitted" && result) {
    return (
      <QuizResults
        score={result.score}
        total={result.total}
        passed={result.passed}
        answers={answers}
        quizzes={quizzes}
        onRetry={handleStart}
        onBack={() => setState("idle")}
      />
    );
  }

  // Answering state
  const currentQuiz = quizzes[currentIndex];

  return (
    <div>
      {submitting ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          Dang cham diem...
        </div>
      ) : (
        <QuizQuestion
          questionIndex={currentIndex}
          totalQuestions={quizzes.length}
          question={currentQuiz.question}
          options={currentQuiz.options}
          selectedAnswer={answers[currentQuiz.id] ?? null}
          onSelectAnswer={handleSelectAnswer}
          onNext={() => setCurrentIndex((i) => Math.min(i + 1, quizzes.length - 1))}
          onPrev={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
          onSubmit={handleSubmit}
          isLast={currentIndex === quizzes.length - 1}
        />
      )}
    </div>
  );
}
