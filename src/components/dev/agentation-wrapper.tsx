"use client";

import { Agentation } from "agentation";

/**
 * Sends annotation data to the Cloudflare Worker webhook.
 * Includes auth header if NEXT_PUBLIC_WEBHOOK_SECRET is set.
 */
async function sendToWebhook(
  webhookUrl: string,
  webhookSecret: string | undefined,
  payload: Record<string, unknown>,
) {
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(webhookSecret && { "X-Agentation-Secret": webhookSecret }),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) console.error("Agentation webhook failed:", res.status);
  } catch (err) {
    console.error("Agentation webhook error:", err);
  }
}

export function AgentationWrapper() {
  const webhookUrl = process.env.NEXT_PUBLIC_AGENTATION_WEBHOOK;
  const webhookSecret = process.env.NEXT_PUBLIC_WEBHOOK_SECRET;
  if (!webhookUrl) return null;

  return (
    <Agentation
      onSubmit={async (output, annotations) => {
        await sendToWebhook(webhookUrl, webhookSecret, {
          event: "submit",
          url: window.location.href,
          annotations,
          output,
        });
      }}
      onAnnotationAdd={async (annotation) => {
        await sendToWebhook(webhookUrl, webhookSecret, {
          event: "annotation.add",
          url: window.location.href,
          annotation,
        });
      }}
      copyToClipboard={false}
    />
  );
}
