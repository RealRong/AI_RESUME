import { z } from "zod";

export type Job = {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  bonusSkills: string[];
  createdAt: string;
  updatedAt: string;
};

export type JobDraft = {
  title: string;
  description: string;
  requiredSkills: string[];
  bonusSkills: string[];
};

export const jobDraftSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(10000),
  requiredSkills: z.array(z.string().trim().min(1)).max(30),
  bonusSkills: z.array(z.string().trim().min(1)).max(30)
});
