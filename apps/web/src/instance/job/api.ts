import type { ApiResponse, Job } from "@ai-resume/shared-types";
import { apiRequest } from "@/lib/api/client";

export function fetchJobsRequest() {
  return apiRequest<ApiResponse<{ items: Job[] }>>("/api/jobs");
}

export function createJobRequest(input: {
  title: string;
  description: string;
  requiredSkills: string[];
  bonusSkills: string[];
}) {
  return apiRequest<ApiResponse<Job>>("/api/jobs", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function updateJobRequest(
  jobId: string,
  input: Partial<{
    title: string;
    description: string;
    requiredSkills: string[];
    bonusSkills: string[];
  }>
) {
  return apiRequest<ApiResponse<Job>>(`/api/jobs/${jobId}`, {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}
