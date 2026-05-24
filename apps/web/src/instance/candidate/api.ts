import type {
  ApiResponse,
  CandidateDetail,
  CandidateListItem
} from "@ai-resume/shared-types";
import { apiRequest } from "@/lib/api/client";
import type { CandidateListQueryInput } from "../types";

function toQueryString(input: CandidateListQueryInput = {}) {
  const searchParams = new URLSearchParams();

  if (input.page) searchParams.set("page", String(input.page));
  if (input.pageSize) searchParams.set("pageSize", String(input.pageSize));
  if (input.keyword) searchParams.set("keyword", input.keyword);
  if (input.sortBy) searchParams.set("sortBy", input.sortBy);
  if (input.sortOrder) searchParams.set("sortOrder", input.sortOrder);

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export function fetchCandidateListRequest(input?: CandidateListQueryInput) {
  return apiRequest<ApiResponse<{ items: CandidateListItem[] }>>(
    `/api/candidates${toQueryString(input)}`
  );
}

export function fetchCandidateDetailRequest(candidateId: string) {
  return apiRequest<ApiResponse<CandidateDetail>>(`/api/candidates/${candidateId}`);
}
