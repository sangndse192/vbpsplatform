import { getOpenAIClient, AI_MODEL } from "./client";
import { SYSTEM_PROMPT, QUIZ_PROMPT } from "./prompts";
import type { AIQuizSuggestion } from "./types";

export async function generateQuizzes(documentText: string): Promise<AIQuizSuggestion[]> {
  const result = await getOpenAIClient().chat.completions.create({
    model: AI_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: QUIZ_PROMPT + documentText },
    ],
    response_format: { type: "json_object" },
    max_tokens: 4000,
  });

  const content = result.choices[0]?.message?.content;
  if (!content) throw new Error("Empty quiz response");

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Failed to parse quiz JSON from AI response");
  }
  const obj = parsed as Record<string, unknown>;
  const items: unknown[] = Array.isArray(parsed) ? parsed : (obj.quizzes ?? obj.items ?? []) as unknown[];

  return items
    .filter((item): item is Record<string, unknown> => {
      if (typeof item !== "object" || item === null) return false;
      const q = item as Record<string, unknown>;
      return (
        typeof q.question === "string" &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        typeof q.correct_answer_index === "number" &&
        q.correct_answer_index >= 0 &&
        q.correct_answer_index <= 3
      );
    })
    .map((item) => ({
      question: String(item.question),
      options: (item.options as string[]).map(String) as [string, string, string, string],
      correct_answer_index: Number(item.correct_answer_index) as 0 | 1 | 2 | 3,
    }))
    .slice(0, 5);
}
