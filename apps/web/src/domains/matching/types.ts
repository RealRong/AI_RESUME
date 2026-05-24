import type { MatchingResult } from "@ai-resume/shared-types";

export type MatchingDomainState = {
  workspace: {
    jobId: string | null;
    candidateIds: string[];
  };
  results: {
    items: MatchingResult[];
    loading: boolean;
    error: string | null;
  };
};
