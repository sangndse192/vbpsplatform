import { getOpenAIClient, AI_MODEL } from "./client";
import { SYSTEM_PROMPT, FAQ_PROMPT } from "./prompts";
import type { AIFaqSuggestion } from "./types";

export async function generateFaqs(documentText: string): Promise<AIFaqSuggestion[]> {
  const result = await getOpenAIClient().chat.completions.create({
    model: AI_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: FAQ_PROMPT + documentText },
    ],
    response_format: { type: "json_object" },
    max_tokens: 4000,
  });

  const content = result.choices[0]?.message?.content;
  if (!content) throw new Error("Empty FAQ response");

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Failed to parse FAQ JSON from AI response");
  }

  // Handle both { faqs: [...] } and direct array
  const obj = parsed as Record<string, unknown>;
  const items: unknown[] = Array.isArray(parsed) ? parsed as unknown[] : (obj.faqs ?? obj.items ?? []) as unknown[];

  return items
    .filter((item): item is Record<string, unknown> =>
      typeof item === "object" && item !== null && "question" in item && "answer" in item
    )
    .map((item) => ({
      question: String(item.question),
      answer: String(item.answer),
    }))
    .slice(0, 8);
}
