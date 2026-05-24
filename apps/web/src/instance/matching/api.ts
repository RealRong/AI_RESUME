import type { AiProviderConfig, ApiResponse, MatchingResult } from "@ai-resume/shared-types";
import { apiRequest } from "@/lib/api/client";

export function createMatchingRequest(input: {
  jobId: string;
  candidateIds: string[];
}, config?: AiProviderConfig | null) {
  const headers = config?.apiKey.trim()
    ? {
        "x-ai-base-url": config.baseUrl,
        "x-ai-api-key": config.apiKey,
        "x-ai-model": config.model
      }
    : null;

  return apiRequest<ApiResponse<{ results: MatchingResult[] }>>("/api/matchings", {
    method: "POST",
    body: JSON.stringify(input),
    ...(headers ? { headers } : {})
  });
}
