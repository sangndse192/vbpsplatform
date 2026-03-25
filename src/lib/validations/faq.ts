import { z } from "zod";

export const faqSchema = z.object({
  question: z.string().min(10, "Cau hoi phai co it nhat 10 ky tu"),
  answer: z.string().min(20, "Cau tra loi phai co it nhat 20 ky tu"),
  sort_order: z.number().int().min(0).optional(),
});

export type FaqInput = z.infer<typeof faqSchema>;
