import { z } from "zod";

export type MatchingResult = {
  matchingId: string;
  candidateId: string;
  jobId: string;
  overallScore: number;
  dimensionScores: {
    skillMatch: number;
    experienceRelevance: number;
    educationFit: number;
  };
  summary: string;
  strengths: string[];
  risks: string[];
  evidence: string[];
};

export const matchingRequestSchema = z.object({
  jobId: z.string().uuid(),
  candidateIds: z.array(z.string().uuid()).min(1).max(3)
});
