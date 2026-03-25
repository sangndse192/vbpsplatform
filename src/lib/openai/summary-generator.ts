import { getOpenAIClient, AI_MODEL } from "./client";
import { SYSTEM_PROMPT, SUMMARY_PROMPT } from "./prompts";
import type { AISummary } from "./types";

export async function generateSummary(documentText: string): Promise<AISummary> {
  const result = await getOpenAIClient().chat.completions.create({
    model: AI_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: SUMMARY_PROMPT + documentText },
    ],
    response_format: { type: "json_object" },
    max_tokens: 2000,
  });

  const content = result.choices[0]?.message?.content;
  if (!content) throw new Error("Empty summary response");

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Failed to parse summary JSON from AI response");
  }

  // Validate required fields
  if (!parsed.why_this_matters || !parsed.who_is_affected || !Array.isArray(parsed.key_points)) {
    throw new Error("Invalid summary format");
  }

  return {
    why_this_matters: String(parsed.why_this_matters),
    who_is_affected: String(parsed.who_is_affected),
    key_points: parsed.key_points.map(String).slice(0, 5),
    processing_status: "completed",
    processed_at: new Date().toISOString(),
  };
}
