import * as pdfParse from "pdf-parse";

const MAX_TEXT_LENGTH = 30_000;

/**
 * Extract text from a PDF by downloading and parsing with pdf-parse.
 * Falls back to truncating if text exceeds max length to avoid token limits.
 */
export async function extractTextFromPdf(signedUrl: string): Promise<string> {
  const response = await fetch(signedUrl);
  if (!response.ok) throw new Error(`Failed to download PDF: ${response.status}`);

  const buffer = Buffer.from(await response.arrayBuffer());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdf = (pdfParse as any).default ?? pdfParse;
  const result = await (pdf as unknown as (buf: Buffer) => Promise<{ text: string }>)(buffer);

  if (!result.text || result.text.trim().length === 0) {
    throw new Error("PDF extraction returned empty text — file may be image-based");
  }

  // Truncate to avoid token limit issues
  const text = result.text.trim();
  if (text.length > MAX_TEXT_LENGTH) {
    return text.slice(0, MAX_TEXT_LENGTH) + "\n\n[Van ban da duoc cat ngan do qua dai]";
  }

  return text;
}
