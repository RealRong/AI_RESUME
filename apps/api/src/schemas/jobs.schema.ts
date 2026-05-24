import { jobDraftSchema } from "./shared.schema";

export const createJobSchema = jobDraftSchema;
export const updateJobSchema = jobDraftSchema.partial();
