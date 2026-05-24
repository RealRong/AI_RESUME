import { z } from "zod";
import { candidateStatusUpdateSchema } from "./shared.schema";

export const updateCandidateStatusSchema = candidateStatusUpdateSchema;

export const updateCandidateSchema = z.object({
  basic: z
    .object({
      name: z.string().trim().min(1).optional(),
      phone: z.string().trim().min(1).optional(),
      email: z.string().email().optional(),
      city: z.string().trim().min(1).optional()
    })
    .optional(),
  skills: z
    .array(
      z.object({
        name: z.string().trim().min(1),
        type: z.string().trim().min(1)
      })
    )
    .optional(),
  education: z.array(z.unknown()).optional(),
  workExperiences: z.array(z.unknown()).optional(),
  projects: z.array(z.unknown()).optional()
});
