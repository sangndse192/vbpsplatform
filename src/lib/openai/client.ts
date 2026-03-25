import OpenAI from "openai";

export const AI_MODEL = "gpt-4o";

let _client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 120_000,
    });
  }
  return _client;
}
