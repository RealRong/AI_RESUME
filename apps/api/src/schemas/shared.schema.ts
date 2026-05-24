import { z } from "zod";

export const aiProviderConfigSchema = z.object({
  baseUrl: z.string().trim().url(),
  apiKey: z.string().trim().min(1),
  model: z.string().trim().min(1).max(120)
});

export const jobDraftSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(10000),
  requiredSkills: z.array(z.string().trim().min(1)).max(30),
  bonusSkills: z.array(z.string().trim().min(1)).max(30)
});

export const matchingRequestSchema = z.object({
  jobId: z.string().uuid(),
  candidateIds: z.array(z.string().uuid()).min(1).max(3)
});

export const candidateStatusSchema = z.enum([
  "pending",
  "screening_passed",
  "interviewing",
  "hired",
  "rejected"
]);

export const candidateStatusUpdateSchema = z.object({
  status: candidateStatusSchema
});
