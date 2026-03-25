import { z } from "zod";

export const createDocumentSchema = z.object({
  title: z.string().min(1, "Tieu de khong duoc de trong"),
  doc_number: z.string().optional(),
  doc_type: z.enum(["policy", "regulation", "guideline", "circular", "decision", "other"]),
  urgency: z.enum(["normal", "important", "urgent"]),
  target: z.enum(["all", "branch", "department"]),
  summary: z.string().optional(),
  content: z.string().optional(),
  issued_date: z.string().optional(),
  effective_date: z.string().optional(),
});

export const updateDocumentSchema = createDocumentSchema.partial();

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
