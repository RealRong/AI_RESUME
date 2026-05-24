import type { MatchingResult } from "./matching";
import { z } from "zod";

export const candidateStatuses = [
  "pending",
  "screening_passed",
  "interviewing",
  "hired",
  "rejected"
] as const;

export type CandidateStatus = (typeof candidateStatuses)[number];

export const candidateStatusSchema = z.enum(candidateStatuses);

export const candidateStatusUpdateSchema = z.object({
  status: candidateStatusSchema
});

export type CandidateListItem = {
  id: string;
  name: string | null;
  email: string | null;
  city: string | null;
  status: CandidateStatus;
  skills: string[];
  schools: string[];
  latestOverallScore: number | null;
  uploadedAt: string;
};

export type CandidateMatchingSnapshot = MatchingResult & {
  jobTitle: string | null;
  createdAt: string;
};

export type CandidateDetail = {
  id: string;
  basic: {
    name: string | null;
    phone: string | null;
    email: string | null;
    city: string | null;
  };
  status: CandidateStatus;
  skills: Array<{ name: string; type: string }>;
  education: Array<{
    id: string;
    school: string;
    major: string | null;
    degree: string | null;
    graduationDate: string | null;
  }>;
  workExperiences: Array<{
    id: string;
    companyName: string;
    title: string | null;
    startDate: string | null;
    endDate: string | null;
    summary: string | null;
  }>;
  projects: Array<{
    id: string;
    projectName: string;
    techStack: string[];
    roleSummary: string | null;
    highlights: string[];
  }>;
  matchings: CandidateMatchingSnapshot[];
  pdfPreviewUrl: string | null;
};
