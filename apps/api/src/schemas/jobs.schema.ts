import { jobDraftSchema } from "@ai-resume/shared-types";

export const createJobSchema = jobDraftSchema;
export const updateJobSchema = jobDraftSchema.partial();
