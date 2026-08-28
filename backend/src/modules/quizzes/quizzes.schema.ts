import { z } from 'zod';

export const SubmitQuizAttemptSchema = z.object({
  timeSpentSeconds: z.number().int().nonnegative().optional().default(0),
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedIndex: z.number().int().min(0),
    })
  ).min(1, 'At least one answer must be submitted.'),
});
