import { z } from "zod";

export const quizSchema = z.object({
  question: z.string().min(1, "Cau hoi khong duoc de trong"),
  options: z
    .array(z.string().min(1, "Lua chon khong duoc de trong"))
    .length(4, "Phai co dung 4 lua chon"),
  correct_answer: z.number().int().min(0).max(3),
  explanation: z.string().optional(),
  sort_order: z.number().int().min(0).optional(),
});

export type QuizInput = z.infer<typeof quizSchema>;
