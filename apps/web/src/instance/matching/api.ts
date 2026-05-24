import type { ApiResponse, MatchingResult } from "@ai-resume/shared-types";
import { apiRequest } from "@/lib/api/client";

export function createMatchingRequest(input: {
  jobId: string;
  candidateIds: string[];
}) {
  return apiRequest<ApiResponse<{ results: MatchingResult[] }>>("/api/matchings", {
    method: "POST",
    body: JSON.stringify(input)
  });
}
