import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractTextFromPdf } from "@/lib/openai/pdf-processor";
import { generateSummary } from "@/lib/openai/summary-generator";
import { generateFaqs } from "@/lib/openai/faq-generator";
import { generateQuizzes } from "@/lib/openai/quiz-generator";
import type { AISummary } from "@/lib/openai/types";

const MAX_RETRIES = 3;
const BACKOFF_BASE_MS = 1000;

async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === MAX_RETRIES - 1) throw err;
      const delay = BACKOFF_BASE_MS * Math.pow(2, attempt);
      console.error(`[AI] ${label} attempt ${attempt + 1} failed, retrying in ${delay}ms`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("Unreachable");
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Auth check: admin only
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const documentId = body.document_id;
  if (!documentId) {
    return NextResponse.json({ error: "document_id required" }, { status: 400 });
  }

  // Fetch document
  const { data: doc, error: docError } = await supabase
    .from("documents")
    .select("id, file_url")
    .eq("id", documentId)
    .single();

  if (docError || !doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }
  if (!doc.file_url) {
    return NextResponse.json({ error: "No PDF uploaded for this document" }, { status: 400 });
  }

  // Set status to pending
  await supabase
    .from("documents")
    .update({
      ai_summary: { processing_status: "pending" } satisfies Partial<AISummary>,
    })
    .eq("id", documentId);

  try {
    // Get signed URL for PDF
    const { data: urlData } = await supabase.storage
      .from("documents")
      .createSignedUrl(doc.file_url, 3600);

    if (!urlData?.signedUrl) {
      throw new Error("Failed to create signed URL for PDF");
    }

    // Step 1: Extract text
    const documentText = await withRetry(
      () => extractTextFromPdf(urlData.signedUrl),
      "PDF extraction"
    );

    // Step 2: Generate summary, FAQs, quizzes in parallel
    const [summary, faqs, quizzes] = await Promise.all([
      withRetry(() => generateSummary(documentText), "Summary generation"),
      withRetry(() => generateFaqs(documentText), "FAQ generation"),
      withRetry(() => generateQuizzes(documentText), "Quiz generation"),
    ]);

    // Step 3: Store results
    // Save summary to document
    await supabase
      .from("documents")
      .update({ ai_summary: summary })
      .eq("id", documentId);

    // Delete existing AI-generated FAQs/quizzes before inserting new ones
    await Promise.all([
      supabase.from("document_faqs").delete().eq("document_id", documentId),
      supabase.from("document_quizzes").delete().eq("document_id", documentId),
    ]);

    // Create FAQ records
    if (faqs.length > 0) {
      const faqRecords = faqs.map((faq, i) => ({
        document_id: documentId,
        question: faq.question,
        answer: faq.answer,
        sort_order: i,
      }));
      await supabase.from("document_faqs").insert(faqRecords);
    }

    // Create quiz records
    if (quizzes.length > 0) {
      const quizRecords = quizzes.map((quiz, i) => ({
        document_id: documentId,
        question: quiz.question,
        options: quiz.options,
        correct_answer: quiz.correct_answer_index,
        sort_order: i,
      }));
      await supabase.from("document_quizzes").insert(quizRecords);
    }

    return NextResponse.json({
      status: "completed",
      result: {
        summary_generated: true,
        faqs_count: faqs.length,
        quizzes_count: quizzes.length,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[AI] Processing failed:", message);

    // Set failed status
    await supabase
      .from("documents")
      .update({
        ai_summary: {
          processing_status: "failed",
          error: message,
          processed_at: new Date().toISOString(),
        } satisfies Partial<AISummary> & { error: string },
      })
      .eq("id", documentId);

    return NextResponse.json({ status: "failed", error: message }, { status: 500 });
  }
}
